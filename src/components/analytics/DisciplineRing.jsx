/**
 * Komponen SVG Ring Gauge untuk Skor Disiplin Eksekusi (FR-ANA-3).
 * Murni SVG tanpa dependensi chart eksternal.
 * Angka persentase selalu tampil sebagai teks yang jelas.
 */

export function DisciplineRing({ score = null, t, lang }) {
  const size = 160
  const strokeWidth = 14
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  const hasScore = score !== null && typeof score?.pct === 'number'
  const pct = hasScore ? Math.min(100, Math.max(0, score.pct)) : 0
  const tone = score?.tone || 'accent'

  // Hitung offset stroke dash SVG (arah jarum jam dari atas)
  const strokeDashoffset = hasScore
    ? circumference - (pct / 100) * circumference
    : circumference

  const toneColors = {
    sage: 'text-sage stroke-sage',
    accent: 'text-accent stroke-accent',
    brick: 'text-brick stroke-brick',
  }

  const activeColorClass = hasScore ? toneColors[tone] || toneColors.accent : 'text-text-secondary stroke-line'

  return (
    <div className="flex flex-col items-center justify-center p-2">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
          aria-hidden="true"
        >
          {/* Lingkaran Background / Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-line/40"
          />

          {/* Lingkaran Progress */}
          {hasScore && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={`transition-all duration-700 ease-out ${activeColorClass}`}
            />
          )}
        </svg>

        {/* Teks di Tengah Ring Gauge */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
          <span className={`font-mono text-3xl font-extrabold tracking-tight ${hasScore ? activeColorClass.split(' ')[0] : 'text-text-secondary'}`}>
            {hasScore ? `${score.pct}%` : '—'}
          </span>
          <span className="text-[11px] font-medium text-text-secondary uppercase tracking-wider mt-0.5">
            {t('analytics.disciplineScoreTitle')}
          </span>
        </div>
      </div>

      {/* Label Kategori Kedisiplinan */}
      <div className="mt-3 text-center">
        {hasScore ? (
          <p className="text-xs font-semibold text-text-primary">
            {score.pct >= 70 && t('analytics.disciplineSageLabel')}
            {score.pct >= 40 && score.pct < 70 && t('analytics.disciplineAccentLabel')}
            {score.pct < 40 && t('analytics.disciplineBrickLabel')}
          </p>
        ) : (
          <p className="text-xs text-text-secondary">
            {t('analytics.disciplineNoTrades')}
          </p>
        )}
      </div>
    </div>
  )
}
