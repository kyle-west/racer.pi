function interpolate (value) {
  try {
    return JSON.parse(value)
  } catch (_) {
    return value
  }
}

function createStorage (type) {
  function get (key, defaultValue = null) {
    const value = window[type].getItem(key)
    return value ? interpolate(value) : defaultValue
  }
  
  function set (key, value) {
    return window[type].setItem(key, JSON.stringify(value))
  }

  return { get, set }
}

export const sessionStorage = createStorage('sessionStorage')
export const localStorage = createStorage('localStorage')
