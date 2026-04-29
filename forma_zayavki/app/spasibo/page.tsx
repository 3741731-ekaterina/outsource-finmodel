import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Заявка принята | Екатерина Яхонтова',
};

export default function SpasiboPage() {
  return (
    <div className="min-h-screen bg-[#f5f4f0] flex flex-col">
      <header className="bg-[#1a4731] text-white">
        <div className="mx-auto max-w-2xl px-4 py-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Екатерина Яхонтова</h1>
        </div>
      </header>
      <div className="h-1 bg-gradient-to-r from-[#c9a84c] via-[#dfc070] to-[#c9a84c]" />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#1a4731]">
            <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-3">Заявка принята!</h2>
          <p className="text-gray-600 leading-relaxed mb-2">
            Спасибо за ваше обращение. Я свяжусь с вами в течение 24 часов,
            чтобы обсудить детали и назначить время консультации.
          </p>
          <p className="text-sm text-gray-400 mb-8">
            Если вопрос срочный — напишите напрямую в{' '}
            <a
              href="https://t.me/yahontova_finance"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1a4731] underline underline-offset-2 hover:text-[#2d6a4f]"
            >
              Telegram
            </a>
          </p>

          <div className="rounded-xl bg-white p-5 shadow-sm text-left space-y-3 mb-8">
            <p className="text-sm font-semibold text-gray-700">Что дальше:</p>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1a4731] text-white text-[10px] font-bold">1</span>
              <p className="text-sm text-gray-600">Получу ваши данные и изучу анкету</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1a4731] text-white text-[10px] font-bold">2</span>
              <p className="text-sm text-gray-600">Свяжусь по телефону или в мессенджере</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1a4731] text-white text-[10px] font-bold">3</span>
              <p className="text-sm text-gray-600">Назначим удобное время для консультации</p>
            </div>
          </div>

          <Link
            href="/"
            className="text-sm text-[#1a4731] underline underline-offset-4 hover:text-[#2d6a4f]"
          >
            Вернуться на форму
          </Link>
        </div>
      </main>
    </div>
  );
}
