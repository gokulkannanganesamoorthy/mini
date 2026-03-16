import express from 'express'
import { getDB } from '../db.js'

const router = express.Router()

// Demo calendar events
const DEMO_EVENTS = [
  { id: 'e1', title: 'Client Call - Orrayson Studio', start_time: new Date().toISOString().slice(0,10) + 'T10:00:00', end_time: new Date().toISOString().slice(0,10) + 'T11:00:00', account: 'work', color: '#6366f1', location: 'Google Meet' },
  { id: 'e2', title: 'PSG Tech - IT Lab Session', start_time: new Date().toISOString().slice(0,10) + 'T14:00:00', end_time: new Date().toISOString().slice(0,10) + 'T16:00:00', account: 'college', color: '#06b6d4', location: 'PSG Tech Lab' },
  { id: 'e3', title: 'VulnScan Dev Session', start_time: new Date().toISOString().slice(0,10) + 'T18:00:00', end_time: new Date().toISOString().slice(0,10) + 'T20:00:00', account: 'personal', color: '#8b5cf6', location: 'Home' },
]

router.get('/', (req, res) => {
  const db = getDB()
  const { date } = req.query
  let events = db.prepare('SELECT * FROM calendar_events ORDER BY start_time').all()

  if (events.length === 0) {
    events = DEMO_EVENTS
  }

  if (date) {
    events = events.filter(e => e.start_time?.startsWith(date))
  }

  res.json({ events })
})

router.post('/', (req, res) => {
  const db = getDB()
  const { title, start_time, end_time, account = 'personal', color = '#6366f1', location = '', description = '' } = req.body
  if (!title || !start_time) return res.status(400).json({ error: 'Title and start time required' })
  const eventId = `local_${Date.now()}`
  db.prepare('INSERT OR REPLACE INTO calendar_events (event_id, title, start_time, end_time, account, color, location, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run(eventId, title, start_time, end_time, account, color, location, description)
  res.json({ event: db.prepare('SELECT * FROM calendar_events WHERE event_id = ?').get(eventId) })
})

router.delete('/:id', (req, res) => {
  const db = getDB()
  db.prepare('DELETE FROM calendar_events WHERE event_id = ?').run(req.params.id)
  res.json({ success: true })
})

export default router
