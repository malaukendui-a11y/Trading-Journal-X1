import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

describe('M8a: Security Headers Verification', () => {
  const rootDir = process.cwd()
  const secHeadersPath = path.resolve(rootDir, 'security-headers.json')
  const vercelConfigPath = path.resolve(rootDir, 'vercel.json')

  const secHeaders = JSON.parse(fs.readFileSync(secHeadersPath, 'utf-8'))
  const vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf-8'))

  it('file security-headers.json dan vercel.json ada dan dapat dibaca', () => {
    expect(secHeaders).toBeDefined()
    expect(vercelConfig).toBeDefined()
  })

  it('vercel.json memiliki rewrite SPA ke /index.html', () => {
    expect(vercelConfig.rewrites).toBeDefined()
    const spaRewrite = vercelConfig.rewrites.find(
      (r) => r.source === '/(.*)' && r.destination === '/index.html'
    )
    expect(spaRewrite).toBeDefined()
  })

  it('header di vercel.json identik persis dengan security-headers.json', () => {
    const routeHeaders = vercelConfig.headers?.find((h) => h.source === '/(.*)')
    expect(routeHeaders).toBeDefined()
    expect(Array.isArray(routeHeaders.headers)).toBe(true)

    // Konversi array vercel headers ke map key -> value
    const vercelMap = {}
    for (const h of routeHeaders.headers) {
      vercelMap[h.key] = h.value
    }

    // Setiap key di security-headers.json harus sama persis dengan di vercel.json
    for (const [key, value] of Object.entries(secHeaders)) {
      expect(vercelMap[key]).toBe(value)
    }

    // Jumlah header harus sama
    expect(Object.keys(vercelMap).length).toBe(Object.keys(secHeaders).length)
  })

  it("script-src di CSP adalah 'self' dan TIDAK mengandung 'unsafe-inline'", () => {
    const csp = secHeaders['Content-Security-Policy']
    expect(csp).toBeDefined()

    // Ambil bagian script-src
    const scriptSrcMatch = csp.match(/script-src\s+([^;]+)/)
    expect(scriptSrcMatch).not.toBeNull()

    const scriptSrcDirectives = scriptSrcMatch[1].trim().split(/\s+/)
    expect(scriptSrcDirectives).toContain("'self'")
    expect(scriptSrcDirectives).not.toContain("'unsafe-inline'")
  })

  it('memiliki semua header keamanan esensial sesuai spesifikasi design §8.1', () => {
    expect(secHeaders['X-Frame-Options']).toBe('DENY')
    expect(secHeaders['X-Content-Type-Options']).toBe('nosniff')
    expect(secHeaders['Referrer-Policy']).toBe('strict-origin-when-cross-origin')
    expect(secHeaders['Permissions-Policy']).toBe('camera=(), microphone=(), geolocation=()')
    expect(secHeaders['Content-Security-Policy']).toContain("frame-ancestors 'none'")
    expect(secHeaders['Content-Security-Policy']).toContain('cbcyuthajjmmvfguvmaj.supabase.co')
  })
})
