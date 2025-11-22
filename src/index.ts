import dayjs from 'dayjs'
import { debounce } from 'lodash-es'
import { useOption } from './useOption'

// region Constants & Types

/** Attribute for processed elements */
const PROCESSED_ATTR = 'data-grtf-processed'

/** Extended HTMLElement interface to include specific methods for relative-time elements */
interface RelativeTimeElement extends HTMLElement {
  disconnectedCallback?: () => void
  datetime?: string
  format?: string
}

// endregion Constants & Types

// region Core Functions

/** Process a relative-time element */
function processRelativeTimeElement(
  e: RelativeTimeElement,
  displayFormat: string,
  tooltipFormat: string,
) {
  e.setAttribute(PROCESSED_ATTR, 'true')

  const datetime = e.getAttribute('datetime')
  const format = e.getAttribute('format')

  if (format === 'duration' || format === 'elapsed') return
  if (!datetime) return

  const dateObj = dayjs(datetime)
  if (!dateObj.isValid()) return

  e.title = dateObj.format(tooltipFormat)

  try {
    // Try to stop the native component's update timer
    // Use optional chaining to prevent the method from not existing
    e.disconnectedCallback?.()

    if (e.shadowRoot) {
      e.shadowRoot.innerHTML = dateObj.format(displayFormat)
    } else {
      // Fallback to text content if shadow root is not available
      e.textContent = dateObj.format(displayFormat)
    }
  } catch (error) {
    console.debug('[GRTF] Error updating element', e, error)
  }
}

/** Replace the text of relative-time elements */
function replaceRelativeTimeText(displayFormat: string, tooltipFormat: string) {
  const relativeTimeElements = document.querySelectorAll<RelativeTimeElement>(
    `relative-time:not([${PROCESSED_ATTR}])`,
  )

  if (relativeTimeElements.length === 0) return

  for (const e of relativeTimeElements) {
    processRelativeTimeElement(e, displayFormat, tooltipFormat)
  }
}

// endregion Core Functions

// region Main

function main() {
  // Options
  const DISPLAY_FORMAT = useOption(
    'DISPLAY_FORMAT',
    'Change display format',
    'YY-MM-DD HH:mm',
  )
  const TOOLTIP_FORMAT = useOption(
    'TOOLTIP_FORMAT',
    'Change tooltip format',
    'YYYY-MM-DD HH:mm:ss',
  )

  // Event Handlers
  const handleUpdate = debounce(() => {
    replaceRelativeTimeText(DISPLAY_FORMAT.value, TOOLTIP_FORMAT.value)
  }, 200)

  const setupObserver = () => {
    const observer = new MutationObserver(handleUpdate)
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })
  }

  // Initialization
  replaceRelativeTimeText(DISPLAY_FORMAT.value, TOOLTIP_FORMAT.value)
  setupObserver()
}

// endregion Main

main()
