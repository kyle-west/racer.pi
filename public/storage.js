export function interpolate (value) {
  try {
    return JSON.parse(value)
  } catch (_) {
    return value
  }
}

function mergeByPath (oldData, newData) {
  if (!oldData || oldData === newData) return newData
  if (Array.isArray(newData)) {
    return [...(oldData||[]), ...newData]
  }
  return Object.fromEntries(Object.entries(newData).map(([path, value]) => {
    const data = oldData[path]  
    if (typeof value === 'object' && value !== null) {
      return [path, {...data, ...mergeByPath(data, value)}]
    }
    return [path, value]
  }))
}

function createStorage (type) {
  function get (key, defaultValue = null) {
    const value = window[type].getItem(key)
    return value ? interpolate(value) : defaultValue
  }
  
  function set (key, value) {
    return window[type].setItem(key, JSON.stringify(value))
  }

  function merge(key, newData) {
    const data = mergeByPath(get(key, newData), newData)
    return set(key, data)
  }

  return { get, set, merge, clear: () => window[type].clear() }
}

export const sessionStorage = createStorage('sessionStorage')
export const localStorage = createStorage('localStorage')
