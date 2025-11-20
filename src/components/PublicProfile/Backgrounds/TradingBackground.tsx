'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getBrowserCache, setBrowserCache } from '@/lib/browser-cache'

interface Chart {
  id: string
  symbol: string
  fullSymbol: string
  widgetUrl: string
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
    },
  },
}

interface TradingBackgroundProps {
  isActive: boolean
}

export function TradingBackground({ isActive }: TradingBackgroundProps) {
  const [charts, setCharts] = useState<Chart[]>([])
  const [animationKey, setAnimationKey] = useState(0)

  useEffect(() => {
    if (isActive) {
      setAnimationKey(prev => prev + 1)
    }
  }, [isActive])

  useEffect(() => {
    const fetchCharts = async () => {
      // Check browser cache first
      const cached = getBrowserCache<Chart[]>('trading_charts')
      if (cached && cached.length > 0) {
        setCharts(cached.slice(0, 10))
        return
      }

      // Fetch from API if not cached
      try {
        const response = await fetch('/api/trading-charts')
        const data = await response.json()
        if (data.charts && data.charts.length > 0) {
          // Cache the charts
          setBrowserCache('trading_charts', data.charts)
          setCharts(data.charts.slice(0, 10))
        }
      } catch (error) {
        console.error('Error fetching trading charts:', error)
      }
    }

    fetchCharts()
  }, [])

  if (charts.length === 0) {
    return (
      <div className="fixed inset-0 overflow-hidden z-0 bg-gradient-to-br from-amber-900 via-orange-900 to-red-900 flex items-center justify-center">
        <div className="text-center text-white/30">
          <p className="text-4xl font-bold mb-2">📈</p>
          <p className="text-xl">Loading charts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 overflow-hidden z-0 bg-gradient-to-br from-amber-900 via-orange-900 to-red-900">
      <motion.div
        className="grid grid-cols-2 h-full w-full min-w-0"
        variants={containerVariants}
        initial="hidden"
        animate={isActive ? "visible" : "hidden"}
        key={animationKey}
      >
        {charts.map((chart) => (
          <motion.div
            key={chart.id}
            className="relative w-full h-full min-w-0 overflow-hidden bg-black/20"
            variants={itemVariants}
            transition={{ duration: 0.3 }}
          >
            <iframe
              src={chart.widgetUrl}
              style={{ width: '100%', height: '100%', border: 'none' }}
              allow="clipboard-write"
              title={`${chart.symbol} Chart`}
            />
            <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded z-10">
              {chart.symbol}
            </div>
          </motion.div>
        ))}
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 pointer-events-none" />
    </div>
  )
}

