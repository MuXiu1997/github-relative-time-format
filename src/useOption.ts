import { isNil } from 'lodash-es'

/** Option management Hook */
export function useOption<T extends string | number | boolean>(
  key: string,
  title: string,
  defaultValue: T,
) {
  if (typeof GM_getValue === 'undefined') {
    return {
      value: defaultValue,
    }
  }

  let value = GM_getValue(key, defaultValue)
  const ref = {
    get value() {
      return value
    },
    set value(v: T) {
      value = v
      GM_setValue(key, v as string & number & boolean)
      location.reload() // Keep refreshing here to ensure the state is completely updated
    },
  }

  GM_registerMenuCommand(title, () => {
    const result = prompt(title, String(value))
    if (!isNil(result)) {
      // Simple type conversion handling, assuming mainly string configurations
      ref.value = result as T
    }
  })

  return ref
}
