import express from 'express'
import { getDB } from '../db.js'

const router = express.Router()

router.get('/', (req, res) => {
  const db = getDB()
  const alarm = db.prepare('SELECT * FROM alarm LIMIT 1').get()
  res.json({ alarm })
})

router.post('/', (req, res) => {
  const db = getDB()
  const { time, enabled, message } = req.body
  const existing = db.prepare('SELECT * FROM alarm LIMIT 1').get()
  if (existing) {
    db.prepare('UPDATE alarm SET time = COALESCE(?, time), enabled = COALESCE(?, enabled), message = COALESCE(?, message) WHERE id = ?')
      .run(time, enabled !== undefined ? (enabled ? 1 : 0) : null, message, existing.id)
  } else {
    db.prepare('INSERT INTO alarm (time, enabled, message) VALUES (?, ?, ?)').run(time || '07:00', 1, message || 'Good morning!')
  }
  res.json({ alarm: db.prepare('SELECT * FROM alarm LIMIT 1').get() })
})

export default router
