export function Card({
  children,
  className = '',
  header,
  footer,
  ...props
}) {
  return (
    <div
      className={`bg-bg-panel border border-line rounded-xl shadow-sm text-text-primary ${className}`}
      {...props}
    >
      {header && <div className="p-5 border-b border-line">{header}</div>}
      <div className="p-6">{children}</div>
      {footer && <div className="p-4 border-t border-line bg-bg-panel-raised/50 rounded-b-xl">{footer}</div>}
    </div>
  )
}

