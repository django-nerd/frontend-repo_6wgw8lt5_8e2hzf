import { useEffect, useRef, useState } from 'react'

// Simple analyzer overlay for notes and timestamps
export default function VideoPlayer({ src, markers = [], onAddMarker }) {
  const videoRef = useRef(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [note, setNote] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const timeHandler = () => setCurrentTime(v.currentTime)
    const playHandler = () => setIsPlaying(true)
    const pauseHandler = () => setIsPlaying(false)

    v.addEventListener('timeupdate', timeHandler)
    v.addEventListener('play', playHandler)
    v.addEventListener('pause', pauseHandler)

    return () => {
      v.removeEventListener('timeupdate', timeHandler)
      v.removeEventListener('play', playHandler)
      v.removeEventListener('pause', pauseHandler)
    }
  }, [])

  const handleAddMarker = () => {
    if (!videoRef.current) return
    const t = videoRef.current.currentTime
    if (onAddMarker) onAddMarker({ time: t, note })
    setNote('')
  }

  const togglePlay = () => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) v.play()
    else v.pause()
  }

  const seekTo = (t) => {
    const v = videoRef.current
    if (!v) return
    v.currentTime = t
    v.play()
  }

  return (
    <div className="w-full">
      <div className="relative rounded-xl overflow-hidden bg-black">
        <video ref={videoRef} src={src} controls className="w-full aspect-video" />
        {/* Current time badge */}
        <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
          {currentTime.toFixed(1)}s {isPlaying ? '▶' : '⏸'}
        </div>
      </div>

      <div className="mt-4 grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note"
              className="flex-1 border rounded px-3 py-2"
            />
            <button onClick={handleAddMarker} className="bg-blue-600 text-white px-3 py-2 rounded">
              Add Marker @ {currentTime.toFixed(1)}s
            </button>
          </div>
          <button onClick={togglePlay} className="text-sm text-blue-700 underline">
            {isPlaying ? 'Pause' : 'Play'}
          </button>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Markers</h3>
          {markers.length === 0 ? (
            <p className="text-sm text-gray-500">No markers yet.</p>
          ) : (
            <ul className="space-y-2 max-h-60 overflow-auto pr-2">
              {markers.map((m, idx) => (
                <li key={idx} className="flex items-center justify-between bg-gray-50 border rounded px-3 py-2">
                  <div>
                    <p className="text-sm font-medium">{m.note || 'Marker'}</p>
                    <p className="text-xs text-gray-500">{m.time.toFixed(1)}s {m.tag ? `• ${m.tag}` : ''}</p>
                  </div>
                  <button onClick={() => seekTo(m.time)} className="text-blue-600 text-sm">Jump</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
