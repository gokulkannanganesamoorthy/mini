import express from 'express'
import { getDB } from '../db.js'

const router = express.Router()

// GET all tasks (optionally filtered by bucket)
router.get('/', (req, res) => {
  const db = getDB()
  const { bucket, status } = req.query
  let query = 'SELECT * FROM tasks'
  const params = []
  const conditions = []
  if (bucket) { conditions.push('bucket = ?'); params.push(bucket) }
  if (status) { conditions.push('status = ?'); params.push(status) }
  if (conditions.length) query += ' WHERE ' + conditions.join(' AND ')
  query += ' ORDER BY CASE priority WHEN "high" THEN 0 WHEN "medium" THEN 1 ELSE 2 END, created_at DESC'
  res.json({ tasks: db.prepare(query).all(...params) })
})

// POST create task
router.post('/', (req, res) => {
  const db = getDB()
  const { title, description = '', due_date = null, priority = 'medium', bucket = 'today' } = req.body
  if (!title) return res.status(400).json({ error: 'Title is required' })
  const result = db.prepare(
    'INSERT INTO tasks (title, description, due_date, priority, status, bucket) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(title, description, due_date, priority, 'todo', bucket)
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid)
  res.json({ task })
})

// PATCH update task
router.patch('/:id', (req, res) => {
  const db = getDB()
  const { title, description, due_date, priority, status, bucket } = req.body
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id)
  if (!task) return res.status(404).json({ error: 'Task not found' })
  db.prepare(`UPDATE tasks SET 
    title = COALESCE(?, title),
    description = COALESCE(?, description),
    due_date = COALESCE(?, due_date),
    priority = COALESCE(?, priority),
    status = COALESCE(?, status),
    bucket = COALESCE(?, bucket)
    WHERE id = ?`
  ).run(title, description, due_date, priority, status, bucket, req.params.id)
  res.json({ task: db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id) })
})

// DELETE task
router.delete('/:id', (req, res) => {
  const db = getDB()
  db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id)
  res.json({ success: true })
})

// POST AI day plan
router.post('/plan', async (req, res) => {
  const db = getDB()
  const tasks = db.prepare("SELECT * FROM tasks WHERE status != 'done' ORDER BY CASE priority WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END").all()
  
  const plan = generateDayPlan(tasks)
  res.json({ plan })
})

function generateDayPlan(tasks) {
  const slots = [
    { time: '07:00', label: 'Wake up & Morning routine' },
    { time: '07:30', label: 'Breakfast & Review day' },
  ]
  let hour = 9
  tasks.slice(0, 6).forEach((task) => {
    slots.push({ time: `${String(hour).padStart(2,'0')}:00`, label: task.title, taskId: task.id, priority: task.priority })
    hour += task.priority === 'high' ? 2 : 1
    if (hour >= 12 && hour < 13) { slots.push({ time: '12:30', label: 'Lunch break' }); hour = 14 }
  })
  slots.push({ time: '18:00', label: 'Wrap up & Review tomorrow' })
  slots.push({ time: '22:30', label: 'Wind down & Sleep by 11 PM' })
  return slots
}

export default router
