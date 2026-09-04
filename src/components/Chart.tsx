import { useId } from 'react'
import { number } from '../utils/format'

export interface ChartPoint {
  label: string
  value: number
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
  const id = useId().replaceAll(':', '')
  if (!points.length)
    return (
      <div className="chart-empty">
        <div className="chart-grid" />
        <p>ยังมีข้อมูลไม่เพียงพอ</p>
        <span>กราฟจะแสดงเมื่อมีข้อมูลที่คำนวณได้</span>
      </div>
    )
  const max = Math.max(...points.map((point) => point.value), 1) * 1.2
  const width = 600,
    height = 190,
    left = 45,
    right = 15,
    top = 15,
    bottom = 28
  const innerWidth = width - left - right,
    innerHeight = height - top - bottom
  const x = (index: number) =>
    left +
    (bars ? (index + 0.5) / points.length : points.length === 1 ? 0.5 : index / (points.length - 1)) *
      innerWidth
  const y = (value: number) => top + innerHeight * (1 - value / max)
  const path = points.map((point, index) => `${index ? 'L' : 'M'}${x(index)},${y(point.value)}`).join(' ')
  return (
    <div className="chart">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label}>
        <defs>
          <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 0.5, 1].map((fraction) => (
          <g key={fraction}>
            <line
              x1={left}
              x2={width - right}
              y1={y(max * fraction)}
              y2={y(max * fraction)}
              className="grid-line"
            />
            <text x={left - 9} y={y(max * fraction) + 4} textAnchor="end">
              {number(max * fraction, max < 10 ? 1 : 0)}
            </text>
          </g>
        ))}
        {bars ? (
          points.map((point, index) => (
            <rect
              key={index}
              x={x(index) - (innerWidth / points.length) * 0.28}
              y={y(point.value)}
              width={(innerWidth / points.length) * 0.56}
              height={y(0) - y(point.value)}
              rx="5"
              fill="var(--accent)"
            >
              <title>
                {point.label}: {number(point.value, 2)} {unit}
              </title>
            </rect>
          ))
        ) : (
          <>
            <path d={`${path} L${x(points.length - 1)},${y(0)} L${x(0)},${y(0)} Z`} fill={`url(#${id})`} />
            <path d={path} fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinejoin="round" />
            {points.map((point, index) => (
              <circle
                key={index}
                cx={x(index)}
                cy={y(point.value)}
                r="4"
                fill="var(--accent)"
                stroke="var(--card)"
                strokeWidth="2"
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
            (index === 0 || index === points.length - 1 || (points.length < 7 && index % 2 === 0)) && (
              <text
                key={index}
                x={x(index)}
                y={height - 7}
                textAnchor={
                  index === 0 && !bars ? 'start' : index === points.length - 1 && !bars ? 'end' : 'middle'
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
              <th>วันที่ / เดือน</th>
              <th>{unit}</th>
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
