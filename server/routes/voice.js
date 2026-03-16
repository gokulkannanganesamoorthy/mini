import express from 'express'
import OpenAI from 'openai'
import axios from 'axios'
import multer from 'multer'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const router = express.Router()
const upload = multer({ dest: '/tmp/mini-audio/' })
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// POST transcribe audio (Whisper STT)
router.post('/transcribe', upload.single('audio'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Audio file required' })

  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
    fs.unlinkSync(req.file.path)
    return res.json({ text: 'Demo mode — OpenAI key needed for voice transcription' })
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(req.file.path),
      model: 'whisper-1',
      language: 'en',
    })
    fs.unlinkSync(req.file.path)
    res.json({ text: transcription.text })
  } catch (err) {
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path)
    res.status(500).json({ error: err.message })
  }
})

// POST text-to-speech (ElevenLabs)
router.post('/speak', async (req, res) => {
  const { text } = req.body
  if (!text) return res.status(400).json({ error: 'Text is required' })

  if (!process.env.ELEVENLABS_API_KEY || process.env.ELEVENLABS_API_KEY === 'your_elevenlabs_api_key_here') {
    return res.status(503).json({ error: 'ElevenLabs key not configured', note: 'Add key in Settings to enable voice' })
  }

  try {
    const voiceId = process.env.ELEVENLABS_VOICE_ID || 'pNInz6obpgDQGcFmaJgB'
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      },
      {
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
        },
        responseType: 'arraybuffer',
      }
    )
    res.set('Content-Type', 'audio/mpeg')
    res.send(Buffer.from(response.data))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
