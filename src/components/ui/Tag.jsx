export function Tag({
  children,
  variant = 'neutral',
  size = 'sm',
  className = '',
  ...props
}) {
  const baseStyles = 'inline-flex items-center font-mono font-medium rounded uppercase tracking-wider'

  const sizeStyles = {
    xs: 'text-[10px] px-1.5 py-0.5',
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
  }[size] || 'text-xs px-2 py-0.5'

  const variantStyles = {
    buy: 'bg-sage/15 text-sage border border-sage/30',
    sell: 'bg-brick/15 text-brick border border-brick/30',
    plan: 'bg-sage/15 text-sage border border-sage/30',
    revenge: 'bg-brick/15 text-brick border border-brick/30',
    sage: 'bg-sage/15 text-sage border border-sage/30',
    brick: 'bg-brick/15 text-brick border border-brick/30',
    accent: 'bg-accent/15 text-accent border border-accent/30',
    neutral: 'bg-bg-panel-raised text-text-secondary border border-line',
  }[variant] || 'bg-bg-panel-raised text-text-secondary border border-line'

  return (
    <span className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`} {...props}>
      {children}
    </span>
  )
}

