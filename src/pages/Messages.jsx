import { useState, useEffect } from 'react'
import axios from 'axios'
import { MessageSquare, Send, Phone, PhoneIncoming, PhoneMissed, User, Instagram } from 'lucide-react'

const PLATFORMS = [
  { id: 'imessage',  label: 'iMessage',   icon: MessageSquare },
  { id: 'whatsapp',  label: 'WhatsApp',   icon: MessageSquare },
  { id: 'instagram', label: 'Instagram',  icon: Instagram },
  { id: 'calls',     label: 'Calls',      icon: Phone },
]

export default function Messages() {
  const [platform, setPlatform] = useState('imessage')
  const [messages, setMessages] = useState([])
  const [calls, setCalls] = useState([])
  const [to, setTo] = useState('')
  const [body, setBody] = useState('')
  const [callTo, setCallTo] = useState('')
  const [callScript, setCallScript] = useState("Hi, this is Mini — Gokul's AI assistant. He'll call you back shortly.")
  const [sending, setSending] = useState(false)
  const [autoReply, setAutoReply] = useState(false)

  useEffect(() => {
    if (platform === 'calls') fetchCalls()
    else fetchMessages(platform)
  }, [platform])

  const fetchMessages = async (p) => {
    try { const r = await axios.get(`/api/messages/${p}`); setMessages(r.data.messages || []) } catch { setMessages([]) }
  }

  const fetchCalls = async () => {
    try { const r = await axios.get('/api/calls/history'); setCalls(r.data.calls || []) } catch { setCalls([]) }
  }

  const sendMsg = async () => {
    if (!to.trim() || !body.trim()) return
    setSending(true)
    try { await axios.post(`/api/messages/${platform}`, { to: to.trim(), message: body.trim() }); setBody(''); fetchMessages(platform) }
    catch {} finally { setSending(false) }
  }

  const makeCall = async () => {
    if (!callTo.trim()) return
    setSending(true)
    try { await axios.post('/api/calls/make', { to: callTo.trim(), script: callScript }); fetchCalls() }
    catch {} finally { setSending(false) }
  }

  return (
    <div style={{ padding: '2.5rem' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, fontSize: '1.5rem', color: '#fff' }}>Messages</h1>
          <p style={{ fontSize: '0.8rem', color: '#555', marginTop: '0.25rem' }}>Unified inbox</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#555' }}>Auto-reply</span>
          <button onClick={() => setAutoReply(!autoReply)} style={{
            width: '2.5rem', height: '1.375rem', borderRadius: '99px', border: '1px solid rgba(255,255,255,0.15)',
            background: autoReply ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.04)', position: 'relative', cursor: 'pointer', transition: 'all 0.2s'
          }}>
            <span style={{
              position: 'absolute', top: '2px', width: '15px', height: '15px', borderRadius: '50%', background: autoReply ? '#fff' : '#444',
              transition: 'all 0.2s', left: autoReply ? '20px' : '2px'
            }} />
          </button>
          <span style={{ fontSize: '0.75rem', color: autoReply ? '#f0f0f0' : '#555', fontWeight: 500 }}>{autoReply ? 'ON' : 'OFF'}</span>
        </div>
      </div>

      {/* Platform tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {PLATFORMS.map(p => (
          <button key={p.id} onClick={() => setPlatform(p.id)} style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1rem',
            borderRadius: '0.75rem', fontSize: '0.8125rem', fontWeight: 500, border: '1px solid', cursor: 'pointer', transition: 'all 0.2s',
            background: platform === p.id ? '#fff' : 'rgba(255,255,255,0.04)',
            color: platform === p.id ? '#000' : '#555',
            borderColor: platform === p.id ? '#fff' : 'rgba(255,255,255,0.08)',
          }}>
            <p.icon size={13} /> {p.label}
          </button>
        ))}
      </div>

      {/* Calls view */}
      {platform === 'calls' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '1rem' }}>
            <h3 style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600, fontSize: '0.875rem', color: '#f0f0f0', marginBottom: '1rem' }}>Make a call</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input className="input" placeholder="Phone number (+91...)" value={callTo} onChange={e => setCallTo(e.target.value)} />
              <textarea className="input" placeholder="What should Mini say?" value={callScript} onChange={e => setCallScript(e.target.value)} style={{ height: '5rem', resize: 'none' }} />
              <button onClick={makeCall} disabled={sending || !callTo} className="btn-primary" style={{ alignSelf: 'flex-start' }}>
                <Phone size={13} /> {sending ? 'Calling...' : 'Make Call'}
              </button>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '1rem' }}>
            <h3 style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600, fontSize: '0.875rem', color: '#f0f0f0', marginBottom: '1rem' }}>Call log</h3>
            {calls.length === 0 ? <p style={{ color: '#444', fontSize: '0.8rem' }}>No calls yet</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {calls.map(call => (
                  <div key={call.id} style={{ display: 'flex', gap: '0.875rem', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ width: '2rem', height: '2rem', borderRadius: '0.625rem', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {call.direction === 'outbound' ? <Phone size={13} style={{ color: '#aaa' }} /> : call.status === 'missed' ? <PhoneMissed size={13} style={{ color: '#888' }} /> : <PhoneIncoming size={13} style={{ color: '#ccc' }} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '0.875rem', color: '#f0f0f0' }}>{call.to_number || call.from_number || 'Unknown'}</p>
                      {call.transcript && <p style={{ fontSize: '0.7rem', color: '#555', marginTop: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{call.transcript}</p>}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem', borderRadius: '99px', background: 'rgba(255,255,255,0.06)', color: '#666' }}>{call.direction}</span>
                      <p style={{ fontSize: '0.65rem', color: '#444', marginTop: '0.25rem' }}>{new Date(call.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Message view */}
      {platform !== 'calls' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '1rem' }}>
            <h3 style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600, fontSize: '0.875rem', color: '#f0f0f0', marginBottom: '1rem' }}>
              Send via {PLATFORMS.find(p => p.id === platform)?.label}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input className="input" placeholder={platform === 'instagram' ? 'Instagram user ID...' : 'Phone number or handle...'} value={to} onChange={e => setTo(e.target.value)} />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input className="input" placeholder="Type a message..." value={body} onChange={e => setBody(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMsg()} style={{ flex: 1 }} />
                <button onClick={sendMsg} disabled={sending || !to || !body} className="btn-primary" style={{ flexShrink: 0 }}>
                  <Send size={13} /> {sending ? '...' : 'Send'}
                </button>
              </div>
              {platform === 'imessage' && <p style={{ fontSize: '0.7rem', color: '#444' }}>iMessage uses AppleScript on macOS · No API key needed</p>}
              {platform === 'whatsapp' && <p style={{ fontSize: '0.7rem', color: '#444' }}>Configure Meta WhatsApp API in Settings to send real messages</p>}
              {platform === 'instagram' && <p style={{ fontSize: '0.7rem', color: '#444' }}>Configure Instagram Graph API in Settings to send DMs</p>}
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '1rem' }}>
            <h3 style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600, fontSize: '0.875rem', color: '#f0f0f0', marginBottom: '1rem' }}>History</h3>
            {messages.length === 0 ? <p style={{ color: '#444', fontSize: '0.8rem' }}>No messages yet on this platform</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {messages.map(msg => (
                  <div key={msg.id} style={{ display: 'flex', gap: '0.75rem', flexDirection: msg.direction === 'outbound' ? 'row-reverse' : 'row' }}>
                    <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <User size={12} style={{ color: '#555' }} />
                    </div>
                    <div style={{ maxWidth: '70%', display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: msg.direction === 'outbound' ? 'flex-end' : 'flex-start' }}>
                      <p style={{ fontSize: '0.7rem', color: '#555' }}>{msg.contact}</p>
                      <div style={{
                        padding: '0.625rem 0.875rem', borderRadius: '0.875rem', fontSize: '0.875rem',
                        background: msg.direction === 'outbound' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)', color: msg.direction === 'outbound' ? '#f0f0f0' : '#aaa'
                      }}>
                        {msg.body}
                      </div>
                      <p style={{ fontSize: '0.65rem', color: '#333' }}>{new Date(msg.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
