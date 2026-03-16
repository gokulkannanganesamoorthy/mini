import express from 'express'
import { getDB } from '../db.js'

const router = express.Router()

// iPhone Shortcuts webhook
router.post('/shortcuts', (req, res) => {
  const db = getDB()
  const { event, from, body, platform = 'imessage' } = req.body
  if (!event) return res.status(400).json({ error: 'Event required' })

  if (event === 'message_received' && from && body) {
    db.prepare('INSERT INTO messages (platform, contact, direction, body) VALUES (?, ?, ?, ?)').run(platform, from, 'inbound', body)
    const suggestion = `Hi ${from}! Gokul is currently busy. He'll get back to you as soon as possible.`
    return res.json({
      received: true,
      suggestion,
      notification: `New message from ${from}: "${body.slice(0, 50)}${body.length > 50 ? '...' : ''}"`
    })
  }

  if (event === 'call_missed' && from) {
    db.prepare('INSERT INTO calls (from_number, direction, status) VALUES (?, ?, ?)').run(from, 'inbound', 'missed')
    return res.json({ received: true, auto_reply: `Missed call from ${from} logged.` })
  }

  res.json({ received: true })
})

// WhatsApp webhook verification (Meta)
router.get('/whatsapp', (req, res) => {
  const mode = req.query['hub.mode']
  const token = req.query['hub.verify_token']
  const challenge = req.query['hub.challenge']
  if (mode === 'subscribe' && token === process.env.META_WHATSAPP_VERIFY_TOKEN) {
    res.status(200).send(challenge)
  } else {
    res.status(403).send('Forbidden')
  }
})

// WhatsApp incoming message webhook
router.post('/whatsapp', (req, res) => {
  const db = getDB()
  try {
    const entry = req.body?.entry?.[0]
    const changes = entry?.changes?.[0]
    const msg = changes?.value?.messages?.[0]
    if (msg) {
      const from = msg.from
      const body = msg.text?.body || '[media]'
      db.prepare('INSERT INTO messages (platform, contact, direction, body) VALUES (?, ?, ?, ?)').run('whatsapp', from, 'inbound', body)
    }
  } catch (_) {}
  res.sendStatus(200)
})

// Instagram webhook verification
router.get('/instagram', (req, res) => {
  const mode = req.query['hub.mode']
  const token = req.query['hub.verify_token']
  const challenge = req.query['hub.challenge']
  if (mode === 'subscribe' && token === process.env.META_INSTAGRAM_VERIFY_TOKEN) {
    res.status(200).send(challenge)
  } else {
    res.status(403).send('Forbidden')
  }
})

// Instagram incoming DM webhook
router.post('/instagram', (req, res) => {
  const db = getDB()
  try {
    const msg = req.body?.entry?.[0]?.messaging?.[0]
    if (msg?.message?.text) {
      db.prepare('INSERT INTO messages (platform, contact, direction, body) VALUES (?, ?, ?, ?)').run('instagram', msg.sender?.id || 'unknown', 'inbound', msg.message.text)
    }
  } catch (_) {}
  res.sendStatus(200)
})

export default router
