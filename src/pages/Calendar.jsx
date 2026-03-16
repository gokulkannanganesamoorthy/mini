import { useState, useEffect } from 'react'
import axios from 'axios'
import { CalendarDays, Plus, Trash2, ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns'

const ACCOUNTS = ['work', 'college', 'personal']
// Monochrome colors: white, gray, darker gray
const ACCOUNT_COLORS = { work: '#ffffff', college: '#888888', personal: '#444444' }

export default function Calendar() {
  const [events, setEvents] = useState([])
  const [current, setCurrent] = useState(new Date())
  const [selected, setSelected] = useState(new Date())
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ title: '', start_time: '', end_time: '', account: 'personal', location: '', description: '' })

  useEffect(() => { fetchEvents() }, [])

  const fetchEvents = async () => {
    try { const res = await axios.get('/api/calendar'); setEvents(res.data.events) } catch {}
  }

  const addEvent = async () => {
    if (!form.title || !form.start_time) return
    await axios.post('/api/calendar', { ...form, color: ACCOUNT_COLORS[form.account] })
    setForm({ title: '', start_time: '', end_time: '', account: 'personal', location: '', description: '' })
    setShowAdd(false)
    fetchEvents()
  }

  const deleteEvent = async (id) => {
    await axios.delete(`/api/calendar/${id}`)
    fetchEvents()
  }

  const daysInMonth = eachDayOfInterval({ start: startOfMonth(current), end: endOfMonth(current) })
  const startDay = startOfMonth(current).getDay()
  const selectedEvents = events.filter(e => {
    const d = new Date(e.start_time)
    return d.getFullYear() === selected.getFullYear() && d.getMonth() === selected.getMonth() && d.getDate() === selected.getDate()
  })

  return (
    <div style={{ padding: '2.5rem' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, fontSize: '1.5rem', color: '#fff' }}>Calendar</h1>
          <p style={{ fontSize: '0.8rem', color: '#555', marginTop: '0.25rem', display: 'flex', gap: '1rem' }}>
            {ACCOUNTS.map(a => (
              <span key={a} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: ACCOUNT_COLORS[a] }} />
                <span style={{ textTransform: 'capitalize' }}>{a}</span>
              </span>
            ))}
          </p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary"><Plus size={13} /> Add event</button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="glass-card animate-slide-up" style={{ padding: '1.25rem', marginBottom: '1.5rem', borderRadius: '1rem' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f0f0f0', marginBottom: '1rem' }}>New Event</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
            <input className="input" style={{ gridColumn: 'span 2' }} placeholder="Event title..." value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <div>
              <label style={{ fontSize: '0.7rem', color: '#555', marginBottom: '0.25rem', display: 'block' }}>Start</label>
              <input type="datetime-local" className="input" value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: '0.7rem', color: '#555', marginBottom: '0.25rem', display: 'block' }}>End</label>
              <input type="datetime-local" className="input" value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })} />
            </div>
            <select className="input" value={form.account} onChange={e => setForm({ ...form, account: e.target.value })}>
              {ACCOUNTS.map(a => <option key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</option>)}
            </select>
            <input className="input" placeholder="Location (optional)" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button onClick={() => setShowAdd(false)} className="btn-ghost">Cancel</button>
            <button onClick={addEvent} className="btn-primary">Add Event</button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
        {/* Calendar grid */}
        <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <button onClick={() => setCurrent(new Date(current.getFullYear(), current.getMonth() - 1))} className="btn-ghost" style={{ padding: '0.4rem' }}>
              <ChevronLeft size={14} />
            </button>
            <h2 style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600, color: '#f0f0f0' }}>{format(current, 'MMMM yyyy')}</h2>
            <button onClick={() => setCurrent(new Date(current.getFullYear(), current.getMonth() + 1))} className="btn-ghost" style={{ padding: '0.4rem' }}>
              <ChevronRight size={14} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '0.5rem' }}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <div key={i} style={{ textAlign: 'center', fontSize: '0.7rem', color: '#444', padding: '0.25rem' }}>{d}</div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
            {Array(startDay).fill(null).map((_, i) => <div key={`empty-${i}`} />)}
            {daysInMonth.map(day => {
              const dayEvents = events.filter(e => isSameDay(new Date(e.start_time), day))
              const isSel = isSameDay(day, selected)
              const isTod = isToday(day)
              return (
                <button key={day.toISOString()} onClick={() => setSelected(day)} style={{
                  aspectRatio: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start',
                  padding: '0.25rem', borderRadius: '0.5rem', transition: 'all 0.2s', border: 'none', cursor: 'pointer',
                  background: isSel ? '#fff' : isTod ? 'rgba(255,255,255,0.08)' : 'transparent',
                  color: isSel ? '#000' : isTod ? '#fff' : '#666',
                }}>
                  <span style={{ fontSize: '0.75rem' }}>{format(day, 'd')}</span>
                  {dayEvents.length > 0 && (
                    <div style={{ display: 'flex', gap: '2px', marginTop: 'auto', marginBottom: '2px', flexWrap: 'wrap', justifyContent: 'center' }}>
                      {dayEvents.slice(0, 3).map((e, i) => (
                        <span key={i} style={{ width: '4px', height: '4px', borderRadius: '50%', background: isSel ? '#000' : (e.color || '#fff') }} />
                      ))}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Selected day events */}
        <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '1rem', alignSelf: 'start' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f0f0f0', marginBottom: '1.25rem' }}>
            {format(selected, 'MMM d')} — {selectedEvents.length} events
          </h3>
          {selectedEvents.length === 0 ? (
            <p style={{ color: '#444', fontSize: '0.8rem' }}>No events scheduled</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {selectedEvents.map((e) => (
                <div key={e.id || e.event_id} className="glass-card" style={{
                  padding: '0.875rem', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.06)',
                  background: 'rgba(255,255,255,0.03)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#f0f0f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', marginTop: '0.4rem' }}>
                        <p style={{ fontSize: '0.75rem', color: '#555', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Clock size={10} />
                          {new Date(e.start_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </p>
                        {e.location && <p style={{ fontSize: '0.75rem', color: '#555', display: 'flex', alignItems: 'center', gap: '0.35rem' }}><MapPin size={10} />{e.location}</p>}
                      </div>
                    </div>
                    <button onClick={() => deleteEvent(e.event_id || e.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#333', padding: '0.2rem' }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <div style={{ marginTop: '0.75rem' }}>
                    <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem', borderRadius: '99px', background: 'rgba(255,255,255,0.06)', color: '#666', border: '1px solid rgba(255,255,255,0.08)' }}>
                      {e.account || 'personal'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
