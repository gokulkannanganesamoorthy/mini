import express from 'express'
import { getDB } from '../db.js'

const router = express.Router()

router.get('/', (req, res) => {
  const db = getDB()
  const settings = db.prepare('SELECT key, value FROM settings').all()
  const settingsMap = Object.fromEntries(settings.map(s => [s.key, s.value]))
  res.json({ settings: settingsMap })
})

router.post('/', (req, res) => {
  const db = getDB()
  const updates = req.body
  const upsert = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)')
  Object.entries(updates).forEach(([k, v]) => upsert.run(k, String(v)))
  res.json({ success: true })
})

export default router
