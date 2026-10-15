export function Input({
  label,
  error,
  hint,
  id,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  autoComplete,
  className = '',
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

  return (
    <div className={`flex flex-col gap-1.5 text-left w-full ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-[13px] font-medium text-text-secondary flex items-center justify-between"
        >
          <span>
            {label}
            {required && <span className="text-brick ml-1">*</span>}
          </span>
        </label>
      )}

      <input
        id={inputId}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        className={`w-full min-h-11 px-3.5 py-2.5 rounded-xl text-base md:text-[15px] bg-bg-panel-raised border transition-colors duration-150 text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-[3px] focus:ring-[rgba(145,121,214,.22)] ${
          error
            ? 'border-brick focus:border-brick'
            : 'border-line hover:border-accent-border focus:border-accent-border'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        {...props}
      />

      {error && (
        <span id={`${inputId}-error`} className="text-xs text-brick font-medium">
          {error}
        </span>
      )}

      {hint && !error && (
        <span id={`${inputId}-hint`} className="text-xs text-text-secondary">
          {hint}
        </span>
      )}
    </div>
  )
}

