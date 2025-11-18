'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

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

export function TradingBackground() {
  const [charts, setCharts] = useState<Chart[]>([])

  useEffect(() => {
    const fetchCharts = async () => {
      try {
        const response = await fetch('/api/trading-charts')
        const data = await response.json()
        if (data.charts && data.charts.length > 0) {
          setCharts(data.charts.slice(0, 12))
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
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 p-2 h-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        key={charts.length}
      >
        {charts.map((chart) => (
          <motion.div
            key={chart.id}
            className="relative aspect-video rounded-lg overflow-hidden bg-black/20 border border-white/10"
            variants={itemVariants}
            whileHover={{ scale: 1.02, zIndex: 10 }}
            transition={{ duration: 0.3 }}
          >
            <iframe
              src={chart.widgetUrl}
              className="w-full h-full"
              frameBorder="0"
              allow="clipboard-write"
              title={`${chart.symbol} Chart`}
            />
            <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
              {chart.symbol}
            </div>
          </motion.div>
        ))}
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 pointer-events-none" />
    </div>
  )
}

