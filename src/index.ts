import { effect } from 'alien-signals'
import { debounce } from 'ts-debounce'
import { isRelativeTimeElement, updateAllElements } from './core'
import { useOption } from './useOption'

// region Main

/** Main entry point for the userscript */
function main() {
  // Options
  const displayFormatOption = useOption(
    'DISPLAY_FORMAT',
    'Change display format',
    'YY-MM-DD HH:mm',
  )
  const tooltipFormatOption = useOption(
    'TOOLTIP_FORMAT',
    'Change tooltip format',
    'YYYY-MM-DD HH:mm:ss',
  )

  // Core Update Logic
  // This function reads the latest signal values and updates DOM
  const runUpdate = () => {
    updateAllElements(displayFormatOption(), tooltipFormatOption())
  }

  // Reactive: Auto-update when options change
  // effect will auto-track signals used in runUpdate (displayFormatOption, tooltipFormatOption)
  effect(() => {
    runUpdate()
  })

  // Debounced: For DOM changes updates (MutationObserver)
  // Debounce is necessary as DOM changes can be frequent
  const debouncedUpdate = debounce(runUpdate, 100)

  /** Initialize MutationObserver to monitor DOM changes for new relative-time elements */
  const initObserver = () => {
    const observer = new MutationObserver((mutations) => {
      let shouldUpdate = false
      for (const mutation of mutations) {
        if (isRelativeTimeElement(mutation.target)) {
          shouldUpdate = true
          break
        }
      }
      if (shouldUpdate) {
        // DOM changed, we need to re-run update logic
        // runUpdate will read current signal values
        debouncedUpdate()
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['datetime', 'format'],
    })
  }

  initObserver()
}

// endregion Main

main()
