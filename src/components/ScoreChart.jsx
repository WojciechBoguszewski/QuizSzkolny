import { useId } from 'react'

const centerX = 280
const centerY = 228
const radius = 153
const ringLevels = [25, 50, 75, 100]

function pointAt(angle, distance) {
  return {
    x: centerX + Math.sin(angle) * distance,
    y: centerY - Math.cos(angle) * distance,
  }
}

function RadarPlot({ scores }) {
  const axes = scores.map(({ name, points, max }, index) => {
    const angle = index * 2 * Math.PI / scores.length
    return {
      name,
      edge: pointAt(angle, radius),
      value: pointAt(angle, radius * points / max),
      label: pointAt(angle, radius + 19),
    }
  })
  const polygon = axes.map(({ value }) => `${value.x},${value.y}`).join(' ')

  return (
    <svg className="qs-radar" viewBox="87 35 386 386" role="img"
      aria-label="Wykres radarowy na skali od 0 do 100 procent. Wartości dla każdej osi są pod wykresem.">
      {ringLevels.map((level) => (
        <circle key={level} className="qs-radar-grid" cx={centerX} cy={centerY} r={radius * level / 100} />
      ))}
      {axes.map(({ name, edge }) => (
        <line key={name} className="qs-radar-axis" x1={centerX} y1={centerY} x2={edge.x} y2={edge.y} />
      ))}
      <polygon className="qs-radar-result" points={polygon} />
      {axes.map(({ name, value }) => (
        <circle key={name} className="qs-radar-point" cx={value.x} cy={value.y} r="3.3" />
      ))}
      {ringLevels.map((level) => (
        <text key={level} className="qs-radar-tick" x={centerX + 7} y={centerY - radius * level / 100 + 13}>
          {level}%
        </text>
      ))}
      {axes.map(({ name, label }, index) => {
        const lines = name.length > 16 ? name.split(/(?<=-)|\s+/) : [name]
        const offset = label.x - centerX
        const anchor = Math.abs(offset) < 10 ? 'middle' : offset < 0 ? 'end' : 'start'
        return (
          <g key={name}>
            <text className="qs-radar-label" x={label.x} y={label.y} textAnchor={anchor} dominantBaseline="middle">
              {lines.map((line, lineIndex) => (
                <tspan key={lineIndex} x={label.x} dy={lineIndex === 0 ? -(lines.length - 1) * 7 : 14}>{line}</tspan>
              ))}
            </text>
            <text className="qs-radar-index" x={label.x} y={label.y} textAnchor="middle" dominantBaseline="middle">
              {index + 1}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export default function ScoreChart({ scores, title }) {
  const titleId = useId()
  const hasRadar = scores.length >= 3
  const numbered = scores.length > 15 || scores.some(({ name }) => name.length > 30)

  return (
    <section className={`qs-score-chart${numbered ? ' qs-score-chart--numbered' : ''}`} aria-labelledby={titleId}>
      <h2 id={titleId}>{title}</h2>
      {hasRadar && <RadarPlot scores={scores} />}
      <ol className="qs-score-values">
        {scores.map(({ name, points, max }, index) => (
          <li key={name} className="qs-score-label">
            <span>{hasRadar && <span className="qs-score-index" aria-hidden="true">{index + 1}. </span>}{name}</span>
            <span>{points} / {max} pkt</span>
          </li>
        ))}
      </ol>
    </section>
  )
}
