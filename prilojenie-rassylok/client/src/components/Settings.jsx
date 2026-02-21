import { useState, useEffect } from 'react'

export default function Settings() {
  const [form, setForm] = useState({
    bothelp_client_id: '',
    bothelp_client_secret: '',
    bothelp_test_subscriber_id: '',
    getcourse_account: '',
    getcourse_api_key: '',
  })
  const [saved, setSaved] = useState(false)
  const [checking, setChecking] = useState(false)
  const [checkResult, setCheckResult] = useState(null)

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(d => setForm(prev => ({ ...prev, ...d })))
      .catch(() => {})
  }, [])

  async function saveSettings() {
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      setSaved(true)
      setCheckResult(null)
      setTimeout(() => setSaved(false), 2500)
    } catch {
      alert('Ошибка сохранения')
    }
  }

  async function checkBotHelp() {
    setChecking(true)
    setCheckResult(null)
    try {
      const res = await fetch('/api/bothelp/check')
      const data = await res.json()
      if (data.ok) {
        const count = Array.isArray(data.data) ? data.data.length : '?'
        setCheckResult({ ok: true, msg: `Подключено! Ботов в аккаунте: ${count}` })
      } else {
        const errText = data.error || `Ошибка ${data.status}`
        setCheckResult({ ok: false, msg: errText })
      }
    } catch {
      setCheckResult({ ok: false, msg: 'Нет связи с сервером' })
    } finally {
      setChecking(false)
    }
  }

  function set(key, value) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Настройки</h1>
        <p className="text-sm text-gray-400 mt-0.5">Настройте один раз — работает всегда</p>
      </div>

      {/* BotHelp */}
      <div className="card p-6 space-y-5">
        <div className="flex items-center gap-3 pb-2 border-b border-gray-50">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-xl">🤖</div>
          <div>
            <h2 className="font-semibold text-gray-900">BotHelp</h2>
            <p className="text-xs text-gray-400">Рассылки в Telegram-боты</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Client ID <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.bothelp_client_id}
              onChange={e => set('bothelp_client_id', e.target.value)}
              placeholder="Числовой ID"
              className="input-field font-mono text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Client Secret <span className="text-red-400">*</span>
            </label>
            <input
              type="password"
              value={form.bothelp_client_secret}
              onChange={e => set('bothelp_client_secret', e.target.value)}
              placeholder="Секретный ключ"
              className="input-field font-mono text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ваш Subscriber ID (для тестов)
          </label>
          <input
            type="text"
            value={form.bothelp_test_subscriber_id}
            onChange={e => set('bothelp_test_subscriber_id', e.target.value)}
            placeholder="Числовой ID вашего профиля в BotHelp"
            className="input-field"
          />
          <p className="mt-1.5 text-xs text-gray-400">
            Найдите себя в разделе «Подписчики» кабинета BotHelp и скопируйте числовой ID
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={checkBotHelp}
            disabled={checking}
            className="btn-secondary"
          >
            {checking ? '⏳ Проверка...' : '🔌 Проверить соединение'}
          </button>
          {checkResult && (
            <span className={`text-sm px-3 py-1.5 rounded-lg border ${
              checkResult.ok
                ? 'bg-green-50 text-green-700 border-green-100'
                : 'bg-red-50 text-red-700 border-red-100'
            }`}>
              {checkResult.ok ? '✅ ' : '❌ '}{checkResult.msg}
            </span>
          )}
        </div>

        {/* Инструкция */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <p className="text-xs font-semibold text-blue-900 mb-2">
            Где найти Client ID и Client Secret в BotHelp
          </p>
          <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
            <li>Войдите в кабинет BotHelp</li>
            <li>Перейдите: Настройки → Интеграции → REST API</li>
            <li>Нажмите «Создать» или «Получить доступ»</li>
            <li>Скопируйте Client ID и Client Secret и вставьте выше</li>
          </ol>
        </div>
      </div>

      {/* Как найти Subscriber ID */}
      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
        <h3 className="font-semibold text-amber-900 mb-2">📱 Как найти свой Subscriber ID</h3>
        <ol className="text-sm text-amber-800 space-y-1 list-decimal list-inside">
          <li>Откройте Telegram и напишите сообщение боту <strong>@finyahontovaBot</strong></li>
          <li>Зайдите в BotHelp → «Подписчики»</li>
          <li>Найдите себя по имени и скопируйте числовой ID</li>
          <li>Вставьте в поле «Ваш Subscriber ID» выше и сохраните</li>
        </ol>
      </div>

      {/* GetCourse (заглушка) */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-3 pb-2 border-b border-gray-50">
          <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-xl">📧</div>
          <div>
            <h2 className="font-semibold text-gray-900">GetCourse</h2>
            <p className="text-xs text-gray-400">Email-рассылки по базе учеников</p>
          </div>
          <span className="ml-auto text-xs bg-yellow-50 text-yellow-600 border border-yellow-100 px-2 py-1 rounded-lg">
            В разработке
          </span>
        </div>
        <p className="text-sm text-gray-400">
          GetCourse будет добавлен в следующей версии. API-ключ уже сохранён в конфигурации.
        </p>
      </div>

      {/* Кнопка сохранить */}
      <div className="flex items-center gap-4">
        <button onClick={saveSettings} className="btn-primary px-8">
          💾 Сохранить настройки
        </button>
        {saved && (
          <span className="text-sm text-green-600 font-medium">✅ Сохранено</span>
        )}
      </div>
    </div>
  )
}
