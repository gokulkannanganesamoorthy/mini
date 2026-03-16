import { useState, useEffect } from 'react'
import axios from 'axios'
import { Plus, Check, Trash2, Calendar, Clock, Sparkles } from 'lucide-react'

const BUCKETS = ['today', 'week', 'someday']
const PRIORITY_STYLE = {
  high:   { dot: '#fff',  label: 'rgba(255,255,255,0.9)',  bg: 'rgba(255,255,255,0.08)',  border: 'rgba(255,255,255,0.2)' },
  medium: { dot: '#666',  label: 'rgba(255,255,255,0.5)',  bg: 'rgba(255,255,255,0.04)',  border: 'rgba(255,255,255,0.1)' },
  low:    { dot: '#333',  label: 'rgba(255,255,255,0.3)',  bg: 'rgba(255,255,255,0.02)',  border: 'rgba(255,255,255,0.06)' },
}

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [bucket, setBucket] = useState('today')
  const [showAdd, setShowAdd] = useState(false)
  const [dayPlan, setDayPlan] = useState(null)
  const [view, setView] = useState('list')
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', due_date: '', bucket: 'today' })

  useEffect(() => { fetchTasks() }, [])

  const fetchTasks = async () => {
    try { const r = await axios.get('/api/tasks'); setTasks(r.data.tasks) } catch {}
  }

  const addTask = async () => {
    if (!form.title.trim()) return
    await axios.post('/api/tasks', form)
    setForm({ title: '', description: '', priority: 'medium', due_date: '', bucket: 'today' })
    setShowAdd(false); fetchTasks()
  }

  const toggle = async (task) => {
    await axios.patch(`/api/tasks/${task.id}`, { status: task.status === 'done' ? 'todo' : 'done' })
    fetchTasks()
  }

  const del = async (id) => { await axios.delete(`/api/tasks/${id}`); fetchTasks() }

  const generatePlan = async () => {
    const r = await axios.post('/api/tasks/plan'); setDayPlan(r.data.plan); setView('plan')
  }

  const filtered = tasks.filter(t => t.bucket === bucket)

  return (
    <div style={{ padding: '2.5rem' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, fontSize: '1.5rem', color: '#fff' }}>Tasks</h1>
          <p style={{ fontSize: '0.8rem', color: '#555', marginTop: '0.25rem' }}>
            {tasks.filter(t => t.status !== 'done').length} pending
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={generatePlan} className="btn-ghost"><Sparkles size={13} /> Plan my day</button>
          <button onClick={() => { setShowAdd(true); setView('list') }} className="btn-primary"><Plus size={13} /> Add task</button>
        </div>
      </div>

      {/* Bucket tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {BUCKETS.map(b => (
          <button key={b} onClick={() => { setBucket(b); setView('list') }} style={{
            padding: '0.375rem 1rem', borderRadius: '0.625rem', fontSize: '0.8125rem', fontWeight: 500,
            border: '1px solid', cursor: 'pointer', transition: 'all 0.2s',
            background: bucket === b && view === 'list' ? '#fff' : 'rgba(255,255,255,0.04)',
            color: bucket === b && view === 'list' ? '#000' : '#555',
            borderColor: bucket === b && view === 'list' ? '#fff' : 'rgba(255,255,255,0.08)',
          }}>
            {b === 'today' ? 'Today' : b === 'week' ? 'This Week' : 'Someday'}
            <span style={{ marginLeft: '0.4rem', opacity: 0.5 }}>{tasks.filter(t => t.bucket === b && t.status !== 'done').length}</span>
          </button>
        ))}
        <button onClick={() => setView('plan')} style={{
          padding: '0.375rem 1rem', borderRadius: '0.625rem', fontSize: '0.8125rem', fontWeight: 500,
          border: '1px solid', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.4rem',
          background: view === 'plan' ? '#fff' : 'rgba(255,255,255,0.04)',
          color: view === 'plan' ? '#000' : '#555',
          borderColor: view === 'plan' ? '#fff' : 'rgba(255,255,255,0.08)',
        }}>
          <Clock size={12} /> Day Plan
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="glass-card animate-slide-up" style={{ padding: '1.25rem', marginBottom: '1.5rem', borderRadius: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <input className="input" placeholder="Task title..." value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} onKeyDown={e => e.key === 'Enter' && addTask()} autoFocus />
            <input className="input" placeholder="Description (optional)" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <select className="input" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                <option value="high">High priority</option>
                <option value="medium">Medium priority</option>
                <option value="low">Low priority</option>
              </select>
              <select className="input" value={form.bucket} onChange={e => setForm({ ...form, bucket: e.target.value })}>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="someday">Someday</option>
              </select>
              <input type="date" className="input" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button onClick={() => setShowAdd(false)} className="btn-ghost">Cancel</button>
              <button onClick={addTask} className="btn-primary">Add Task</button>
            </div>
          </div>
        </div>
      )}

      {/* Day Plan */}
      {view === 'plan' && dayPlan && (
        <div className="glass-card animate-fade-in" style={{ padding: '1.5rem', borderRadius: '1rem' }}>
          <h3 style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600, color: '#fff', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={15} style={{ color: '#888' }} /> AI Day Plan
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {dayPlan.map((slot, i) => (
              <div key={i} style={{ display: 'flex', gap: '1.25rem', paddingBottom: '0.875rem', marginBottom: '0.875rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontFamily: 'monospace', fontSize: '0.8125rem', color: '#444', width: '3.5rem', flexShrink: 0, paddingTop: '0.1rem' }}>{slot.time}</span>
                <div>
                  <p style={{ fontSize: '0.875rem', color: slot.taskId ? '#f0f0f0' : '#666' }}>{slot.label}</p>
                  {slot.priority && <span style={{ fontSize: '0.65rem', color: PRIORITY_STYLE[slot.priority]?.label, marginTop: '0.2rem', display: 'inline-block' }}>{slot.priority}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === 'plan' && !dayPlan && (
        <div style={{ textAlign: 'center', padding: '5rem 0' }}>
          <Sparkles size={32} style={{ color: '#333', margin: '0 auto 1rem' }} />
          <p style={{ color: '#555', fontSize: '0.875rem' }}>Click "Plan my day" to generate a schedule</p>
        </div>
      )}

      {/* Task list */}
      {view === 'list' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '5rem 0' }}>
              <p style={{ color: '#444', fontSize: '0.875rem' }}>No tasks in this bucket 🎉</p>
            </div>
          )}
          {filtered.map(task => {
            const p = PRIORITY_STYLE[task.priority] || PRIORITY_STYLE.medium
            return (
              <div key={task.id} className="glass-card" style={{
                padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem',
                opacity: task.status === 'done' ? 0.4 : 1, transition: 'all 0.2s', borderRadius: '0.875rem'
              }}>
                <button onClick={() => toggle(task)} style={{
                  width: '18px', height: '18px', borderRadius: '50%', border: `1.5px solid ${task.status === 'done' ? '#fff' : '#333'}`,
                  background: task.status === 'done' ? '#fff' : 'transparent', flexShrink: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
                }}>
                  {task.status === 'done' && <Check size={10} style={{ color: '#000' }} />}
                </button>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: 500, color: task.status === 'done' ? '#555' : '#f0f0f0', textDecoration: task.status === 'done' ? 'line-through' : 'none' }}>{task.title}</p>
                  {task.description && <p style={{ fontSize: '0.75rem', color: '#555', marginTop: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.description}</p>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                  {task.due_date && <span style={{ fontSize: '0.7rem', color: '#444', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Calendar size={10} />{task.due_date}</span>}
                  <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem', borderRadius: '99px', background: p.bg, color: p.label, border: `1px solid ${p.border}` }}>{task.priority}</span>
                  <button onClick={() => del(task.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#333', padding: '0.2rem' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
