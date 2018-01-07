const electron = require('electron')
const { toCurrency } = require('./util')
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
  const fetcher = require('@rabbotio/fetcher')
  const pairs = await fetcher.getJSON('https://api.binance.com/api/v3/ticker/price').catch(() => {
    tray.setTitle(`Hm!!`)
  })

  const ETH_USDT = getTitle(pairs, 'ETH', 'USDT')
  const XLM_ETH = toCurrency(getTitle(pairs, 'XLM', 'ETH').price * ETH_USDT.price)
  tray.setTitle(`ETH $${ETH_USDT.title} | XLM $${XLM_ETH}`)
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
