import { useState } from 'react'
import { X } from 'lucide-react'

const STATUSES = ['wishlist', 'applied', 'interviewing', 'offer', 'rejected']

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' },
  modal: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', width: '100%', maxWidth: '520px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: '1.1rem', fontWeight: 600 },
  closeBtn: { background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', padding: '4px' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '4px' },
  label: { fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' },
  input: { background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.5rem 0.75rem', color: 'var(--text)', fontSize: '0.9rem', outline: 'none', width: '100%' },
  select: { background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.5rem 0.75rem', color: 'var(--text)', fontSize: '0.9rem', outline: 'none', width: '100%' },
  textarea: { background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.5rem 0.75rem', color: 'var(--text)', fontSize: '0.9rem', outline: 'none', width: '100%', resize: 'vertical', minHeight: '80px' },
  actions: { display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' },
  cancelBtn: { background: 'none', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.5rem 1rem', color: 'var(--text-muted)', fontSize: '0.9rem' },
  submitBtn: { background: 'var(--accent)', border: 'none', borderRadius: '8px', padding: '0.5rem 1.25rem', color: '#0f0f11', fontSize: '0.9rem', fontWeight: 600 },
}

export default function JobForm({ onSubmit, onClose, initial = {} }) {
  const [form, setForm] = useState({
    company: '', role: '', status: 'wishlist', job_url: '',
    salary_range: '', contact_name: '', contact_email: '',
    applied_date: '', notes: '', ...initial
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const field = (k, type = 'text', placeholder = '') => (
    <input style={styles.input} type={type} placeholder={placeholder}
      value={form[k]} onChange={e => set(k, e.target.value)} />
  )

  return (
    <div style={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <span style={styles.title}>{initial.id ? 'Edit Application' : 'Add Application'}</span>
          <button style={styles.closeBtn} onClick={onClose}><X size={18} /></button>
        </div>

        <div style={styles.grid}>
          <div style={styles.field}>
            <label style={styles.label}>Company *</label>
            {field('company', 'text', 'Google')}
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Role *</label>
            {field('role', 'text', 'Software Engineer')}
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Status</label>
            <select style={styles.select} value={form.status} onChange={e => set('status', e.target.value)}>
              {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Applied Date</label>
            {field('applied_date', 'date')}
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Salary Range</label>
            {field('salary_range', 'text', '$100k–$130k')}
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Job URL</label>
            {field('job_url', 'url', 'https://...')}
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Contact Name</label>
            {field('contact_name', 'text', 'Jane Smith')}
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Contact Email</label>
            {field('contact_email', 'email', 'jane@company.com')}
          </div>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Notes</label>
          <textarea style={styles.textarea} placeholder="Referral from John, great culture fit..."
            value={form.notes} onChange={e => set('notes', e.target.value)} />
        </div>

        <div style={styles.actions}>
          <button style={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button style={styles.submitBtn} onClick={() => onSubmit(form)}
            disabled={!form.company || !form.role}>
            {initial.id ? 'Save Changes' : 'Add Job'}
          </button>
        </div>
      </div>
    </div>
  )
}
