import { isValidElement } from 'react'

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-xl border border-dashed border-line bg-bg-panel/40 ${className}`}
    >
      {Icon && (
        <div className="w-12 h-12 mb-4 rounded-full bg-bg-panel-raised flex items-center justify-center text-text-secondary border border-line">
          {isValidElement(Icon) ? Icon : <Icon className="w-6 h-6" />}
        </div>
      )}
      {title && (
        <h3 className="font-display font-medium text-base sm:text-lg text-text-primary mb-1">
          {title}
        </h3>
      )}
      {description && (
        <p className="text-sm text-text-secondary max-w-md mb-6 leading-relaxed">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  )
}

