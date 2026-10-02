import { createContext, useCallback, useEffect, useState } from 'react'
import { useAuth } from './AuthContext.jsx'
import { logDevError } from '../lib/devLog.js'
import { buildJournalPayload } from '../lib/journalValidation.js'
import { supabase } from '../lib/supabaseClient.js'

export const JournalContext = createContext(null)

/**
 * Pembanding deterministik untuk riwayat jurnal:
 * 1. trade_date descending (terbaru di atas)
 * 2. created_at descending
 * 3. id descending
 */
export function sortJournalEntries(entries) {
  if (!Array.isArray(entries)) return []
  return [...entries].sort((a, b) => {
    // 1. trade_date desc
    const dateA = a?.trade_date || ''
    const dateB = b?.trade_date || ''
    if (dateA !== dateB) {
      return dateB.localeCompare(dateA)
    }

    // 2. created_at desc
    const timeA = a?.created_at ? new Date(a.created_at).getTime() : 0
    const timeB = b?.created_at ? new Date(b.created_at).getTime() : 0
    if (timeA !== timeB) {
      return timeB - timeA
    }

    // 3. id desc (kunci ketiga penjamin paging deterministik)
    return String(b?.id || '').localeCompare(String(a?.id || ''))
  })
}

export function JournalProvider({ children }) {
  const { user } = useAuth()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshIndex, setRefreshIndex] = useState(0)

  const refetch = useCallback(() => {
    setRefreshIndex(prev => prev + 1)
  }, [])

  useEffect(() => {
    let isCancelled = false

    async function fetchAllEntries() {
      if (!user?.id) {
        setEntries([])
        setLoading(false)
        setError(null)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const PAGE_SIZE = 1000
        let from = 0
        let allRows = []
        let hasMore = true

        while (hasMore && !isCancelled) {
          const { data, error: queryError } = await supabase
            .from('journal_entries')
            .select('*')
            .order('trade_date', { ascending: false })
            .order('created_at', { ascending: false })
            .order('id', { ascending: false })
            .range(from, from + PAGE_SIZE - 1)

          if (isCancelled) return

          if (queryError) {
            throw queryError
          }

          if (data && data.length > 0) {
            allRows = allRows.concat(data)
            if (data.length < PAGE_SIZE) {
              hasMore = false
            } else {
              from += PAGE_SIZE
            }
          } else {
            hasMore = false
          }
        }

        if (!isCancelled) {
          setEntries(sortJournalEntries(allRows))
          setLoading(false)
        }
      } catch (err) {
        if (!isCancelled) {
          logDevError('JournalContext:fetchAllEntries', err)
          setError('journal.errorLoadFailed')
          setLoading(false)
        }
      }
    }

    fetchAllEntries()

    return () => {
      isCancelled = true
    }
  }, [user?.id, refreshIndex])

  /**
   * Menambah entri baru ke Supabase secara non-optimistis.
   * Menyertakan user_id dari sesi login aktif.
   */
  const addEntry = useCallback(
    async formData => {
      if (!user?.id) {
        throw new Error('journal.errorSaveFailed')
      }

      const payload = buildJournalPayload(formData, user.id)

      const { data, error: insertError } = await supabase
        .from('journal_entries')
        .insert(payload)
        .select()
        .single()

      if (insertError) {
        logDevError('JournalContext:addEntry', insertError)
        throw new Error('journal.errorSaveFailed')
      }

      if (!data) {
        logDevError('JournalContext:addEntry', new Error('No data returned from insert'))
        throw new Error('journal.errorSaveFailed')
      }

      // Masukkan baris baru lalu urutkan ulang secara deterministik
      setEntries(prev => sortJournalEntries([data, ...prev]))
      return data
    },
    [user?.id]
  )

  /**
   * Menghapus entri berdasarkan ID.
   * Memverifikasi baris terhapus > 0 (cegah silent failure akibat RLS).
   */
  const deleteEntry = useCallback(async id => {
    if (!id) return

    const { data, error: delError } = await supabase
      .from('journal_entries')
      .delete()
      .eq('id', id)
      .select('id')

    if (delError) {
      logDevError('JournalContext:deleteEntry', delError)
      throw new Error('journal.errorDeleteFailed')
    }

    // Jika baris yang terhapus kosong (RLS atau sudah tidak ada di DB), anggap gagal
    if (!data || data.length === 0) {
      const err = new Error(`0 rows deleted for id: ${id}`)
      logDevError('JournalContext:deleteEntry', err)
      throw new Error('journal.errorDeleteFailed')
    }

    // Sukses: perbarui state
    setEntries(prev => prev.filter(entry => entry.id !== id))
  }, [])

  const value = {
    entries,
    loading,
    error,
    addEntry,
    deleteEntry,
    refetch,
  }

  return <JournalContext.Provider value={value}>{children}</JournalContext.Provider>
}

