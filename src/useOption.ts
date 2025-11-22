/** Option management Hook */
export function useOption(
  key: string,
  title: string,
  defaultValue: string,
  onChange?: (value: string) => void,
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
    set value(v: string) {
      value = v
      GM_setValue(key, v)
      onChange?.(v)
    },
  }

  GM_registerMenuCommand(title, () => {
    // eslint-disable-next-line no-alert
    const result = prompt(title, value)
    if (result !== null) {
      ref.value = result
    }
  })

  return ref
}
