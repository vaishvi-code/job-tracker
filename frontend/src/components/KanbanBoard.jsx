import { useState } from 'react'
import { DndContext, DragOverlay, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ExternalLink, Mail, Pencil, Trash2, GripVertical } from 'lucide-react'

const COLUMNS = [
  { id: 'wishlist',     label: '⭐ Wishlist',      color: 'var(--wishlist)' },
  { id: 'applied',      label: '📨 Applied',        color: 'var(--applied)' },
  { id: 'interviewing', label: '💬 Interviewing',   color: 'var(--interviewing)' },
  { id: 'offer',        label: '🎉 Offer',           color: 'var(--offer)' },
  { id: 'rejected',     label: '❌ Rejected',        color: 'var(--rejected)' },
]

function JobCard({ job, onEdit, onDelete, onEmail, isDragging }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: job.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }

  return (
    <div ref={setNodeRef} style={{ ...cardStyle, ...style }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
        <span {...attributes} {...listeners} style={gripStyle}><GripVertical size={14} /></span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={companyStyle}>{job.company}</div>
          <div style={roleStyle}>{job.role}</div>
          {job.salary_range && <div style={salaryStyle}>{job.salary_range}</div>}
          {job.applied_date && <div style={dateStyle}>Applied {job.applied_date}</div>}
        </div>
      </div>
      <div style={actionsStyle}>
        {job.job_url && (
          <a href={job.job_url} target="_blank" rel="noopener noreferrer" style={iconBtn}>
            <ExternalLink size={13} />
          </a>
        )}
        <button style={iconBtn} onClick={() => onEmail(job)} title="Generate email">
          <Mail size={13} />
        </button>
        <button style={iconBtn} onClick={() => onEdit(job)} title="Edit">
          <Pencil size={13} />
        </button>
        <button style={{ ...iconBtn, color: 'var(--danger)' }} onClick={() => onDelete(job.id)} title="Delete">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}

const cardStyle = {
  background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '8px',
  padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem',
  cursor: 'grab',
}
const companyStyle = { fontWeight: 600, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }
const roleStyle = { fontSize: '0.8rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }
const salaryStyle = { fontSize: '0.75rem', color: 'var(--accent)', fontFamily: 'DM Mono, monospace' }
const dateStyle = { fontSize: '0.7rem', color: 'var(--text-muted)' }
const actionsStyle = { display: 'flex', gap: '4px', justifyContent: 'flex-end' }
const iconBtn = { background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '3px', display: 'flex', alignItems: 'center', borderRadius: '4px', textDecoration: 'none' }
const gripStyle = { color: 'var(--border)', cursor: 'grab', paddingTop: '2px', flexShrink: 0 }

export default function KanbanBoard({ jobs, onUpdate, onEdit, onDelete, onEmail }) {
  const [activeId, setActiveId] = useState(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const byStatus = (status) => jobs.filter(j => j.status === status)

  const handleDragEnd = ({ active, over }) => {
    setActiveId(null)
    if (!over || active.id === over.id) return

    // Find what column the card was dropped over
    const overJob = jobs.find(j => j.id === over.id)
    const overColumn = COLUMNS.find(c => c.id === over.id)
    const newStatus = overColumn?.id || overJob?.status
    if (!newStatus) return

    const draggedJob = jobs.find(j => j.id === active.id)
    if (draggedJob && draggedJob.status !== newStatus) {
      onUpdate(active.id, { status: newStatus })
    }
  }

  const activeJob = jobs.find(j => j.id === activeId)

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter}
      onDragStart={({ active }) => setActiveId(active.id)}
      onDragEnd={handleDragEnd}>
      <div style={boardStyle}>
        {COLUMNS.map(col => {
          const colJobs = byStatus(col.id)
          return (
            <div key={col.id} id={col.id} style={columnStyle}>
              <div style={colHeaderStyle}>
                <span style={{ ...colDotStyle, background: col.color }} />
                <span style={colLabelStyle}>{col.label}</span>
                <span style={colCountStyle}>{colJobs.length}</span>
              </div>
              <SortableContext items={colJobs.map(j => j.id)} strategy={verticalListSortingStrategy}>
                <div style={colBodyStyle}>
                  {colJobs.map(job => (
                    <JobCard key={job.id} job={job}
                      onEdit={onEdit} onDelete={onDelete} onEmail={onEmail}
                      isDragging={job.id === activeId} />
                  ))}
                  {colJobs.length === 0 && (
                    <div style={emptyStyle}>Drop here</div>
                  )}
                </div>
              </SortableContext>
            </div>
          )
        })}
      </div>
      <DragOverlay>
        {activeJob && <JobCard job={activeJob} onEdit={() => {}} onDelete={() => {}} onEmail={() => {}} />}
      </DragOverlay>
    </DndContext>
  )
}

const boardStyle = { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', overflowX: 'auto', minHeight: '400px' }
const columnStyle = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '180px' }
const colHeaderStyle = { display: 'flex', alignItems: 'center', gap: '6px', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }
const colDotStyle = { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 }
const colLabelStyle = { fontSize: '0.8rem', fontWeight: 600, flex: 1 }
const colCountStyle = { fontSize: '0.75rem', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '999px', padding: '1px 7px', color: 'var(--text-muted)' }
const colBodyStyle = { display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }
const emptyStyle = { fontSize: '0.75rem', color: 'var(--border)', textAlign: 'center', padding: '1.5rem 0', border: '1px dashed var(--border)', borderRadius: '6px' }
