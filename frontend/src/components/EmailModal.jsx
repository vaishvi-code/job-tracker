import { useState } from 'react'
import { X, Copy, Sparkles } from 'lucide-react'
import { aiApi } from '../api'
import toast from 'react-hot-toast'

const EMAIL_TYPES = [
  { id: 'follow_up', label: 'Follow Up' },
  { id: 'thank_you', label: 'Thank You' },
  { id: 'withdraw', label: 'Withdraw' },
]

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' },
  modal: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', width: '100%', maxWidth: '600px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '90vh', overflow: 'auto' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: '1.1rem', fontWeight: 600 },
  closeBtn: { background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', padding: '4px', cursor: 'pointer' },
  tabs: { display: 'flex', gap: '0.5rem' },
  tab: (active) => ({ padding: '0.4rem 0.9rem', borderRadius: '6px', border: '1px solid var(--border)', background: active ? 'var(--accent-dim)' : 'none', color: active ? 'var(--accent)' : 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer', fontWeight: active ? 600 : 400 }),
  label: { fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' },
  input: { background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.5rem 0.75rem', color: 'var(--text)', fontSize: '0.9rem', outline: 'none', width: '100%' },
  generateBtn: { display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--accent)', border: 'none', borderRadius: '8px', padding: '0.6rem 1.25rem', color: '#0f0f11', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' },
  resultBox: { background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  subjectRow: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  subjectLabel: { fontSize: '0.75rem', color: 'var(--text-muted)', minWidth: 60 },
  subjectText: { fontSize: '0.9rem', fontWeight: 500 },
  divider: { height: '1px', background: 'var(--border)' },
  body: { fontSize: '0.875rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', color: 'var(--text)' },
  copyBtn: { display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.4rem 0.9rem', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer', alignSelf: 'flex-end' },
  loading: { color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '1rem' },
}

export default function EmailModal({ job, onClose }) {
  const [emailType, setEmailType] = useState('follow_up')
  const [context, setContext] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    setLoading(true)
    setResult(null)
    try {
      const data = await aiApi.generateEmail(job.id, emailType, context)
      setResult(data)
    } catch {
      toast.error('Failed to generate email. Check your API key.')
    } finally {
      setLoading(false)
    }
  }

  const copy = () => {
    navigator.clipboard.writeText(`Subject: ${result.subject}\n\n${result.body}`)
    toast.success('Copied to clipboard!')
  }

  return (
    <div style={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <span style={styles.title}>✉️ Generate Email — {job.company}</span>
          <button style={styles.closeBtn} onClick={onClose}><X size={18} /></button>
        </div>

        <div>
          <div style={styles.label}>Email Type</div>
          <div style={styles.tabs}>
            {EMAIL_TYPES.map(t => (
              <button key={t.id} style={styles.tab(emailType === t.id)} onClick={() => setEmailType(t.id)}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div style={styles.label}>Extra Context (optional)</div>
          <input style={styles.input} placeholder="e.g. had a great chat with the team about distributed systems"
            value={context} onChange={e => setContext(e.target.value)} />
        </div>

        <button style={styles.generateBtn} onClick={generate} disabled={loading}>
          <Sparkles size={15} />
          {loading ? 'Generating...' : 'Generate Email'}
        </button>

        {loading && <div style={styles.loading}>Asking Claude to write your email...</div>}

        {result && (
          <div style={styles.resultBox}>
            <div style={styles.subjectRow}>
              <span style={styles.subjectLabel}>Subject:</span>
              <span style={styles.subjectText}>{result.subject}</span>
            </div>
            <div style={styles.divider} />
            <div style={styles.body}>{result.body}</div>
            <button style={styles.copyBtn} onClick={copy}>
              <Copy size={13} /> Copy Email
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
