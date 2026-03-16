import express from 'express'
import { getDB } from '../db.js'

const router = express.Router()

// GET all memories
router.get('/', (req, res) => {
  const db = getDB()
  const { tag } = req.query
  let query = 'SELECT * FROM memories'
  const params = []
  if (tag) { query += ' WHERE tag = ?'; params.push(tag) }
  query += ' ORDER BY created_at DESC'
  res.json({ memories: db.prepare(query).all(...params) })
})

// POST add memory
router.post('/', (req, res) => {
  const db = getDB()
  const { content, tag = 'general' } = req.body
  if (!content) return res.status(400).json({ error: 'Content is required' })
  const result = db.prepare('INSERT INTO memories (content, tag) VALUES (?, ?)').run(content, tag)
  const memory = db.prepare('SELECT * FROM memories WHERE id = ?').get(result.lastInsertRowid)
  res.json({ memory })
})

// DELETE memory
router.delete('/:id', (req, res) => {
  const db = getDB()
  db.prepare('DELETE FROM memories WHERE id = ?').run(req.params.id)
  res.json({ success: true })
})

// PATCH memory
router.patch('/:id', (req, res) => {
  const db = getDB()
  const { content, tag } = req.body
  db.prepare('UPDATE memories SET content = COALESCE(?, content), tag = COALESCE(?, tag) WHERE id = ?')
    .run(content, tag, req.params.id)
  res.json({ memory: db.prepare('SELECT * FROM memories WHERE id = ?').get(req.params.id) })
})

// GET tags summary
router.get('/tags', (req, res) => {
  const db = getDB()
  const tags = db.prepare('SELECT tag, COUNT(*) as count FROM memories GROUP BY tag ORDER BY count DESC').all()
  res.json({ tags })
})

export default router
