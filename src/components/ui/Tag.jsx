export function Tag({
  children,
  variant = 'neutral',
  size = 'sm',
  className = '',
  ...props
}) {
  const baseStyles = 'inline-flex items-center h-6 font-medium rounded-full whitespace-nowrap'

  const sizeStyles = {
    xs: 'text-[11px] px-2',
    sm: 'text-xs px-2.5',
    md: 'text-[13px] px-3',
  }[size] || 'text-xs px-2.5'

  const variantStyles = {
    buy: 'bg-bg-panel-raised text-text-primary border border-line',
    sell: 'bg-bg-panel-raised text-text-primary border border-line',
    plan: 'bg-accent-soft text-accent-text border border-transparent',
    revenge: 'bg-brick-soft text-brick border border-brick-border',
    sage: 'bg-sage-soft text-sage border border-sage-border',
    brick: 'bg-brick-soft text-brick border border-brick-border',
    accent: 'bg-accent-soft text-accent-text border border-transparent',
    neutral: 'bg-bg-panel-raised text-text-primary border border-line',
  }[variant] || 'bg-bg-panel-raised text-text-primary border border-line'

  return (
    <span className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`} {...props}>
      {children}
    </span>
  )
}

