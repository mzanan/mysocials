'use client'

import { motion } from 'framer-motion'

export function TradingBackground({ isActive }: { isActive: boolean }) {
  const btcChartUrl = 'https://www.tradingview.com/widgetembed/?frameElementId=tradingview_widget&symbol=BINANCE:BTCUSDT&interval=1H&hidesidetoolbar=1&symboledit=0&saveimage=0&toolbarbg=f1f3f6&studies=[]&theme=dark&style=1&timezone=Etc/UTC&withdateranges=1&showpopupbutton=0&studies_overrides={}&overrides={}&enabled_features=[]&disabled_features=[]&showpopupbutton=0&locale=en'

  return (
    <div className="bg-fixed-overlay bg-gradient-to-br from-amber-900 via-orange-900 to-red-900">
      <motion.div
        className="relative w-full h-full overflow-hidden bg-black/20"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={isActive ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.5 }}
      >
        <iframe
          src={btcChartUrl}
          style={{ width: '100%', height: '100%', border: 'none' }}
          allow="clipboard-write"
          title="BTCUSDT Chart"
        />
        <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded z-10">
          BTCUSDT
        </div>
      </motion.div>
      <div className="bg-overlay-gradient" />
    </div>
  )
}

