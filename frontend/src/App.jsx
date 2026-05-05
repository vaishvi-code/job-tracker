import { useState, useEffect } from 'react'
import { Plus, LayoutDashboard, List } from 'lucide-react'
import toast from 'react-hot-toast'
import { jobsApi } from './api'
import KanbanBoard from './components/KanbanBoard'
import JobForm from './components/JobForm'
import EmailModal from './components/EmailModal'

const STATUSES = ['wishlist', 'applied', 'interviewing', 'offer', 'rejected']
const STATUS_COLORS = { wishlist: 'var(--wishlist)', applied: 'var(--applied)', interviewing: 'var(--interviewing)', offer: 'var(--offer)', rejected: 'var(--rejected)' }

export default function App() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('kanban') // 'kanban' | 'list'
  const [showForm, setShowForm] = useState(false)
  const [editJob, setEditJob] = useState(null)
  const [emailJob, setEmailJob] = useState(null)

  const loadJobs = async () => {
    try {
      const data = await jobsApi.getAll()
      setJobs(data)
    } catch {
      toast.error('Could not connect to backend. Is it running?')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadJobs() }, [])

  const handleCreate = async (form) => {
    try {
      const job = await jobsApi.create(form)
      setJobs(prev => [job, ...prev])
      setShowForm(false)
      toast.success('Job added!')
    } catch { toast.error('Failed to add job') }
  }

  const handleUpdate = async (id, data) => {
    try {
      const updated = await jobsApi.update(id, data)
      setJobs(prev => prev.map(j => j.id === id ? updated : j))
      setEditJob(null)
      if (data.company !== undefined) toast.success('Job updated!')
    } catch { toast.error('Failed to update job') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this application?')) return
    try {
      await jobsApi.delete(id)
      setJobs(prev => prev.filter(j => j.id !== id))
      toast.success('Deleted')
    } catch { toast.error('Failed to delete') }
  }

  const stats = STATUSES.map(s => ({ status: s, count: jobs.filter(j => j.status === s).length }))

  return (
    <div style={appStyle}>
      {/* Header */}
      <header style={headerStyle}>
        <div style={logoStyle}>
          <span style={logoMark}>JT</span>
          <span style={logoText}>Job Tracker</span>
        </div>
        <div style={headerActions}>
          <div style={viewToggle}>
            <button style={viewBtn(view === 'kanban')} onClick={() => setView('kanban')}>
              <LayoutDashboard size={14} /> Kanban
            </button>
            <button style={viewBtn(view === 'list')} onClick={() => setView('list')}>
              <List size={14} /> List
            </button>
          </div>
          <button style={addBtn} onClick={() => setShowForm(true)}>
            <Plus size={16} /> Add Job
          </button>
        </div>
      </header>

      {/* Stats bar */}
      <div style={statsBar}>
        <div style={statTotal}>
          <span style={statNum}>{jobs.length}</span>
          <span style={statLabel}>Total</span>
        </div>
        {stats.map(({ status, count }) => (
          <div key={status} style={statItem}>
            <span style={{ ...statDot, background: STATUS_COLORS[status] }} />
            <span style={statNum}>{count}</span>
            <span style={statLabel}>{status}</span>
          </div>
        ))}
      </div>

      {/* Main content */}
      <main style={mainStyle}>
        {loading ? (
          <div style={emptyState}>Loading your applications...</div>
        ) : view === 'kanban' ? (
          <KanbanBoard jobs={jobs} onUpdate={handleUpdate}
            onEdit={setEditJob} onDelete={handleDelete} onEmail={setEmailJob} />
        ) : (
          <div style={listStyle}>
            {jobs.length === 0 && <div style={emptyState}>No applications yet. Add your first one!</div>}
            {jobs.map(job => (
              <div key={job.id} style={listRow}>
                <span style={{ ...statusBadge, color: STATUS_COLORS[job.status], borderColor: STATUS_COLORS[job.status] }}>
                  {job.status}
                </span>
                <span style={listCompany}>{job.company}</span>
                <span style={listRole}>{job.role}</span>
                {job.salary_range && <span style={listSalary}>{job.salary_range}</span>}
                <div style={listActions}>
                  <button style={iconAction} onClick={() => setEmailJob(job)}>✉️</button>
                  <button style={iconAction} onClick={() => setEditJob(job)}>✏️</button>
                  <button style={iconAction} onClick={() => handleDelete(job.id)}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      {showForm && <JobForm onSubmit={handleCreate} onClose={() => setShowForm(false)} />}
      {editJob && <JobForm initial={editJob} onSubmit={(data) => handleUpdate(editJob.id, data)} onClose={() => setEditJob(null)} />}
      {emailJob && <EmailModal job={emailJob} onClose={() => setEmailJob(null)} />}
    </div>
  )
}

const appStyle = { minHeight: '100vh', display: 'flex', flexDirection: 'column' }
const headerStyle = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }
const logoStyle = { display: 'flex', alignItems: 'center', gap: '10px' }
const logoMark = { background: 'var(--accent)', color: '#0f0f11', fontWeight: 700, fontSize: '0.85rem', padding: '4px 8px', borderRadius: '6px', fontFamily: 'DM Mono, monospace' }
const logoText = { fontWeight: 600, fontSize: '1rem' }
const headerActions = { display: 'flex', alignItems: 'center', gap: '0.75rem' }
const viewToggle = { display: 'flex', background: 'var(--surface2)', borderRadius: '8px', padding: '2px', border: '1px solid var(--border)' }
const viewBtn = (active) => ({ display: 'flex', alignItems: 'center', gap: '5px', padding: '0.35rem 0.75rem', borderRadius: '6px', border: 'none', background: active ? 'var(--surface)' : 'none', color: active ? 'var(--text)' : 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: active ? 600 : 400 })
const addBtn = { display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--accent)', border: 'none', borderRadius: '8px', padding: '0.5rem 1rem', color: '#0f0f11', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }
const statsBar = { display: 'flex', gap: '1.5rem', padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--border)', background: 'var(--surface)', overflowX: 'auto' }
const statTotal = { display: 'flex', alignItems: 'center', gap: '6px', paddingRight: '1.5rem', borderRight: '1px solid var(--border)' }
const statItem = { display: 'flex', alignItems: 'center', gap: '5px' }
const statDot = { width: 8, height: 8, borderRadius: '50%' }
const statNum = { fontWeight: 700, fontSize: '0.95rem', fontFamily: 'DM Mono, monospace' }
const statLabel = { fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }
const mainStyle = { flex: 1, padding: '1.25rem 1.5rem', overflowX: 'auto' }
const emptyState = { color: 'var(--text-muted)', textAlign: 'center', padding: '4rem', fontSize: '0.9rem' }
const listStyle = { display: 'flex', flexDirection: 'column', gap: '0.5rem' }
const listRow = { display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.75rem 1rem' }
const statusBadge = { fontSize: '0.7rem', fontWeight: 600, border: '1px solid', borderRadius: '999px', padding: '2px 8px', textTransform: 'uppercase', letterSpacing: '0.05em', flexShrink: 0 }
const listCompany = { fontWeight: 600, fontSize: '0.9rem', minWidth: 120 }
const listRole = { color: 'var(--text-muted)', fontSize: '0.85rem', flex: 1 }
const listSalary = { fontFamily: 'DM Mono, monospace', fontSize: '0.8rem', color: 'var(--accent)' }
const listActions = { display: 'flex', gap: '4px', marginLeft: 'auto' }
const iconAction = { background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', padding: '4px 6px', borderRadius: '4px' }
