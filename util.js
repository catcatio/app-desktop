const toCurrency = value => {
  return Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

module.exports = { toCurrency }
