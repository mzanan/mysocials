import { useCallback, useEffect, useState } from 'react'

export function useResponsiveColumns<T>(items: T[]) {
  const [columns, setColumns] = useState<T[][]>([])

  const calculateColumns = useCallback(() => {
    const width = window.innerWidth
    let columnCount = 6

    if (width <= 480) columnCount = 2
    else if (width <= 768) columnCount = 3
    else if (width <= 1024) columnCount = 4
    else if (width <= 1440) columnCount = 5
    else if (width <= 2560) columnCount = 6
    else if (width >= 2560) columnCount = 6

    const cols: T[][] = Array.from({ length: columnCount }, () => [])

    const totalRows = Math.ceil(items.length / columnCount)
    for (let row = 0; row < totalRows; row++) {
      for (let col = 0; col < columnCount; col++) {
        const idx = row * columnCount + col
        if (idx < items.length) {
          cols[col].push(items[idx])
        }
      }
    }

    setColumns(cols)
  }, [items])

  useEffect(() => {
    calculateColumns()
    window.addEventListener('resize', calculateColumns)

    return () => window.removeEventListener('resize', calculateColumns)
  }, [calculateColumns])

  return columns
}

