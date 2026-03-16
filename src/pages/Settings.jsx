import { useState, useEffect } from 'react'
import axios from 'axios'
import { Settings2, Key, Bell, Cpu, User, Check, Save } from 'lucide-react'

const SECTIONS = [
  {
    id: 'profile', label: 'Profile', icon: User,
    fields: [
      { key: 'assistant_name', label: 'Assistant name', placeholder: 'Mini', type: 'text' },
      { key: 'user_name', label: 'Your name', placeholder: 'Gokul', type: 'text' },
    ]
  },
  {
    id: 'alarm', label: 'Alarm', icon: Bell,
    fields: [
      { key: 'alarm_time', label: 'Wake-up time', placeholder: '07:00', type: 'time' },
      { key: 'alarm_message', label: 'Wake-up message', placeholder: 'Good morning Gokul!', type: 'text' },
    ]
  },
  {
    id: 'ai', label: 'AI & Voice', icon: Key,
    fields: [
      { key: 'openai_key', label: 'OpenAI API Key', placeholder: 'sk-...', type: 'password' },
      { key: 'elevenlabs_key', label: 'ElevenLabs API Key', placeholder: 'XI...', type: 'password' },
      { key: 'elevenlabs_voice_id', label: 'ElevenLabs Voice ID', placeholder: 'pNInz6ob...', type: 'text' },
      { key: 'openweather_key', label: 'OpenWeather API Key', placeholder: 'OWM...', type: 'password' },
    ]
  },
  {
    id: 'messaging', label: 'Messaging & Calls', icon: Settings2,
    fields: [
      { key: 'twilio_sid', label: 'Twilio Account SID', placeholder: 'AC...', type: 'password' },
      { key: 'twilio_token', label: 'Twilio Auth Token', placeholder: '...', type: 'password' },
      { key: 'twilio_number', label: 'Twilio Phone Number', placeholder: '+1...', type: 'text' },
      { key: 'meta_whatsapp_token', label: 'Meta WhatsApp Token', placeholder: 'EAA...', type: 'password' },
      { key: 'meta_phone_id', label: 'Meta Phone Number ID', placeholder: '...', type: 'text' },
      { key: 'meta_instagram_token', label: 'Instagram Access Token', placeholder: 'EAA...', type: 'password' },
      { key: 'meta_ig_user_id', label: 'Instagram User ID', placeholder: '...', type: 'text' },
    ]
  },
  {
    id: 'esp32', label: 'ESP32 Device', icon: Cpu,
    fields: [
      { key: 'esp32_ip', label: 'ESP32 IP Address', placeholder: '192.168.1.x', type: 'text' },
      { key: 'esp32_api_url', label: 'ESP32 API Endpoint', placeholder: 'http://...', type: 'text' },
    ]
  },
]

export default function Settings() {
  const [values, setValues] = useState({})
  const [saved, setSaved] = useState(false)
  const [active, setActive] = useState('profile')

  useEffect(() => {
    axios.get('/api/settings').then(r => setValues(r.data.settings)).catch(() => {})
  }, [])

  const save = async () => {
    await axios.post('/api/settings', values).catch(() => {})
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const section = SECTIONS.find(s => s.id === active)

  return (
    <div style={{ padding: '2.5rem' }} className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, fontSize: '1.5rem', color: '#fff' }}>Settings</h1>
          <p style={{ fontSize: '0.8rem', color: '#555', marginTop: '0.25rem' }}>Configure Mini and integrations</p>
        </div>
        <button onClick={save} className="btn-primary" style={{ background: saved ? 'rgba(255,255,255,0.1)' : '#fff', color: saved ? '#fff' : '#000', borderColor: saved ? 'rgba(255,255,255,0.2)' : 'none' }}>
          {saved ? <><Check size={14} /> Saved</> : <><Save size={14} /> Save settings</>}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '2rem' }}>
        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => setActive(s.id)} className={`nav-item${active === s.id ? ' active' : ''}`} style={{ border: 'none', background: active === s.id ? 'rgba(255,255,255,0.08)' : 'transparent' }}>
              <s.icon size={14} /> {s.label}
            </button>
          ))}
        </div>

        {/* Form */}
        <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '1rem' }}>
          <h2 style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600, fontSize: '0.875rem', color: '#f0f0f0', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <section.icon size={16} style={{ color: '#888' }} /> {section.label}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {section.fields.map(field => (
              <div key={field.key} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.8125rem', color: '#888' }}>{field.label}</label>
                <input
                  type={field.type}
                  className="input"
                  style={{ maxWidth: '30rem' }}
                  placeholder={field.placeholder}
                  value={values[field.key] || ''}
                  onChange={e => setValues({ ...values, [field.key]: e.target.value })}
                />
              </div>
            ))}
          </div>

          {active === 'esp32' && (
            <div style={{ marginTop: '2rem', padding: '1rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p style={{ fontSize: '0.75rem', color: '#555', lineHeight: 1.6 }}>
                Mini bridges with ESP32 via the <code style={{ color: '#fff', background: 'rgba(255,255,255,0.05)', padding: '0.1rem 0.25rem', borderRadius: '0.25rem' }}>/api/device</code> endpoint. Use the Tutorial for chip-level setup instructions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
