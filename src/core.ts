import { consola } from 'consola'
import dayjs from 'dayjs'

// region Constants & Types

export const logger = consola.withDefaults({
  tag: 'GRTF',
})

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

/**
 * Check if the node is a <relative-time> element or sits inside one (including Shadow DOM).
 * This is efficient for attribute or characterData mutations.
 */
export function isInsideRelativeTime(node: Node | null): boolean {
  if (!node)
    return false

  // 1. Light DOM check
  const element = node instanceof Element ? node : node.parentElement
  if (element?.closest('relative-time'))
    return true

  // 2. Shadow DOM check
  const root = node.getRootNode()
  return root instanceof ShadowRoot && isRelativeTimeElement(root.host)
}

/**
 * Check if the element contains any <relative-time> descendants.
 * This is useful for childList mutations where a container might be added.
 */
export function isContainingRelativeTime(node: Node | null): boolean {
  return node instanceof Element && node.getElementsByTagName('relative-time').length > 0
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
  const startTime = performance.now()
  const datetime = element.getAttribute('datetime')

  if (!datetime)
    return

  const date = dayjs(datetime)
  if (!date.isValid())
    return

  element.title = date.format(tooltipFormat)

  try {
    let updated = false
    if (element.shadowRoot) {
      const newContent = date.format(displayFormat)
      if (element.shadowRoot.innerHTML !== newContent) {
        element.shadowRoot.innerHTML = newContent
        updated = true
      }
    }
    else {
      // Fallback to text content if shadow root is not available
      const newContent = date.format(displayFormat)
      if (element.textContent !== newContent) {
        element.textContent = newContent
        updated = true
      }
    }

    if (updated) {
      const duration = performance.now() - startTime
      logger.debug(`Updated element:`, element, `in ${duration.toFixed(3)}ms`)
    }
  }
  catch (error) {
    logger.warn('Error updating element', element, error)
  }
}

/** Restore the native behavior of the relative-time element */
export function restoreNativeFormat(element: RelativeTimeElement) {
  try {
    element.connectedCallback?.()
  }
  catch (error) {
    logger.warn('Error restoring element', element, error)
  }
}

/** Iterate and update all relative-time elements in the DOM */
export function updateAllElements(
  displayFormat: string,
  tooltipFormat: string,
) {
  const startTime = performance.now()
  const elements = document.querySelectorAll<RelativeTimeElement>(`relative-time`)

  if (elements.length === 0)
    return

  let updateCount = 0
  for (const element of elements) {
    if (shouldPreserveNativeFormat(element)) {
      restoreNativeFormat(element)
    }
    else {
      applyCustomFormat(element, displayFormat, tooltipFormat)
      updateCount++
    }
  }

  const duration = performance.now() - startTime
  if (updateCount > 0) {
    logger.debug({
      type: 'success',
      message: `Total updated: ${updateCount} elements in ${duration.toFixed(3)}ms`,
    })
  }
}

// endregion Core Functions
