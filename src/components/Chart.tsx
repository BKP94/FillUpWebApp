import { useEffect, useState } from 'react'
import { number } from '../utils/format'

export interface ChartPoint {
  label: string
  value: number
}
function useWidth(fallback: number) {
  const [element, setElement] = useState<HTMLDivElement | null>(null)
  const [width, setWidth] = useState(fallback)
  useEffect(() => {
    if (!element || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return
      const next = Math.round(entry.contentRect.width)
      if (next > 0) setWidth(next)
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [element])
  return [setElement, width] as const
}
export function Chart({
  points,
  label,
  unit,
  bars = false,
}: {
  points: ChartPoint[]
  label: string
  unit: string
  bars?: boolean
}) {
  const [ref, width] = useWidth(600)
  if (!points.length)
    return (
      <div className="chart-empty">
        <p>ยังมีข้อมูลไม่เพียงพอ</p>
        <span>กราฟจะแสดงเมื่อมีข้อมูลที่คำนวณได้</span>
      </div>
    )
  const compact = width < 480
  const max = Math.max(...points.map((point) => point.value), 1) * 1.15
  const height = compact ? 180 : 210,
    left = compact ? 40 : 52,
    right = 12,
    top = 14,
    bottom = 30
  const innerWidth = Math.max(width - left - right, 1),
    innerHeight = height - top - bottom
  const x = (index: number) =>
    left +
    (bars ? (index + 0.5) / points.length : points.length === 1 ? 0.5 : index / (points.length - 1)) *
      innerWidth
  const y = (value: number) => top + innerHeight * (1 - value / max)
  const path = points.map((point, index) => `${index ? 'L' : 'M'}${x(index)},${y(point.value)}`).join(' ')
  const maxLabels = Math.max(2, Math.min(6, Math.floor(innerWidth / 96)))
  const labelEvery = Math.max(1, Math.ceil(points.length / maxLabels))
  return (
    <div className="chart" ref={ref}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label}>
        {[0, 0.5, 1].map((fraction) => (
          <g key={fraction}>
            <line
              x1={left}
              x2={width - right}
              y1={y(max * fraction)}
              y2={y(max * fraction)}
              className={fraction ? 'grid-line' : 'base-line'}
            />
            <text x={left - 8} y={y(max * fraction) + 4} textAnchor="end">
              {number(max * fraction, max < 10 ? 1 : 0)}
            </text>
          </g>
        ))}
        {bars ? (
          points.map((point, index) => {
            const slot = innerWidth / points.length
            return (
              <rect
                key={index}
                className="chart-bar"
                x={x(index) - slot * 0.3}
                y={y(point.value)}
                width={slot * 0.6}
                height={y(0) - y(point.value)}
                rx="2"
              >
                <title>
                  {point.label}: {number(point.value, 2)} {unit}
                </title>
              </rect>
            )
          })
        ) : (
          <>
            <path
              className="chart-area"
              d={`${path} L${x(points.length - 1)},${y(0)} L${x(0)},${y(0)} Z`}
            />
            <path className="chart-line" d={path} />
            {points.map((point, index) => (
              <circle
                key={index}
                className={index === points.length - 1 ? 'chart-dot latest' : 'chart-dot'}
                cx={x(index)}
                cy={y(point.value)}
                r={index === points.length - 1 ? 5 : 3.5}
              >
                <title>
                  {point.label}: {number(point.value, 2)} {unit}
                </title>
              </circle>
            ))}
          </>
        )}
        {points.map(
          (point, index) =>
            (index === points.length - 1 || index % labelEvery === 0) &&
            !(index !== points.length - 1 && points.length - 1 - index < labelEvery * 0.75) && (
              <text
                key={index}
                className="axis-label"
                x={x(index)}
                y={height - 8}
                textAnchor={
                  bars || points.length === 1
                    ? 'middle'
                    : index === 0
                      ? 'start'
                      : index === points.length - 1
                        ? 'end'
                        : 'middle'
                }
              >
                {point.label}
              </text>
            ),
        )}
      </svg>
      <details className="chart-data">
        <summary>ดูข้อมูลกราฟ</summary>
        <table>
          <caption>{label}</caption>
          <thead>
            <tr>
              <th scope="col">วันที่ / เดือน</th>
              <th scope="col">{unit}</th>
            </tr>
          </thead>
          <tbody>
            {points.map((point, index) => (
              <tr key={index}>
                <td>{point.label}</td>
                <td>{number(point.value, 2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  )
}
