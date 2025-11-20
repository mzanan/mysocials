import { NextResponse } from 'next/server'
import { getCachedData, setCachedData } from '@/lib/cache'

interface Chart {
  id: string
  symbol: string
  fullSymbol: string
  widgetUrl: string
}

const cryptos = [
  { symbol: 'BTC', fullSymbol: 'BTCUSDT' },
  { symbol: 'ETH', fullSymbol: 'ETHUSDT' },
  { symbol: 'SOL', fullSymbol: 'SOLUSDT' },
  { symbol: 'BNB', fullSymbol: 'BNBUSDT' },
  { symbol: 'XRP', fullSymbol: 'XRPUSDT' },
  { symbol: 'ADA', fullSymbol: 'ADAUSDT' },
  { symbol: 'DOGE', fullSymbol: 'DOGEUSDT' },
  { symbol: 'MATIC', fullSymbol: 'MATICUSDT' },
  { symbol: 'DOT', fullSymbol: 'DOTUSDT' },
  { symbol: 'AVAX', fullSymbol: 'AVAXUSDT' },
  { symbol: 'LINK', fullSymbol: 'LINKUSDT' },
  { symbol: 'UNI', fullSymbol: 'UNIUSDT' },
]

export async function GET() {
  try {
    const cached = getCachedData<{ charts: Chart[] }>('trading_charts')
    if (cached) {
      return NextResponse.json(cached)
    }

    const charts = cryptos.map((crypto, index) => ({
      id: `chart-${index}`,
      symbol: crypto.symbol,
      fullSymbol: crypto.fullSymbol,
      widgetUrl: `https://s.tradingview.com/embed-widget/mini-symbol-overview/?locale=en#%7B%22symbol%22%3A%22${crypto.fullSymbol}%22%2C%22width%22%3A%22100%25%22%2C%22height%22%3A%22100%25%22%2C%22dateRange%22%3A%221H%22%2C%22colorTheme%22%3A%22dark%22%2C%22trendLineColor%22%3A%22rgba(41%2C%2098%2C%20255%2C%201)%22%2C%22underLineColor%22%3A%22rgba(41%2C%2098%2C%20255%2C%200.3)%22%2C%22underLineBottomColor%22%3A%22rgba(41%2C%2098%2C%20255%2C%200)%22%2C%22isTransparent%22%3Afalse%2C%22autosize%22%3Atrue%2C%22largeChartUrl%22%3A%22%22%7D`,
    }))

    const result = { charts }
    setCachedData('trading_charts', result)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Trading charts error:', error)
    return NextResponse.json({ charts: [], error: String(error) })
  }
}

