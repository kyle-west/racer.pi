module.exports = {
  interpolate: (str) => {
    const num = parseFloat(str)
    return isNaN(num) ? str : num;
  }
}