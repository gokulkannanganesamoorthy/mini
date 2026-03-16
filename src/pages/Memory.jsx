import { useState, useEffect } from 'react'
import axios from 'axios'
import { Brain, Plus, Trash2, Edit2, Check, X } from 'lucide-react'

const TAGS = ['work', 'project', 'personal', 'education', 'preference', 'routine', 'health', 'person', 'general']

export default function Memory() {
  const [memories, setMemories] = useState([])
  const [activeTag, setActiveTag] = useState('all')
  const [tagCounts, setTagCounts] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ content: '', tag: 'general' })
  const [editContent, setEditContent] = useState('')

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    const [m, t] = await Promise.all([
      axios.get('/api/memory').catch(() => ({ data: { memories: [] } })),
      axios.get('/api/memory/tags').catch(() => ({ data: { tags: [] } })),
    ])
    setMemories(m.data.memories); setTagCounts(t.data.tags)
  }

  const add = async () => {
    if (!form.content.trim()) return
    await axios.post('/api/memory', form)
    setForm({ content: '', tag: 'general' }); setShowAdd(false); fetchAll()
  }

  const del = async (id) => { await axios.delete(`/api/memory/${id}`); fetchAll() }

  const saveEdit = async (id) => {
    await axios.patch(`/api/memory/${id}`, { content: editContent }); setEditId(null); fetchAll()
  }

  const filtered = activeTag === 'all' ? memories : memories.filter(m => m.tag === activeTag)

  const tagStyle = (active) => ({
    padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.7rem', fontWeight: 500,
    border: '1px solid', cursor: 'pointer', transition: 'all 0.2s',
    background: active ? '#fff' : 'rgba(255,255,255,0.04)',
    color: active ? '#000' : '#555',
    borderColor: active ? '#fff' : 'rgba(255,255,255,0.08)',
  })

  return (
    <div style={{ padding: '2.5rem' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, fontSize: '1.5rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Brain size={22} style={{ color: '#888' }} /> Memory
          </h1>
          <p style={{ fontSize: '0.8rem', color: '#555', marginTop: '0.25rem' }}>
            {memories.length} facts stored — injected into every conversation
          </p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary"><Plus size={13} /> Add memory</button>
      </div>

      {/* Tag filter */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <button style={tagStyle(activeTag === 'all')} onClick={() => setActiveTag('all')}>
          All ({memories.length})
        </button>
        {tagCounts.map(({ tag, count }) => (
          <button key={tag} style={tagStyle(activeTag === tag)} onClick={() => setActiveTag(tag)}>
            {tag} ({count})
          </button>
        ))}
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="glass-card animate-slide-up" style={{ padding: '1.25rem', marginBottom: '1.5rem', borderRadius: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <textarea className="input" placeholder="What should Mini remember about you?" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} style={{ height: '5rem', resize: 'none' }} />
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <select className="input" value={form.tag} onChange={e => setForm({ ...form, tag: e.target.value })} style={{ width: '12rem' }}>
                {TAGS.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
              <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
                <button onClick={() => setShowAdd(false)} className="btn-ghost">Cancel</button>
                <button onClick={add} className="btn-primary">Save memory</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Memory grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 0' }}>
          <Brain size={36} style={{ color: '#222', margin: '0 auto 1rem' }} />
          <p style={{ color: '#444', fontSize: '0.875rem' }}>No memories in this category</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.875rem' }}>
          {filtered.map(mem => (
            <div key={mem.id} className="glass-card" style={{ padding: '1rem', borderRadius: '0.875rem', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.625rem' }}>
                <span style={{ fontSize: '0.65rem', padding: '0.2rem 0.6rem', borderRadius: '99px', background: 'rgba(255,255,255,0.06)', color: '#555', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {mem.tag}
                </span>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button onClick={() => { setEditId(mem.id); setEditContent(mem.content) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#444', padding: '0.2rem' }}>
                    <Edit2 size={12} />
                  </button>
                  <button onClick={() => del(mem.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#444', padding: '0.2rem' }}>
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
              {editId === mem.id ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <textarea className="input" value={editContent} onChange={e => setEditContent(e.target.value)} style={{ height: '4rem', fontSize: '0.8rem', resize: 'none' }} />
                  <div style={{ display: 'flex', gap: '0.375rem' }}>
                    <button onClick={() => saveEdit(mem.id)} className="btn-primary" style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem' }}><Check size={11} /> Save</button>
                    <button onClick={() => setEditId(null)} className="btn-ghost" style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem' }}><X size={11} /></button>
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: '0.8125rem', color: '#aaa', lineHeight: 1.6 }}>{mem.content}</p>
              )}
              <p style={{ fontSize: '0.65rem', color: '#333', marginTop: '0.625rem' }}>{new Date(mem.created_at).toLocaleDateString('en-IN')}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
