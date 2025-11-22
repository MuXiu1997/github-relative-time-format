import dayjs from 'dayjs'

// region Constants & Types

/** Extended HTMLElement interface to include specific methods for relative-time elements */
export interface RelativeTimeElement extends HTMLElement {
  connectedCallback?: () => void
  disconnectedCallback?: () => void
  datetime?: string
  format?: string
}

// endregion Constants & Types

// region Core Functions

/** Check if the element is a valid relative-time custom element */
export function isRelativeTimeElement(element: unknown): element is RelativeTimeElement {
  return element instanceof HTMLElement && element.tagName === 'RELATIVE-TIME'
}

/** Determine if the element should preserve its native format based on attributes */
export function shouldPreserveNativeFormat(element: RelativeTimeElement): boolean {
  const format = element.getAttribute('format')
  return format === 'duration' || format === 'elapsed'
}

/** Apply custom format to a single relative-time element */
export function applyCustomFormat(
  element: RelativeTimeElement,
  displayFormat: string,
  tooltipFormat: string,
) {
  const datetime = element.getAttribute('datetime')

  if (!datetime)
    return

  const date = dayjs(datetime)
  if (!date.isValid())
    return

  element.title = date.format(tooltipFormat)

  try {
    // Try to stop the native component's update timer
    // Use optional chaining to prevent the method from not existing
    element.disconnectedCallback?.()

    if (element.shadowRoot) {
      element.shadowRoot.innerHTML = date.format(displayFormat)
    }
    else {
      // Fallback to text content if shadow root is not available
      element.textContent = date.format(displayFormat)
    }
  }
  catch (error) {
    console.warn('[GRTF] Error updating element', element, error)
  }
}

/** Restore the native behavior of the relative-time element */
export function restoreNativeFormat(element: RelativeTimeElement) {
  try {
    element.connectedCallback?.()
  }
  catch (error) {
    console.warn('[GRTF] Error restoring element', element, error)
  }
}

/** Iterate and update all relative-time elements in the DOM */
export function updateAllElements(displayFormat: string, tooltipFormat: string) {
  const elements = document.querySelectorAll<RelativeTimeElement>(`relative-time`)

  if (elements.length === 0)
    return

  for (const element of elements) {
    if (shouldPreserveNativeFormat(element))
      restoreNativeFormat(element)
    else applyCustomFormat(element, displayFormat, tooltipFormat)
  }
}

// endregion Core Functions
