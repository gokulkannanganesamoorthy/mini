import express from 'express'
import { getDB } from '../db.js'

const router = express.Router()

// ESP32 device bridge
router.post('/', async (req, res) => {
  const db = getDB()
  const { action, audio_base64, timestamp } = req.body

  switch (action) {
    case 'briefing': {
      const tasks = db.prepare("SELECT title, priority FROM tasks WHERE bucket = 'today' AND status != 'done' LIMIT 3").all()
      const events = db.prepare("SELECT title, start_time FROM calendar_events WHERE date(start_time) = date('now') LIMIT 3").all()
      const alarm = db.prepare('SELECT * FROM alarm WHERE enabled = 1 LIMIT 1').get()
      res.json({
        action: 'speak',
        text: buildBriefingText(tasks, events, alarm),
        tasks,
        events,
      })
      break
    }
    case 'alarm': {
      const alarm = db.prepare('SELECT * FROM alarm WHERE enabled = 1 LIMIT 1').get()
      res.json({
        action: 'speak',
        text: alarm ? alarm.message : 'Good morning Gokul!',
        time: alarm?.time,
      })
      break
    }
    case 'listen': {
      // ESP32 sends audio, server transcribes and responds
      res.json({ action: 'ready', message: 'Send audio to /api/voice/transcribe' })
      break
    }
    case 'status': {
      res.json({ action: 'status', status: 'online', assistant: 'Mini', timestamp: new Date().toISOString() })
      break
    }
    default:
      res.status(400).json({ error: 'Unknown action' })
  }
})

router.get('/status', (req, res) => {
  res.json({ status: 'online', version: '1.0.0', assistant: 'Mini' })
})

function buildBriefingText(tasks, events, alarm) {
  let text = 'Good morning Gokul! '
  const now = new Date()
  text += `It is ${now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })} on ${now.toLocaleDateString('en-IN', { weekday: 'long' })}. `
  if (events.length > 0) text += `You have ${events.length} event${events.length > 1 ? 's' : ''} today. `
  if (tasks.length > 0) text += `You have ${tasks.length} pending task${tasks.length > 1 ? 's' : ''} for today. `
  text += 'Have a great and productive day!'
  return text
}

export default router
