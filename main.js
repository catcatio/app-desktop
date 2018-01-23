const electron = require('electron')
const { toCurrency } = require('./util')
const fetcher = require('@rabbotio/fetcher')

const app = electron.app
let isInit = false

const getTitle = (pairs, from, to) => {
  const DEFAULT_ERROR_VALUE = { title: 'N/A', price: 0 }
  if (!pairs) return DEFAULT_ERROR_VALUE

  let { price } = getPrice(pairs, from, to)
  if (!pairs) return DEFAULT_ERROR_VALUE

  const title = toCurrency(price)
  return { title, price }
}

const getPrice = (pairs, from, to) => {
  const pair = `${from}${to}`
  return pairs.filter(item => item.symbol === pair)[0] || null
}

const fetchAndUpdate = async tray => {
  const pairs = await fetcher.getJSON('https://api.binance.com/api/v3/ticker/price').catch(console.error)
  const { lprice } = await fetcher.getJSON(`https://cex.io/api/last_price/ETH/USD`).catch(console.error)

  if (!pairs || !lprice) return tray.setTitle(`Hm!!`)

  const ETH_USDT = getTitle(pairs, 'ETH', 'USDT')
  const XLM_ETH = toCurrency(getTitle(pairs, 'XLM', 'ETH').price, 6, 6)
  const CEX_ETH_USD = toCurrency(lprice)
  const CEX_DIFF = toCurrency(lprice - ETH_USDT.price)

  // USD
  tray.setTitle(`ETH ${CEX_ETH_USD} (${CEX_DIFF}) | XLM ${XLM_ETH}`)

  // THB
  // 932.91 -(33.124674405891244)-> 30,902.34
  // 103.89 -(33.124651073250553)-> 3,441.32
  // 34,343.66
  // 0.747497229775266
  // 1000.00 -> 0.74562100 -> 1337.7976 (44,314.109920982732084)
  // Fee 0.001876229775266 = 0.25% = $2.5
  // 0.74562100 ETH for 34,298.57 THB (46,000)
  const USD_THB = 33.124674405891244
  // 1036.53 -[33.114333400866352]-> 34,324
  // 0.67857100 -[48500.99]-> 32829.08687208

  const ETH_THB = toCurrency(ETH_USDT.price * USD_THB)
  const CEX_ETH_THB = toCurrency(lprice * USD_THB)
  const CEX_THB_DIFF = toCurrency((lprice - ETH_USDT.price) * USD_THB)
  tray.setToolTip(`ETH ฿${ETH_THB}-${CEX_ETH_THB} (${CEX_THB_DIFF})`)
}

const createWindow = () => {
  // Init
  isInit = true

  // Tray
  const { shell, Tray, Menu } = require('electron')
  const tray = new Tray('./img/kat-r-32.png')
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'About',
      click: () => {
        shell.openExternal('https://rabbot.io/')
      }
    },
    {
      label: 'Exit',
      click: () => app.exit()
    }
  ])
  tray.setToolTip('CatCat by @katopz')
  tray.setContextMenu(contextMenu)

  // Fetch
  tray.setTitle(`...`)
  fetchAndUpdate(tray)
  setInterval(() => fetchAndUpdate(tray), 5000)
}

app.on('ready', createWindow)
app.on('window-all-closed', () => process.platform !== 'darwin' && app.quit())
app.on('activate', () => !isInit && createWindow())
