import express from 'express'
import OpenAI from 'openai'
import { getDB } from '../db.js'
import { buildSystemMessage } from '../systemPrompt.js'

const router = express.Router()

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
}

router.post('/', async (req, res) => {
  const { message, sessionId = 'default', conversationHistory = [] } = req.body
  if (!message) return res.status(400).json({ error: 'Message is required' })

  const db = getDB()

  // Save user message
  db.prepare('INSERT INTO conversations (session_id, role, content) VALUES (?, ?, ?)')
    .run(sessionId, 'user', message)

  try {
    const openai = getOpenAI()
    const systemMessage = buildSystemMessage()

    // Build messages array from history
    const messages = [
      { role: 'system', content: systemMessage },
      ...conversationHistory.slice(-10), // last 10 messages for context
      { role: 'user', content: message }
    ]

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    })

    const reply = completion.choices[0].message.content

    // Save assistant response
    db.prepare('INSERT INTO conversations (session_id, role, content) VALUES (?, ?, ?)')
      .run(sessionId, 'assistant', reply)

    // 🧠 Smart auto-learning — extract personal facts from user messages
    autoLearnFromMessage(db, message)

    res.json({ reply, sessionId })
  } catch (err) {
    console.error('Chat error:', err.message)
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
      res.json({
        reply: "I'm Mini, your AI assistant! 🤖 I'm ready to help you manage your day, Gokul. To enable AI responses, please add your OpenAI API key in Settings. For now, I can show you the interface and you can explore all features!",
        sessionId
      })
    } else {
      res.status(500).json({ error: 'AI service unavailable', details: err.message })
    }
  }
})

// Get conversation history
router.get('/history/:sessionId', (req, res) => {
  const db = getDB()
  const messages = db.prepare(
    'SELECT role, content, timestamp FROM conversations WHERE session_id = ? ORDER BY timestamp ASC LIMIT 50'
  ).all(req.params.sessionId)
  res.json({ messages })
})

// Clear session
router.delete('/history/:sessionId', (req, res) => {
  const db = getDB()
  db.prepare('DELETE FROM conversations WHERE session_id = ?').run(req.params.sessionId)
  res.json({ success: true })
})


export default router

// 🧠 Auto-learn facts from natural conversation
function autoLearnFromMessage(db, message) {
  const msg = message.toLowerCase().trim()

  const patterns = [
    // Explicit memory requests
    { regex: /(?:remember|note|keep in mind|don't forget)[:\s]+(.+)/i, tag: 'general' },

    // Preferences
    { regex: /i (?:prefer|like|love|enjoy|hate|dislike)\s+(.{5,60})/i, tag: 'preference' },
    { regex: /my favorite\s+(?:\w+\s+)?is\s+(.{3,50})/i, tag: 'preference' },

    // Work / projects
    { regex: /i(?:'m| am) (?:building|working on|developing)\s+(.{5,80})/i, tag: 'project' },
    { regex: /my (?:project|startup|company|app)\s+(?:is called|is named|is)?\s+(.{3,60})/i, tag: 'project' },

    // Routine / habits
    { regex: /i (?:usually|always|often|normally)\s+(.{5,80})/i, tag: 'routine' },
    { regex: /(?:every day|daily|every morning|every night)\s+(?:i\s+)?(.{5,80})/i, tag: 'routine' },

    // Health
    { regex: /i(?:'m| am) feeling\s+(.{3,50})/i, tag: 'health' },
    { regex: /i (?:sleep|wake up|gym|workout|exercise)\s+(.{3,60})/i, tag: 'health' },

    // People
    { regex: /(?:my (?:friend|colleague|client|boss|professor|teacher))\s+(?:is\s+)?(.{3,50})/i, tag: 'person' },
  ]

  const insertStmt = db.prepare(`
    INSERT INTO memories (content, tag)
    SELECT ?, ?
    WHERE NOT EXISTS (
      SELECT 1 FROM memories WHERE content = ?
    )
  `)

  let learned = false
  for (const { regex, tag } of patterns) {
    const m = message.match(regex)
    if (m && m[1] && m[1].length > 4) {
      const fact = m[0].trim()
      insertStmt.run(fact, tag, fact)
      learned = true
      if (learned) break // one fact per message to avoid noise
    }
  }
}
