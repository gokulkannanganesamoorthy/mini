import { useState, useRef, useEffect, useCallback } from 'react'
import axios from 'axios'
import { Mic, MicOff, Send, Loader2, Trash2 } from 'lucide-react'

const SESSION_ID = 'gokul-main'

const SUGGESTIONS = [
  'Plan my day 📋',
  'What are my tasks?',
  'Check my messages',
  'How am I doing today?',
  'Remind me to sleep by 11 PM',
  'What do you know about me?',
]

export default function Chat() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hey Gokul! 👋 I'm Mini — your personal AI assistant. I know about your work at Orrayson Studio, your studies at PSG Tech, and your projects like VulnScan. I'm learning more about you every time we talk.\n\nHow can I help you right now?"
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [recording, setRecording] = useState(false)
  const [orbState, setOrbState] = useState('idle')
  const [history, setHistory] = useState([])
  const endRef = useRef(null)
  const recorderRef = useRef(null)
  const chunksRef = useRef([])

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = useCallback(async (text) => {
    if (!text?.trim() || loading) return
    setMessages(prev => [...prev, { role: 'user', content: text }])
    setInput('')
    setLoading(true)
    setOrbState('thinking')
    const newHistory = [...history, { role: 'user', content: text }]

    try {
      const res = await axios.post('/api/chat', { message: text, sessionId: SESSION_ID, conversationHistory: history })
      const reply = res.data.reply
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
      setHistory([...newHistory, { role: 'assistant', content: reply }])
      setOrbState('speaking')
      await speakText(reply)
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "Server isn't reachable. Run `npm run server` in the mini directory." }])
    } finally {
      setLoading(false)
      setTimeout(() => setOrbState('idle'), 600)
    }
  }, [loading, history])

  const speakText = async (text) => {
    try {
      const res = await axios.post('/api/voice/speak', { text }, { responseType: 'blob' })
      const audio = new Audio(URL.createObjectURL(res.data))
      return new Promise(r => { audio.onended = r; audio.onerror = r; audio.play().catch(r) })
    } catch {}
  }

  const toggleRecording = async () => {
    if (recording) { recorderRef.current?.stop(); setRecording(false); return }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const rec = new MediaRecorder(stream)
      chunksRef.current = []
      rec.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      rec.onstop = async () => {
        stream.getTracks().forEach(t => t.stop())
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setLoading(true); setOrbState('thinking')
        try {
          const form = new FormData(); form.append('audio', blob, 'rec.webm')
          const r = await axios.post('/api/voice/transcribe', form)
          if (r.data.text && !r.data.text.includes('Demo')) await send(r.data.text)
          else { setLoading(false); setOrbState('idle') }
        } catch { setLoading(false); setOrbState('idle') }
      }
      rec.start(); recorderRef.current = rec; setRecording(true)
    } catch { alert('Microphone access denied') }
  }

  const clear = () => {
    setMessages([{ role: 'assistant', content: "Fresh start! What's on your mind, Gokul?" }])
    setHistory([])
    axios.delete(`/api/chat/history/${SESSION_ID}`).catch(() => {})
  }

  const orbLabel = { idle: 'Ready', thinking: 'Thinking...', speaking: 'Speaking...' }[orbState] || 'Ready'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#000' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '50%', position: 'relative' }}>
            <div className={`orb-${orbState}`} style={{ borderRadius: '50%' }} />
          </div>
          <div>
            <p style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>Mini</p>
            <p style={{ fontSize: '0.7rem', color: '#555' }}>{orbLabel}</p>
          </div>
        </div>
        <button onClick={clear} className="btn-ghost" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}>
          <Trash2 size={12} /> Clear
        </button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {messages.map((msg, i) => (
          <div key={i} className="animate-fade-in" style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: '0.75rem', alignItems: 'flex-end' }}>
            {msg.role === 'assistant' && (
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0, marginBottom: '2px' }}>
                <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#fff', opacity: 0.9 }} />
              </div>
            )}
            <div className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-mini'}>
              <p style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0 }}>
              <div className="orb-thinking" style={{ borderRadius: '50%' }} />
            </div>
            <div className="chat-bubble-mini" style={{ display: 'flex', gap: '5px', alignItems: 'center', padding: '1rem' }}>
              {[0, 150, 300].map(d => (
                <span key={d} style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#555', display: 'block', animation: `orbPulse 1.2s ease-in-out ${d}ms infinite` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Suggestions */}
      <div style={{ padding: '0.5rem 1.5rem', display: 'flex', gap: '0.5rem', overflowX: 'auto', flexWrap: 'nowrap' }}>
        {SUGGESTIONS.map(s => (
          <button key={s} onClick={() => send(s.replace(/\s*[^\w\s'].*/g, '').trim() || s)}
            style={{ whiteSpace: 'nowrap', fontSize: '0.75rem', padding: '0.35rem 0.875rem', borderRadius: '99px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#666', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.target.style.color = '#ccc'; e.target.style.background = 'rgba(255,255,255,0.08)' }}
            onMouseLeave={e => { e.target.style.color = '#666'; e.target.style.background = 'rgba(255,255,255,0.04)' }}>
            {s}
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <button onClick={toggleRecording} style={{
          flexShrink: 0, width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', border: `1px solid ${recording ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)'}`,
          background: recording ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)', color: recording ? '#fff' : '#555',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s',
          animation: recording ? 'orbPulse 1s ease-in-out infinite' : 'none'
        }}>
          {recording ? <MicOff size={15} /> : <Mic size={15} />}
        </button>
        <input className="input" value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send(input)}
          placeholder="Message Mini..." disabled={loading} />
        <button onClick={() => send(input)} disabled={!input.trim() || loading}
          className="btn-primary" style={{ flexShrink: 0, width: '2.5rem', height: '2.5rem', padding: 0, borderRadius: '0.75rem', justifyContent: 'center' }}>
          {loading ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={15} />}
        </button>
      </div>
    </div>
  )
}
