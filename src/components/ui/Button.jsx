export function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  className = '',
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center min-h-11 font-semibold transition-all duration-150 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'

  const sizeStyles = {
    sm: 'text-sm px-3 py-1.5 gap-1.5',
    md: 'text-[15px] px-4 py-2.5 gap-2',
    lg: 'text-[15px] px-5 py-3 gap-2.5',
  }[size] || 'text-[15px] px-4 py-2.5 gap-2'

  const variantStyles = {
    primary:
      'bg-accent-solid text-white shadow-[0_0_18px_rgba(145,121,214,.35)] hover:brightness-105 active:brightness-95',
    secondary:
      'bg-bg-panel-raised text-text-primary border border-line hover:border-accent-border active:bg-bg-panel',
    outline:
      'bg-transparent text-text-primary border border-line hover:border-accent-border hover:text-accent-text',
    ghost:
      'bg-transparent text-accent-text hover:bg-accent-soft',
    danger:
      'bg-brick text-on-danger hover:brightness-110 active:brightness-90',
  }[variant] || 'bg-accent-solid text-white shadow-[0_0_18px_rgba(145,121,214,.35)]'

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      <span>{children}</span>
    </button>
  )
}

