export function moveItem<T>(arr: T[], index: number, dir: -1 | 1): T[] {
  const next = [...arr]
  const target = index + dir
  if (target < 0 || target >= next.length) return next
  ;[next[index], next[target]] = [next[target], next[index]]
  return next
}
