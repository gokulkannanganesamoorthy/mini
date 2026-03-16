import { Outlet, NavLink, useLocation } from 'react-router-dom'
import {
  Home, MessageSquare, CalendarDays, CheckSquare,
  Brain, Mail, Settings, Cpu, Activity
} from 'lucide-react'
import { useState, useEffect } from 'react'
import axios from 'axios'

const navItems = [
  { to: '/', icon: Home, label: 'Dashboard' },
  { to: '/chat', icon: MessageSquare, label: 'Chat' },
  { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { to: '/calendar', icon: CalendarDays, label: 'Calendar' },
  { to: '/messages', icon: Mail, label: 'Messages' },
  { to: '/memory', icon: Brain, label: 'Memory' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Layout() {
  const [serverOnline, setServerOnline] = useState(false)
  const [time, setTime] = useState(new Date())
  const [healthAlert, setHealthAlert] = useState(null)

  useEffect(() => {
    const check = async () => {
      try { await axios.get('/api/health'); setServerOnline(true) }
      catch { setServerOnline(false) }
    }
    check()

    const t = setInterval(() => {
      const now = new Date()
      setTime(now)
      checkHealthReminders(now, setHealthAlert)
    }, 60000)
    setInterval(check, 30000)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#000' }}>
      {/* Sidebar */}
      <aside style={{
        width: '220px', flexShrink: 0, display: 'flex', flexDirection: 'column',
        padding: '1.5rem 0.75rem',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(255,255,255,0.02)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0 0.5rem', marginBottom: '2rem' }}>
          <div style={{
            width: '2rem', height: '2rem', borderRadius: '50%', position: 'relative', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <div className="orb-idle" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
          </div>
          <div>
            <h1 style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, fontSize: '1.125rem', color: '#fff', lineHeight: 1 }}>mini</h1>
            <p style={{ fontSize: '0.65rem', color: '#444', marginTop: '0.25rem', letterSpacing: '0.05em' }}>AI PA COMPANION</p>
          </div>
        </div>

        {/* Time */}
        <div style={{ padding: '0 0.25rem', marginBottom: '1.5rem' }}>
          <div className="glass-card" style={{ padding: '0.75rem', borderRadius: '0.875rem' }}>
            <p style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600, fontSize: '1.125rem', color: '#fff' }}>
              {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
            </p>
            <p style={{ fontSize: '0.7rem', color: '#444', marginTop: '0.2rem' }}>
              {time.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <Icon size={15} style={{ flexShrink: 0 }} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Health alert */}
        {healthAlert && (
          <div className="glass-card animate-fade-in" style={{ padding: '0.75rem', marginBottom: '0.75rem', borderRadius: '0.875rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <Activity size={12} style={{ color: '#fff' }} />
              <span style={{ fontSize: '0.65rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Health</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#ccc' }}>{healthAlert}</p>
            <button onClick={() => setHealthAlert(null)} style={{ fontSize: '0.65rem', color: '#555', marginTop: '0.375rem', background: 'none', border: 'none', cursor: 'pointer' }}>Dismiss</button>
          </div>
        )}

        {/* Status */}
        <div style={{ padding: '0 0.5rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: serverOnline ? '#aaa' : '#444', flexShrink: 0 }} />
            <span style={{ fontSize: '0.7rem', color: '#444' }}>Server {serverOnline ? 'online' : 'offline'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Cpu size={10} style={{ color: '#333' }} />
            <span style={{ fontSize: '0.7rem', color: '#333' }}>ESP32 pending setup</span>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  )
}

function checkHealthReminders(now, setAlert) {
  const h = now.getHours(), m = now.getMinutes()
  const reminders = [
    { h: 22, m: 30, msg: '🌙 Time to wind down, Gokul. Aim to sleep before 11 PM.' },
    { h: 23, m: 30, msg: '😴 It\'s 11:30 PM — sleep now to wake up fresh at 7 AM.' },
    { h: 13, m: 0,  msg: '🥗 Lunch time! Step away from the screen for a bit.' },
    { h: 19, m: 0,  msg: '🧘 Evening break — stretch, breathe, recharge.' },
    { h: 17, m: 0,  msg: '💧 Drink some water and take a 5-min break.' },
  ]
  const match = reminders.find(r => r.h === h && m >= r.m && m < r.m + 2)
  if (match) setAlert(match.msg)
}
