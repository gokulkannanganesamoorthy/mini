import express from 'express'
import { exec } from 'child_process'
import { promisify } from 'util'
import { getDB } from '../db.js'
import axios from 'axios'

const router = express.Router()
const execAsync = promisify(exec)

// ─── iMessage (AppleScript on macOS) ───────────────────────────────────────
router.get('/imessage', async (req, res) => {
  const { contact } = req.query
  try {
    const script = contact
      ? `tell application "Messages"
          set targetBuddy to buddy "${contact}"
          set msgs to messages of (first chat whose participants contains targetBuddy)
          set result to ""
          repeat with m in (last 10 items of msgs)
            set result to result & (date received of m as string) & ": " & content of m & "\n"
          end repeat
          return result
         end tell`
      : `tell application "Messages"
          set result to ""
          repeat with c in (first 5 chats)
            set result to result & name of c & "\n"
          end repeat
          return result
         end tell`
    const { stdout } = await execAsync(`osascript -e '${script.replace(/'/g, "\\'")}'`)
    res.json({ messages: stdout.trim().split('\n').filter(Boolean), platform: 'imessage' })
  } catch (err) {
    res.json({ messages: [], error: 'iMessage access requires macOS Messages app permissions', platform: 'imessage' })
  }
})

router.post('/imessage', async (req, res) => {
  const { to, message } = req.body
  const db = getDB()
  try {
    const script = `tell application "Messages"
      set targetService to 1st account whose service type = iMessage
      set targetBuddy to participant "${to}" of targetService
      send "${message.replace(/"/g, '\\"')}" to targetBuddy
    end tell`
    await execAsync(`osascript -e '${script.replace(/'/g, "\\'")}'`)
    db.prepare('INSERT INTO messages (platform, contact, direction, body) VALUES (?, ?, ?, ?)').run('imessage', to, 'outbound', message)
    res.json({ success: true, platform: 'imessage' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ─── WhatsApp (Meta Cloud API) ─────────────────────────────────────────────
router.get('/whatsapp', (req, res) => {
  const db = getDB()
  const messages = db.prepare("SELECT * FROM messages WHERE platform = 'whatsapp' ORDER BY timestamp DESC LIMIT 50").all()
  res.json({ messages, platform: 'whatsapp' })
})

router.post('/whatsapp', async (req, res) => {
  const { to, message } = req.body
  const db = getDB()

  if (!process.env.META_WHATSAPP_TOKEN || process.env.META_WHATSAPP_TOKEN === 'your_meta_whatsapp_token') {
    db.prepare('INSERT INTO messages (platform, contact, direction, body) VALUES (?, ?, ?, ?)').run('whatsapp', to, 'outbound', message)
    return res.json({ success: true, note: 'Demo mode — add Meta WhatsApp token in Settings to send real messages' })
  }

  try {
    await axios.post(
      `https://graph.facebook.com/v18.0/${process.env.META_PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: message },
      },
      { headers: { Authorization: `Bearer ${process.env.META_WHATSAPP_TOKEN}` } }
    )
    db.prepare('INSERT INTO messages (platform, contact, direction, body) VALUES (?, ?, ?, ?)').run('whatsapp', to, 'outbound', message)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.response?.data || err.message })
  }
})

// ─── Instagram DMs (Meta Graph API) ────────────────────────────────────────
router.get('/instagram', (req, res) => {
  const db = getDB()
  const messages = db.prepare("SELECT * FROM messages WHERE platform = 'instagram' ORDER BY timestamp DESC LIMIT 50").all()
  res.json({ messages, platform: 'instagram' })
})

router.post('/instagram', async (req, res) => {
  const { to, message } = req.body
  const db = getDB()

  if (!process.env.META_INSTAGRAM_TOKEN || process.env.META_INSTAGRAM_TOKEN === 'your_instagram_access_token') {
    db.prepare('INSERT INTO messages (platform, contact, direction, body) VALUES (?, ?, ?, ?)').run('instagram', to, 'outbound', message)
    return res.json({ success: true, note: 'Demo mode — add Instagram token in Settings to send real DMs' })
  }

  try {
    await axios.post(
      `https://graph.facebook.com/v18.0/${process.env.META_INSTAGRAM_USER_ID}/messages`,
      { recipient: { id: to }, message: { text: message } },
      { headers: { Authorization: `Bearer ${process.env.META_INSTAGRAM_TOKEN}` } }
    )
    db.prepare('INSERT INTO messages (platform, contact, direction, body) VALUES (?, ?, ?, ?)').run('instagram', to, 'outbound', message)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.response?.data || err.message })
  }
})

// ─── Unified inbox ─────────────────────────────────────────────────────────
router.get('/all', (req, res) => {
  const db = getDB()
  const messages = db.prepare('SELECT * FROM messages ORDER BY timestamp DESC LIMIT 100').all()
  res.json({ messages })
})

router.patch('/:id/read', (req, res) => {
  const db = getDB()
  db.prepare('UPDATE messages SET read = 1 WHERE id = ?').run(req.params.id)
  res.json({ success: true })
})

export default router
