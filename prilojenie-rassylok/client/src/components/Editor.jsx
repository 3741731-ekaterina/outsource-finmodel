import { useState, useEffect, useRef } from 'react'

const BOTS_DEFAULT = [
  { id: '6646920973', name: 'Помощник Екатерины Яхонтовой', username: '@finyahontovaBot' },
  { id: '7671567584', name: 'Маркетплейс для финансистов', username: '@finmarket_yahontova_bot' },
  { id: null,         name: 'Нейросети с Яхонтовой', username: '@ai_yahontova_bot' },
  { id: '8290358498', name: 'Розыгрыш подарков с Яхонтовой', username: '@birthday_yahontova_bot' },
  { id: '8354192373', name: 'Подслушано Финдирам', username: '@podslushano_findirom_bot' },
]

export default function Editor({ draft, setDraft, onGoPreview }) {
  const [title, setTitle] = useState(draft.title || '')
  const [body, setBody] = useState(draft.body || '')
  const [selectedBot, setSelectedBot] = useState('')
  const [bots, setBots] = useState(BOTS_DEFAULT)
  const [testStatus, setTestStatus] = useState(null) // null | 'loading' | 'ok' | 'error'
  const [testMessage, setTestMessage] = useState('')
  const [saveStatus, setSaveStatus] = useState('')
  const textareaRef = useRef(null)
  const saveTimerRef = useRef(null)

  // Загрузить черновик при монтировании
  useEffect(() => {
    fetch('/api/draft')
      .then(r => r.json())
      .then(d => {
        if (d.title) setTitle(d.title)
        if (d.body) setBody(d.body)
      })
      .catch(() => {})

    fetch('/api/bots')
      .then(r => r.json())
      .then(b => setBots(b))
      .catch(() => {})
  }, [])

  // Автосохранение каждые 30 секунд
  useEffect(() => {
    clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      saveDraft(true)
    }, 30000)
    return () => clearTimeout(saveTimerRef.current)
  }, [title, body])

  // Синхронизировать draft наверх
  useEffect(() => {
    setDraft({ title, body })
  }, [title, body])

  async function saveDraft(auto = false) {
    try {
      await fetch('/api/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body }),
      })
      setSaveStatus(auto ? 'Автосохранено' : 'Сохранено')
      setTimeout(() => setSaveStatus(''), 2500)
    } catch {
      setSaveStatus('Ошибка сохранения')
    }
  }

  // Вставка форматирования в textarea
  function insertFormat(prefix, suffix = '') {
    const ta = textareaRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const selected = body.substring(start, end)
    const newText = body.substring(0, start) + prefix + selected + suffix + body.substring(end)
    setBody(newText)
    setTimeout(() => {
      ta.focus()
      ta.selectionStart = start + prefix.length
      ta.selectionEnd = end + prefix.length
    }, 0)
  }

  function insertVariable(text) {
    const ta = textareaRef.current
    if (!ta) return
    const start = ta.selectionStart
    const newText = body.substring(0, start) + text + body.substring(start)
    setBody(newText)
    setTimeout(() => {
      ta.focus()
      ta.selectionStart = ta.selectionEnd = start + text.length
    }, 0)
  }

  async function sendTest() {
    if (!body.trim()) {
      setTestStatus('error')
      setTestMessage('Напишите текст письма перед тестом')
      return
    }
    if (!selectedBot) {
      setTestStatus('error')
      setTestMessage('Выберите бота для теста')
      return
    }

    setTestStatus('loading')
    setTestMessage('')

    try {
      const res = await fetch('/api/bothelp/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body }),
      })
      const data = await res.json()

      if (data.ok) {
        setTestStatus('ok')
        setTestMessage('Тестовое сообщение отправлено! Проверьте Telegram.')
      } else {
        setTestStatus('error')
        const errText = data.error || (data.data && data.data.error) || `Ошибка ${res.status}`
        if (res.status === 400 && errText.includes('Subscriber ID')) {
          setTestMessage('Укажите ваш Subscriber ID в разделе Настройки → BotHelp')
        } else {
          setTestMessage(`Ошибка: ${errText}`)
        }
      }
    } catch (e) {
      setTestStatus('error')
      setTestMessage('Ошибка соединения с сервером')
    }
  }

  const charCount = body.length

  return (
    <div className="space-y-6">
      {/* Заголовок страницы */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Новое письмо</h1>
          <p className="text-sm text-gray-400 mt-0.5">Напишите один раз — сервис адаптирует под каждую платформу</p>
        </div>
        {saveStatus && (
          <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
            ✓ {saveStatus}
          </span>
        )}
      </div>

      {/* Карточка редактора */}
      <div className="card p-6 space-y-5">
        {/* Тема письма */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Тема письма</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Например: Новый вебинар по финансам 🔥"
            className="input-field text-base font-medium"
          />
        </div>

        {/* Панель форматирования */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Текст письма</label>
          <div className="flex items-center gap-1 mb-2 p-1.5 bg-gray-50 rounded-xl border border-gray-100 flex-wrap">
            <FormatBtn title="Жирный" onClick={() => insertFormat('*', '*')}>
              <strong>Ж</strong>
            </FormatBtn>
            <FormatBtn title="Курсив" onClick={() => insertFormat('_', '_')}>
              <em>К</em>
            </FormatBtn>
            <FormatBtn title="Зачёркнутый" onClick={() => insertFormat('~', '~')}>
              <span className="line-through">З</span>
            </FormatBtn>
            <FormatBtn title="Моноширинный" onClick={() => insertFormat('`', '`')}>
              <span className="font-mono">M</span>
            </FormatBtn>
            <div className="w-px h-5 bg-gray-200 mx-1" />
            <FormatBtn title="Ссылка" onClick={() => insertFormat('[текст](', ')')}>
              🔗
            </FormatBtn>
            <FormatBtn title="Новый абзац" onClick={() => insertFormat('\n\n')}>
              ¶
            </FormatBtn>
            <div className="w-px h-5 bg-gray-200 mx-1" />
            <span className="text-xs text-gray-400 px-2">Переменные:</span>
            <FormatBtn title="Вставить имя получателя" onClick={() => insertVariable('[Имя]')}>
              👤 Имя
            </FormatBtn>
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Привет, [Имя]!&#10;&#10;Пишу вам с важной новостью..."
            rows={12}
            className="input-field resize-none font-mono text-sm leading-relaxed"
          />
          <div className="flex items-center justify-between mt-1.5">
            <p className="text-xs text-gray-400">
              Markdown: *жирный*, _курсив_, [ссылка](url). Переменная [Имя] → имя получателя.
            </p>
            <span className="text-xs text-gray-400">{charCount} симв.</span>
          </div>
        </div>
      </div>

      {/* Выбор бота и отправка теста */}
      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Тест на себя — BotHelp</h2>
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Бот для отправки</label>
            <select
              value={selectedBot}
              onChange={e => setSelectedBot(e.target.value)}
              className="input-field"
            >
              <option value="">— выберите бота —</option>
              {bots.map(bot => (
                <option key={bot.username} value={bot.id || bot.username}>
                  {bot.name} ({bot.username})
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={sendTest}
            disabled={testStatus === 'loading'}
            className="btn-primary whitespace-nowrap"
          >
            {testStatus === 'loading' ? '⏳ Отправка...' : '📱 Отправить тест'}
          </button>
        </div>

        {/* Статус теста */}
        {testStatus && testStatus !== 'loading' && (
          <div className={`mt-3 p-3 rounded-xl text-sm ${
            testStatus === 'ok'
              ? 'bg-green-50 text-green-700 border border-green-100'
              : 'bg-red-50 text-red-700 border border-red-100'
          }`}>
            {testStatus === 'ok' ? '✅ ' : '❌ '}
            {testMessage}
          </div>
        )}

        <p className="mt-3 text-xs text-gray-400">
          Сообщение придёт вам в Telegram. Ваш Subscriber ID нужно указать в{' '}
          <span className="text-[#0984E3] cursor-pointer">Настройках → BotHelp</span>.
        </p>
      </div>

      {/* Нижние кнопки */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => saveDraft(false)}
          className="btn-secondary"
        >
          💾 Сохранить черновик
        </button>
        <button
          onClick={onGoPreview}
          className="btn-primary"
        >
          Предпросмотр →
        </button>
      </div>
    </div>
  )
}

function FormatBtn({ children, onClick, title }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="px-2.5 py-1.5 text-sm text-gray-600 hover:bg-white hover:text-gray-900 rounded-lg transition-colors duration-100"
    >
      {children}
    </button>
  )
}
