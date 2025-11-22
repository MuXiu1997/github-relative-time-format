import { debounce } from 'ts-debounce'
import { isRelativeTimeElement, updateAllElements } from './core'
import { useOption } from './useOption'

// region Main

/** Main entry point for the userscript */
function main() {
  /** Debounced update function to prevent performance issues during rapid DOM changes */
  let debouncedUpdate: () => void

  /** Callback triggered when user options change */
  function onOptionChange() {
    debouncedUpdate()
  }

  // Options
  /** Configuration for the displayed date format */
  const displayFormatOption = useOption(
    'DISPLAY_FORMAT',
    'Change display format',
    'YY-MM-DD HH:mm',
    onOptionChange,
  )
  /** Configuration for the tooltip date format */
  const tooltipFormatOption = useOption(
    'TOOLTIP_FORMAT',
    'Change tooltip format',
    'YYYY-MM-DD HH:mm:ss',
    onOptionChange,
  )

  // Event Handlers
  debouncedUpdate = debounce(() => {
    updateAllElements(displayFormatOption.value, tooltipFormatOption.value)
  }, 100)

  /** Initialize MutationObserver to monitor DOM changes for new relative-time elements */
  const initObserver = () => {
    const observer = new MutationObserver((mutations) => {
      let shouldUpdate = false
      for (const mutation of mutations) {
        const target = mutation.target
        if (isRelativeTimeElement(target)) {
          shouldUpdate = true
          break
        }
      }
      if (shouldUpdate)
        debouncedUpdate()
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['datetime', 'format'],
    })
  }

  // Initialization
  updateAllElements(displayFormatOption.value, tooltipFormatOption.value)
  initObserver()
}

// endregion Main

main()
