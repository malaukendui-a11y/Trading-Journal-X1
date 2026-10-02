/**
 * Developer logger yang HANYA aktif pada mode development (import.meta.env.DEV).
 * Membantu debugging tanpa menampilkan error teknis ke antarmuka pengguna atau konsol produksi.
 *
 * @param {string} scope Nama modul/fungsi tempat error terjadi (mis. 'AuthContext:signIn')
 * @param {Error|Object|string} error Objek error
 */
export function logDevError(scope, error) {
  if (import.meta.env.DEV) {
    const errorDetails = {
      scope,
      code: error?.code,
      status: error?.status,
      message: error?.message || (typeof error === 'string' ? error : undefined),
      raw: error,
    }
    console.error(`[Trading Compass DEV] [${scope}]`, errorDetails)
  }
}
