import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { apiUrl } from '../lib/api'

export function usePageTracking() {
  const location = useLocation()
  useEffect(() => {
    // Skip admin pages — don't count your own visits
    if (location.pathname.startsWith('/admin')) return
    fetch(apiUrl('/api/v1/analytics/pageview'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: location.pathname }),
    }).catch(() => {})
  }, [location.pathname])
}
