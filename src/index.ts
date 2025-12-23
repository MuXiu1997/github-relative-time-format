import { effect, computed } from 'alien-signals'
import { LogLevels } from 'consola'
import { debounce } from 'ts-debounce'
import { version } from '../package.json'
import { isContainingRelativeTime, isInsideRelativeTime, logger, updateAllElements } from './core'
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
  const debugLogOption = useOption(
    'DEBUG_LOG',
    'Enable debug log (true / false)',
    'false',
  )
  const loggerLevel = computed(() => debugLogOption() === 'true' ? LogLevels.verbose : LogLevels.info)

  // Core Update Logic
  // This function reads the latest signal values and updates DOM
  const runUpdate = () => {
    updateAllElements(
      displayFormatOption(),
      tooltipFormatOption(),
    )
  }

  // Reactive: Auto-update when options change
  // effect will auto-track signals used in runUpdate (displayFormatOption, tooltipFormatOption)
  effect(() => {
    runUpdate()
  })

  // Reactive: Update logger level when option changes
  // effect will auto-track loggerLevel signal
  effect(() => {
    logger.level = loggerLevel()
  })

  logger.info(`GitHub Relative Time Format(v${version}) is loaded`)

  // Debounced: For DOM changes updates (MutationObserver)
  // Debounce is necessary as DOM changes can be frequent
  const debouncedUpdate = debounce(runUpdate, 100)

  /** Initialize MutationObserver to monitor DOM changes for new relative-time elements */
  const initObserver = () => {
    const observer = new MutationObserver((mutations) => {
      let shouldUpdate = false
      for (const mutation of mutations) {
        const { target, type } = mutation
        if (type === 'attributes' || type === 'characterData') {
          if (isInsideRelativeTime(target)) {
            shouldUpdate = true
            break
          }
        }
        else if (type === 'childList') {
          if (isInsideRelativeTime(target) || isContainingRelativeTime(target)) {
            shouldUpdate = true
            break
          }
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
      characterData: true,
      attributeFilter: ['datetime', 'format'],
    })
  }

  initObserver()
}

// endregion Main

main()
