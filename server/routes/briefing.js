import express from 'express'
import { getDB } from '../db.js'

const router = express.Router()

// GET morning briefing
router.get('/', (req, res) => {
  const db = getDB()
  const now = new Date()
  const hour = now.getHours()

  let greeting
  if (hour < 12) greeting = 'Good morning'
  else if (hour < 17) greeting = 'Good afternoon'
  else greeting = 'Good evening'

  const todayTasks = db.prepare("SELECT * FROM tasks WHERE bucket = 'today' AND status != 'done' ORDER BY CASE priority WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END").all()
  const todayEvents = db.prepare("SELECT * FROM calendar_events WHERE date(start_time) = date('now') ORDER BY start_time").all()
  const unreadMessages = db.prepare("SELECT platform, COUNT(*) as count FROM messages WHERE read = 0 GROUP BY platform").all()
  const alarm = db.prepare('SELECT * FROM alarm WHERE enabled = 1 LIMIT 1').get()
  const settings = db.prepare('SELECT key, value FROM settings').all()
  const settingsMap = Object.fromEntries(settings.map(s => [s.key, s.value]))

  const briefing = {
    greeting: `${greeting}, ${settingsMap.user_name || 'Gokul'}`,
    date: now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' }),
    time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' }),
    alarm: alarm ? { time: alarm.time, message: alarm.message } : null,
    todayTasks: { count: todayTasks.length, items: todayTasks.slice(0, 5) },
    events: { count: todayEvents.length, items: todayEvents.slice(0, 3) },
    unreadMessages,
    motivational: getMotivationalLine(hour),
  }

  res.json({ briefing })
})

function getMotivationalLine(hour) {
  const lines = [
    "Every line of code you write today is a step closer to the product you're building.",
    "You built VulnScan from scratch. Today is another day to build something great.",
    "Focus beats talent when talent doesn't focus.",
    "Ship it. Improve it. Repeat.",
    "Your E32 mini is waiting for you to build its brain. Let's go.",
    "One focused session is worth three distracted hours.",
    "Luno Tech doesn't build itself. You do.",
  ]
  return lines[Math.floor(Math.random() * lines.length)]
}

export default router
