import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

import { initDB } from './db.js'
import chatRouter from './routes/chat.js'
import voiceRouter from './routes/voice.js'
import calendarRouter from './routes/calendar.js'
import tasksRouter from './routes/tasks.js'
import memoryRouter from './routes/memory.js'
import alarmRouter from './routes/alarm.js'
import briefingRouter from './routes/briefing.js'
import messagesRouter from './routes/messages.js'
import callsRouter from './routes/calls.js'
import deviceRouter from './routes/device.js'
import webhookRouter from './routes/webhooks.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 4000

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// Init DB
initDB()

// Routes
app.use('/api/chat', chatRouter)
app.use('/api/voice', voiceRouter)
app.use('/api/calendar', calendarRouter)
app.use('/api/tasks', tasksRouter)
app.use('/api/memory', memoryRouter)
app.use('/api/alarm', alarmRouter)
app.use('/api/briefing', briefingRouter)
app.use('/api/messages', messagesRouter)
app.use('/api/calls', callsRouter)
app.use('/api/device', deviceRouter)
app.use('/api/webhook', webhookRouter)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0', assistant: 'Mini', time: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`\n\x1b[36m🤖 Mini AI PA Server\x1b[0m`)
  console.log(`\x1b[32m✓ Running on http://localhost:${PORT}\x1b[0m`)
  console.log(`\x1b[90m  Ready to assist Gokul\x1b[0m\n`)
})
