import { useUiStore } from '../store/uiStore'

export default function Toast() {
  const toast = useUiStore(s => s.toast)

  return (
    <div style={{
      position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
      background: '#2C2C2C', color: 'white',
      padding: '14px 22px', borderRadius: 14,
      fontSize: '0.86rem', fontWeight: 600,
      display: 'flex', alignItems: 'center', gap: 10,
      boxShadow: '0 8px 28px rgba(0,0,0,0.2)',
      transform: toast ? 'translateY(0)' : 'translateY(80px)',
      opacity: toast ? 1 : 0,
      transition: 'all 0.35s cubic-bezier(.21,1.1,.49,1.05)',
      pointerEvents: 'none',
    }}>
      {toast}
    </div>
  )
}
