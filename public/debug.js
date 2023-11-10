window.DEBUG = window.DEBUG || {}

DEBUG.reset = DEBUG.reset || (() => {
  localStorage.clear()
  window.location.reload()
})

DEBUG.preload = DEBUG.preload || {
  cars: (() => {
    fetch('/dev/preload/cars')
      .then(res => res.json())
      .then(data => {
        localStorage.setItem('car-group', JSON.stringify(data))
        window.location.reload()
      })
  })
}