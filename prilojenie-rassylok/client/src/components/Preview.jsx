import { useState } from 'react'

// Простой рендер Markdown → HTML для предпросмотра
function renderMarkdown(text) {
  if (!text) return ''
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<strong>$1</strong>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    .replace(/~(.+?)~/g, '<s>$1</s>')
    .replace(/`(.+?)`/g, '<code class="bg-gray-100 px-1 rounded text-xs font-mono">$1</code>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-blue-600 underline">$1</a>')
    .replace(/\[Имя\]/g, '<span class="bg-yellow-100 text-yellow-800 px-1 rounded text-xs">Екатерина</span>')
    .replace(/\n\n/g, '</p><p class="mt-3">')
    .replace(/\n/g, '<br />')
}

export default function Preview({ draft }) {
  const { title, body } = draft
  const [tab, setTab] = useState('telegram')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Предпросмотр</h1>
        <p className="text-sm text-gray-400 mt-0.5">Так увидят письмо получатели</p>
      </div>

      {/* Вкладки */}
      <div className="flex gap-2">
        <TabBtn active={tab === 'telegram'} onClick={() => setTab('telegram')}>
          📱 Telegram (BotHelp)
        </TabBtn>
        <TabBtn active={tab === 'email'} onClick={() => setTab('email')}>
          📧 Email (GetCourse)
        </TabBtn>
      </div>

      {/* Telegram предпросмотр */}
      {tab === 'telegram' && (
        <div className="card p-6">
          <h2 className="text-sm font-medium text-gray-500 mb-4">Как выглядит в Telegram</h2>
          <div className="flex justify-end">
            {/* Пузырь сообщения */}
            <div className="max-w-sm bg-[#EFFDDE] rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm">
              {title && (
                <p className="font-bold text-gray-900 text-sm mb-2">{title}</p>
              )}
              <div
                className="text-sm text-gray-800 leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: body
                    ? '<p>' + renderMarkdown(body) + '</p>'
                    : '<span class="text-gray-400 italic">Текст письма появится здесь...</span>'
                }}
              />
              <div className="mt-2 text-right">
                <span className="text-xs text-gray-400">12:00 ✓✓</span>
              </div>
            </div>
          </div>

          {/* Форматирование для платформы */}
          {body && (
            <div className="mt-5 p-4 bg-gray-50 rounded-xl">
              <p className="text-xs font-medium text-gray-500 mb-2">Markdown-текст для Telegram:</p>
              <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono leading-relaxed">
                {title ? `*${title}*\n\n${body}` : body}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Email предпросмотр */}
      {tab === 'email' && (
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-medium text-gray-500">Email-рассылка GetCourse</span>
            <span className="text-xs bg-yellow-50 text-yellow-600 border border-yellow-100 px-2 py-0.5 rounded-lg">
              В разработке
            </span>
          </div>

          {/* Эмуляция письма */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            {/* Заголовок письма */}
            <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
              <div className="text-xs text-gray-400">Тема:</div>
              <div className="font-medium text-gray-900">{title || '(без темы)'}</div>
            </div>

            {/* Тело */}
            <div className="p-6">
              <div
                className="text-sm text-gray-800 leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: body
                    ? '<p>' + renderMarkdown(body) + '</p>'
                    : '<span class="text-gray-400 italic">Текст письма появится здесь...</span>'
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Подсказка если текст пустой */}
      {!body && (
        <div className="card p-5 bg-amber-50 border-amber-100">
          <p className="text-sm text-amber-800">
            ✏️ Вернитесь в <span className="font-medium">Редактор</span> и напишите текст письма — здесь появится предпросмотр.
          </p>
        </div>
      )}
    </div>
  )
}

function TabBtn({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
        active
          ? 'bg-[#0984E3] text-white shadow-sm'
          : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
      }`}
    >
      {children}
    </button>
  )
}
