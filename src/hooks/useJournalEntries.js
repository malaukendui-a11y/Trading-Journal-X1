import { useContext } from 'react'
import { JournalContext } from '../context/JournalContext.jsx'

export function useJournalEntries() {
  const context = useContext(JournalContext)
  if (!context) {
    throw new Error('useJournalEntries must be used within a JournalProvider')
  }
  return context
}

