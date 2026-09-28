// src/components/ui/BrandLogo.jsx
// Logo "Needle Mark" + wordmark "Trading Compass" — dipakai di TopBar/SidebarNav.
// Warna ikon tonal (dua gradasi ungu yang sama), konsisten di tema light & dark.
// Wordmark memakai token warna teks aktif (--text-primary) supaya otomatis theme-aware.

export default function BrandLogo({ className = '' }) {
  return (
    <div
      className={`brand-logo ${className}`}
      style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
    >
      <svg
        width="32"
        height="32"
        viewBox="0 0 48 48"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M24 6 L34 24 L24 24 L14 24 Z" fill="#9179d6" />
        <path d="M24 24 L34 24 L24 42 L14 24 Z" fill="#5f4f96" />
        <circle cx="24" cy="24" r="3" fill="#5f4f96" />
      </svg>
      <span
        style={{
          fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)',
          fontWeight: 700,
          fontSize: '1.125rem',
          color: 'var(--text-primary)',
          letterSpacing: '-0.01em',
        }}
      >
        Trading Compass
      </span>
    </div>
  );
}
