import { useEffect, useMemo, useState } from 'react'
import VideoPlayer from './components/VideoPlayer'

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

export default function App() {
  const [videos, setVideos] = useState([])
  const [selected, setSelected] = useState(null)
  const [markers, setMarkers] = useState([])
  const [loading, setLoading] = useState(false)

  const selectedVideo = useMemo(() => videos.find(v => v._id === selected) || null, [videos, selected])

  useEffect(() => {
    loadVideos()
  }, [])

  useEffect(() => {
    if (!selected) return
    loadMarkers(selected)
  }, [selected])

  const loadVideos = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/videos`)
      const data = await res.json()
      setVideos(data)
      if (data.length && !selected) setSelected(data[0]._id)
    } catch (e) {
      console.error(e)
    }
  }

  const loadMarkers = async (videoId) => {
    try {
      const res = await fetch(`${API_BASE}/api/analysis?video_id=${videoId}`)
      const data = await res.json()
      setMarkers(data)
    } catch (e) {
      console.error(e)
    }
  }

  const handleAddVideo = async (e) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const payload = {
      title: form.get('title'),
      url: form.get('url'),
      team: form.get('team') || undefined,
      player: form.get('player') || undefined,
      tags: (form.get('tags') || '').split(',').map(t => t.trim()).filter(Boolean),
    }
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/videos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Failed to create')
      await loadVideos()
      e.currentTarget.reset()
    } catch (e) {
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAddMarker = async ({ time, note }) => {
    if (!selected) return
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ video_id: selected, time, note }),
      })
      if (!res.ok) throw new Error('Failed to add marker')
      await loadMarkers(selected)
    } catch (e) {
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
      <header className="px-6 py-4 border-b bg-white/70 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">Soccer Training Studio</h1>
          <a href="/test" className="text-blue-600 hover:underline">Health Check</a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 grid lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 space-y-4">
          {selectedVideo ? (
            <VideoPlayer src={selectedVideo.url} markers={markers} onAddMarker={handleAddMarker} />
          ) : (
            <div className="aspect-video bg-white rounded-xl grid place-content-center border">
              <p className="text-gray-500">Add a video to get started</p>
            </div>
          )}
          <div className="bg-white rounded-xl border p-4">
            <h3 className="font-semibold mb-2">Your Videos</h3>
            {videos.length === 0 ? (
              <p className="text-sm text-gray-500">No videos yet.</p>
            ) : (
              <ul className="grid md:grid-cols-2 gap-3">
                {videos.map(v => (
                  <li key={v._id} onClick={() => setSelected(v._id)} className={`border rounded p-3 cursor-pointer hover:border-blue-500 ${selected === v._id ? 'border-blue-500 ring-2 ring-blue-100' : ''}`}>
                    <p className="font-medium truncate">{v.title}</p>
                    <p className="text-xs text-gray-500 truncate">{v.url}</p>
                    {v.tags?.length ? (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {v.tags.map((t, i) => (
                          <span key={i} className="text-[10px] bg-gray-100 px-2 py-0.5 rounded">{t}</span>
                        ))}
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <aside className="space-y-4">
          <form onSubmit={handleAddVideo} className="bg-white rounded-xl border p-4 space-y-3">
            <h3 className="font-semibold">Add Video</h3>
            <input name="title" required placeholder="Title" className="w-full border rounded px-3 py-2" />
            <input name="url" required placeholder="Direct video URL (mp4/webm)" className="w-full border rounded px-3 py-2" />
            <div className="grid grid-cols-2 gap-2">
              <input name="team" placeholder="Team" className="border rounded px-3 py-2" />
              <input name="player" placeholder="Player" className="border rounded px-3 py-2" />
            </div>
            <input name="tags" placeholder="Tags (comma separated)" className="w-full border rounded px-3 py-2" />
            <button disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50">
              {loading ? 'Saving...' : 'Save Video'}
            </button>
          </form>

          <div className="bg-white rounded-xl border p-4">
            <h3 className="font-semibold mb-2">Session Planner</h3>
            <p className="text-sm text-gray-500">Coming soon: build training sessions and attach videos.</p>
          </div>
        </aside>
      </main>

      <footer className="text-center text-xs text-gray-500 py-6">Built for coaches and players</footer>
    </div>
  )
}
