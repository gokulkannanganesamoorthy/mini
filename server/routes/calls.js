import express from 'express'
import { getDB } from '../db.js'
import axios from 'axios'

const router = express.Router()

function getTwilio() {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = process.env
  if (!TWILIO_ACCOUNT_SID || TWILIO_ACCOUNT_SID === 'your_twilio_account_sid') return null
  const { default: twilio } = require('twilio')
  return twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
}

// POST make outbound call
router.post('/make', async (req, res) => {
  const { to, script = "Hi, this is Mini, Gokul's AI assistant. He will call you back shortly." } = req.body
  const db = getDB()
  
  if (!process.env.TWILIO_ACCOUNT_SID || process.env.TWILIO_ACCOUNT_SID === 'your_twilio_account_sid') {
    db.prepare('INSERT INTO calls (to_number, direction, status, transcript) VALUES (?, ?, ?, ?)').run(to, 'outbound', 'demo', script)
    return res.json({ success: true, note: 'Demo mode — add Twilio credentials in Settings to make real calls', callId: Date.now() })
  }

  try {
    const client = getTwilio()
    const twimlUrl = encodeURIComponent(`http://twimlets.com/echo?Twiml=<Response><Say voice="alice">${script}</Say></Response>`)
    const call = await client.calls.create({
      to,
      from: process.env.TWILIO_PHONE_NUMBER,
      url: `https://handler.twilio.com/twiml/EH...?say=${encodeURIComponent(script)}`,
    })
    db.prepare('INSERT INTO calls (to_number, direction, status, transcript) VALUES (?, ?, ?, ?)').run(to, 'outbound', 'initiated', script)
    res.json({ success: true, callSid: call.sid })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST inbound call webhook (Twilio hits this)
router.post('/receive', (req, res) => {
  const db = getDB()
  const { From, CallSid } = req.body
  db.prepare('INSERT INTO calls (from_number, direction, status) VALUES (?, ?, ?)').run(From || 'unknown', 'inbound', 'answered')
  
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="en-IN">
    Hello, this is Mini, Gokul's personal AI assistant. 
    Gokul is currently unavailable. Please leave a message or call back later. 
    Have a great day!
  </Say>
  <Record maxLength="60" transcribe="true" transcribeCallback="/api/calls/transcript" />
</Response>`
  res.type('text/xml').send(twiml)
})

// POST transcript callback
router.post('/transcript', (req, res) => {
  const db = getDB()
  const { RecordingUrl, TranscriptionText, From } = req.body
  db.prepare('UPDATE calls SET transcript = ?, status = ? WHERE from_number = ? ORDER BY timestamp DESC LIMIT 1')
    .run(TranscriptionText || '', 'completed', From)
  res.sendStatus(200)
})

// GET call history
router.get('/history', (req, res) => {
  const db = getDB()
  const calls = db.prepare('SELECT * FROM calls ORDER BY timestamp DESC LIMIT 50').all()
  res.json({ calls })
})

export default router
