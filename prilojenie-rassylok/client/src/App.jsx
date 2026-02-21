import { useState } from 'react'
import Editor from './components/Editor'
import Preview from './components/Preview'
import Settings from './components/Settings'
import History from './components/History'

const NAV_ITEMS = [
  { id: 'editor',   label: 'Редактор',    icon: '✏️' },
  { id: 'preview',  label: 'Предпросмотр', icon: '👁️' },
  { id: 'history',  label: 'История',     icon: '📋' },
  { id: 'settings', label: 'Настройки',   icon: '⚙️' },
]

export default function App() {
  const [tab, setTab] = useState('editor')
  const [draft, setDraft] = useState({ title: '', body: '' })

  return (
    <div className="min-h-screen flex flex-col">
      {/* Шапка */}
      <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Логотип */}
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Логотип" className="h-9 w-9 rounded-xl object-cover" />
            <div>
              <div className="font-semibold text-gray-900 text-sm leading-tight">Рассылки</div>
              <div className="text-xs text-gray-400 leading-tight">Екатерины Яхонтовой</div>
            </div>
          </div>

          {/* Навигация */}
          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                  tab === item.id
                    ? 'bg-[#0984E3] text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="mr-1.5">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Контент */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8">
        {tab === 'editor'   && <Editor draft={draft} setDraft={setDraft} onGoPreview={() => setTab('preview')} />}
        {tab === 'preview'  && <Preview draft={draft} />}
        {tab === 'history'  && <History onUseDraft={(d) => { setDraft(d); setTab('editor') }} />}
        {tab === 'settings' && <Settings />}
      </main>
    </div>
  )
}
