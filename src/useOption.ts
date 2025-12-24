import { effect, signal } from 'alien-signals'
import { showOptionModal } from './ui'

/** Option management Hook */
export function useOption(
  key: string,
  title: string,
  defaultValue: string,
  type: 'text' | 'boolean' = 'text',
) {
  // Get initial value from GM storage or use default
  const initialValue = typeof GM_getValue !== 'undefined'
    ? GM_getValue(key, defaultValue)
    : defaultValue

  // Create reactive signal for the option value
  const option = signal(initialValue)

  // If GM API is available, setup persistence and menu
  if (typeof GM_setValue !== 'undefined' && typeof GM_registerMenuCommand !== 'undefined') {
    // Auto-save to GM storage when signal changes
    effect(() => {
      GM_setValue(key, option())
    })

    // Register menu command
    GM_registerMenuCommand(title, async () => {
      // Read current value
      const currentVal = option()
      const result = await showOptionModal(title, currentVal, type)
      if (result !== null) {
        // Update signal, this will auto-trigger persistence and UI updates
        option(result)
      }
    })
  }

  // Return signal getter/setter function
  return option
}
