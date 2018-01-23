const toCurrency = (value, maximumFractionDigits = 2, minimumFractionDigits = 2) => {
  return Number(value).toLocaleString(undefined, { minimumFractionDigits, maximumFractionDigits })
}

module.exports = { toCurrency }
