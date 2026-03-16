import { useState, useEffect } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { MessageSquare, CheckSquare, CalendarDays, ArrowRight, Zap, Activity, Moon } from 'lucide-react'

export default function Dashboard() {
  const [briefing, setBriefing] = useState(null)
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    fetchBriefing()
    return () => clearInterval(t)
  }, [])

  const fetchBriefing = async () => {
    try { const r = await axios.get('/api/briefing'); setBriefing(r.data.briefing) }
    catch {
      setBriefing({
        greeting: 'Good evening',
        date: new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }),
        todayTasks: { count: 3, items: [] },
        events: { count: 1, items: [] },
        unreadMessages: [],
        motivational: "Ship it. Improve it. Repeat.",
        alarm: { time: '07:00' }
      })
    }
  }

  const h = time.getHours()
  const greeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }} className="animate-fade-in">
      {/* Hero clock */}
      <div>
        <p style={{ fontSize: '0.75rem', color: '#444', marginBottom: '0.5rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {briefing?.date}
        </p>
        <div style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, fontSize: 'clamp(3rem, 7vw, 5.5rem)', color: '#fff', lineHeight: 1, letterSpacing: '-0.03em' }}>
          {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })}
        </div>
        <p style={{ marginTop: '0.75rem', fontSize: '1.25rem', color: '#888', fontWeight: 500 }}>
          {greeting}, <span style={{ color: '#f0f0f0' }}>Gokul</span>
        </p>
      </div>

      {/* Motivational strip */}
      {briefing?.motivational && (
        <div className="glass-card animate-fade-in" style={{ padding: '1rem 1.25rem', borderRadius: '1rem', borderLeft: '2px solid rgba(255,255,255,0.2)' }}>
          <p style={{ fontSize: '0.875rem', color: '#888', fontStyle: 'italic' }}>
            &ldquo;{briefing.motivational}&rdquo;
          </p>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        {[
          { label: 'Tasks today', value: briefing?.todayTasks?.count ?? 0, icon: CheckSquare, to: '/tasks' },
          { label: 'Events', value: briefing?.events?.count ?? 0, icon: CalendarDays, to: '/calendar' },
          { label: 'Unread', value: briefing?.unreadMessages?.reduce((a, b) => a + b.count, 0) ?? 0, icon: MessageSquare, to: '/messages' },
        ].map(({ label, value, icon: Icon, to }) => (
          <Link key={to} to={to} className="glass-card glass-hover" style={{ padding: '1.25rem', display: 'block', borderRadius: '1rem', textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Icon size={14} style={{ color: '#555' }} />
              <span style={{ fontSize: '0.7rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</span>
            </div>
            <span style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, fontSize: '2.25rem', color: '#fff' }}>{value}</span>
          </Link>
        ))}
      </div>

      {/* Two cols */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {/* Tasks */}
        <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f0f0f0' }}>Today's Tasks</span>
            <Link to="/tasks" style={{ fontSize: '0.7rem', color: '#555', display: 'flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none' }}>
              All <ArrowRight size={10} />
            </Link>
          </div>
          {briefing?.todayTasks?.items?.length > 0 ? (
            briefing.todayTasks.items.slice(0, 4).map((t, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.75rem', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: t.priority === 'high' ? '#fff' : '#333', flexShrink: 0, marginTop: '0.35rem' }} />
                <p style={{ fontSize: '0.8125rem', color: '#888' }}>{t.title}</p>
              </div>
            ))
          ) : <p style={{ fontSize: '0.8rem', color: '#444' }}>No tasks yet</p>}
          <Link to="/tasks" className="btn-ghost" style={{ marginTop: '1rem', width: '100%', justifyContent: 'center', display: 'flex', textDecoration: 'none', fontSize: '0.8125rem' }}>
            + Add task
          </Link>
        </div>

        {/* Health */}
        <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Activity size={14} style={{ color: '#555' }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f0f0f0' }}>Health & Routine</span>
          </div>
          {[
            { time: '07:00', label: 'Wake up', done: h >= 7 },
            { time: '13:00', label: 'Lunch break', done: h >= 13 },
            { time: '17:00', label: 'Water + stretch', done: h >= 17 },
            { time: '22:30', label: 'Wind down', done: h >= 22 },
            { time: '23:00', label: 'Sleep', done: h >= 23 },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: item.done ? '#fff' : '#222', border: !item.done ? '1px solid #333' : 'none', flexShrink: 0 }} />
                <span style={{ fontSize: '0.8125rem', color: item.done ? '#888' : '#ccc' }}>{item.label}</span>
              </div>
              <span style={{ fontSize: '0.7rem', color: '#444', fontFamily: 'monospace' }}>{item.time}</span>
            </div>
          ))}
          {briefing?.alarm && (
            <div style={{ marginTop: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Moon size={12} style={{ color: '#555' }} />
              <span style={{ fontSize: '0.75rem', color: '#555' }}>Alarm set for {briefing.alarm.time}</span>
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <p className="section-title">Quick actions</p>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/chat" className="btn-primary" style={{ textDecoration: 'none' }}>
            <MessageSquare size={14} /> Talk to Mini
          </Link>
          <Link to="/tasks" className="btn-ghost" style={{ textDecoration: 'none' }}>
            <CheckSquare size={14} /> Plan my day
          </Link>
          <Link to="/messages" className="btn-ghost" style={{ textDecoration: 'none' }}>
            <MessageSquare size={14} /> Messages
          </Link>
        </div>
      </div>
    </div>
  )
}
