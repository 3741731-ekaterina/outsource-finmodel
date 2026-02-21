import { useState, useEffect } from 'react'

export default function History({ onUseDraft }) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/history')
      .then(r => r.json())
      .then(d => { setHistory(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-400">Загрузка истории...</div>
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">История рассылок</h1>
          <p className="text-sm text-gray-400 mt-0.5">Все отправленные письма в одном месте</p>
        </div>
        <div className="card p-12 text-center">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-gray-500 font-medium">История пока пуста</p>
          <p className="text-sm text-gray-400 mt-1">Отправленные рассылки появятся здесь</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">История рассылок</h1>
        <p className="text-sm text-gray-400 mt-0.5">Всего записей: {history.length}</p>
      </div>

      <div className="space-y-3">
        {history.map(item => (
          <div key={item.id} className="card p-5 hover:shadow-md transition-shadow duration-150">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900">{item.title || '(без темы)'}</h3>
                  <StatusBadge status={item.status} />
                </div>
                <p className="text-sm text-gray-500 line-clamp-2">{item.body}</p>
                <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
                  <span>📅 {formatDate(item.sent_at)}</span>
                  <span>👥 {item.recipient_count} получателей</span>
                  {item.channels && (
                    <span>📡 {parseChannels(item.channels)}</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => onUseDraft({ title: item.title, body: item.body })}
                className="ml-4 btn-secondary text-sm py-2 px-3"
              >
                Использовать
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const map = {
    sent: { label: 'Отправлено', cls: 'bg-green-50 text-green-700 border-green-100' },
    error: { label: 'Ошибка', cls: 'bg-red-50 text-red-700 border-red-100' },
    scheduled: { label: 'Запланировано', cls: 'bg-blue-50 text-blue-700 border-blue-100' },
  }
  const s = map[status] || map.sent
  return (
    <span className={`text-xs px-2 py-0.5 rounded-lg border ${s.cls}`}>{s.label}</span>
  )
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleString('ru-RU', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function parseChannels(ch) {
  try {
    const arr = JSON.parse(ch)
    return Array.isArray(arr) ? arr.join(', ') : ch
  } catch {
    return ch
  }
}
