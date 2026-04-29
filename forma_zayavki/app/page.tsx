'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';

interface FormData {
  email: string;
  name: string;
  phone: string;
  source: string;
  niche: string[];
  accounting: string;
  revenue: string;
  tax: string[];
  reports: string[];
  debtors: string;
}

const SOURCES = ['Instagram', 'Яндекс Дзен', 'Tenchart', 'Порекомендовали', 'Телеграм', 'Другое'];
const NICHES = [
  'Продажа услуг',
  'Производство',
  'Торговля опт-розница',
  'Торговля маркетплейсы',
  'Консалтинг',
  'Общепит',
  'Строительство',
  'Другое',
];
const ACCOUNTING = ['1С', 'Excel / Google Sheets', 'Финтабло', 'Всё в голове', 'План-факт', 'Другой сервис'];
const REVENUES = [
  'до 700 тыс. ₽',
  '700 тыс. — 1,5 млн ₽',
  '1,5 — 3 млн ₽',
  '3 — 5 млн ₽',
  'более 5 млн ₽',
];
const TAXES = ['УСН доходы', 'УСН доходы-расходы', 'ОСНО', 'Патент', 'Самозанятый'];
const REPORTS = ['ДДС', 'ОПиУ', 'Управленческий баланс', 'Другие операционные', 'Нет отчётов'];

function RadioCard({ name, value, checked, onChange, label }: {
  name: string; value: string; checked: boolean;
  onChange: (v: string) => void; label: string;
}) {
  return (
    <label className="radio-card">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="h-4 w-4 accent-green-800 shrink-0"
      />
      <span className="radio-label text-sm text-gray-700">{label}</span>
    </label>
  );
}

function CheckCard({ name, value, checked, onChange, label }: {
  name: string; value: string; checked: boolean;
  onChange: (v: string) => void; label: string;
}) {
  return (
    <label className="check-card">
      <input
        type="checkbox"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="h-4 w-4 accent-green-800 shrink-0"
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-600">{message}</p>;
}

export default function FormPage() {
  const router = useRouter();
  const [data, setData] = useState<FormData>({
    email: '', name: '', phone: '', source: '',
    niche: [], accounting: '', revenue: '',
    tax: [], reports: [], debtors: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const setField = (field: keyof FormData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const toggleArray = (field: 'niche' | 'tax' | 'reports', value: string) => {
    setData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value],
    }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!data.email) newErrors.email = 'Введите email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) newErrors.email = 'Некорректный email';
    if (!data.name.trim()) newErrors.name = 'Введите имя и фамилию';
    if (!data.phone.trim()) newErrors.phone = 'Введите телефон';
    if (!data.source) newErrors.source = 'Выберите вариант';
    if (data.niche.length === 0) newErrors.niche = 'Выберите хотя бы одну нишу';
    if (!data.accounting) newErrors.accounting = 'Выберите вариант';
    if (!data.revenue) newErrors.revenue = 'Выберите вариант';
    if (data.tax.length === 0) newErrors.tax = 'Выберите систему налогообложения';
    if (!data.debtors) newErrors.debtors = 'Выберите вариант';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      router.push('/spasibo');
    } catch {
      setSubmitError('Не удалось отправить заявку. Попробуйте ещё раз или напишите нам напрямую в Telegram.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f4f0]">
      {/* Header */}
      <header className="bg-[#1a4731] text-white">
        <div className="mx-auto max-w-2xl px-4 py-8 text-center">
          <p className="text-xs uppercase tracking-widest text-green-300 mb-2">Аутсорс-CFO</p>
          <h1 className="text-2xl font-bold tracking-tight">Екатерина Яхонтова</h1>
          <p className="mt-2 text-green-200 text-sm">Финансовый директор на аутсорсе · 18+ лет в финансах</p>
        </div>
      </header>

      {/* Gold divider */}
      <div className="h-1 bg-gradient-to-r from-[#c9a84c] via-[#dfc070] to-[#c9a84c]" />

      {/* Form container */}
      <main className="mx-auto max-w-2xl px-4 py-10">
        <div className="mb-8 text-center">
          <h2 className="text-xl font-semibold text-gray-800">Анкета для записи на консультацию</h2>
          <p className="mt-2 text-sm text-gray-500">
            Заполните форму — свяжусь в течение 24 часов для бесплатной первичной консультации
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-8">

          {/* ── Контакты ── */}
          <section className="rounded-xl bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-[#1a4731] mb-5 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1a4731] text-white text-xs font-bold">1</span>
              Контактные данные
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Имя и Фамилия <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={data.name}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setField('name', e.target.value)}
                  placeholder="Иван Иванов"
                  className="form-input"
                />
                <FieldError message={errors.name} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={data.email}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setField('email', e.target.value)}
                  placeholder="ivan@example.com"
                  className="form-input"
                />
                <FieldError message={errors.email} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Телефон <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={data.phone}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setField('phone', e.target.value)}
                  placeholder="+7 900 000-00-00"
                  className="form-input"
                />
                <FieldError message={errors.phone} />
              </div>
            </div>
          </section>

          {/* ── Откуда узнали ── */}
          <section className="rounded-xl bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-[#1a4731] mb-5 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1a4731] text-white text-xs font-bold">2</span>
              Откуда вы узнали обо мне? <span className="text-red-500 ml-1">*</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SOURCES.map(s => (
                <RadioCard
                  key={s} name="source" value={s}
                  checked={data.source === s}
                  onChange={v => setField('source', v)}
                  label={s}
                />
              ))}
            </div>
            <FieldError message={errors.source} />
          </section>

          {/* ── Бизнес ── */}
          <section className="rounded-xl bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-[#1a4731] mb-5 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1a4731] text-white text-xs font-bold">3</span>
              О вашем бизнесе
            </h3>
            <div className="space-y-6">
              <div>
                <p className="section-title">Ваша ниша <span className="text-red-500">*</span></p>
                <p className="text-xs text-gray-400 mb-2">Можно выбрать несколько</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {NICHES.map(n => (
                    <CheckCard
                      key={n} name="niche" value={n}
                      checked={data.niche.includes(n)}
                      onChange={v => toggleArray('niche', v)}
                      label={n}
                    />
                  ))}
                </div>
                <FieldError message={errors.niche} />
              </div>

              <div>
                <p className="section-title">Выручка в месяц <span className="text-red-500">*</span></p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {REVENUES.map(r => (
                    <RadioCard
                      key={r} name="revenue" value={r}
                      checked={data.revenue === r}
                      onChange={v => setField('revenue', v)}
                      label={r}
                    />
                  ))}
                </div>
                <FieldError message={errors.revenue} />
              </div>

              <div>
                <p className="section-title">Система налогообложения <span className="text-red-500">*</span></p>
                <p className="text-xs text-gray-400 mb-2">Можно выбрать несколько</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {TAXES.map(t => (
                    <CheckCard
                      key={t} name="tax" value={t}
                      checked={data.tax.includes(t)}
                      onChange={v => toggleArray('tax', v)}
                      label={t}
                    />
                  ))}
                </div>
                <FieldError message={errors.tax} />
              </div>
            </div>
          </section>

          {/* ── Учёт и отчёты ── */}
          <section className="rounded-xl bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-[#1a4731] mb-5 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1a4731] text-white text-xs font-bold">4</span>
              Финансовый учёт
            </h3>
            <div className="space-y-6">
              <div>
                <p className="section-title">Где ведёте учёт? <span className="text-red-500">*</span></p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ACCOUNTING.map(a => (
                    <RadioCard
                      key={a} name="accounting" value={a}
                      checked={data.accounting === a}
                      onChange={v => setField('accounting', v)}
                      label={a}
                    />
                  ))}
                </div>
                <FieldError message={errors.accounting} />
              </div>

              <div>
                <p className="section-title">Внедрённые управленческие отчёты</p>
                <p className="text-xs text-gray-400 mb-2">Необязательно · можно выбрать несколько</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {REPORTS.map(r => (
                    <CheckCard
                      key={r} name="reports" value={r}
                      checked={data.reports.includes(r)}
                      onChange={v => toggleArray('reports', v)}
                      label={r}
                    />
                  ))}
                </div>
              </div>

              <div>
                <p className="section-title">
                  Есть дебиторская / кредиторская задолженность? <span className="text-red-500">*</span>
                </p>
                <div className="grid grid-cols-2 gap-2 max-w-xs">
                  {['Да', 'Нет'].map(v => (
                    <RadioCard
                      key={v} name="debtors" value={v}
                      checked={data.debtors === v}
                      onChange={val => setField('debtors', val)}
                      label={v}
                    />
                  ))}
                </div>
                <FieldError message={errors.debtors} />
              </div>
            </div>
          </section>

          {/* ── Submit ── */}
          {submitError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {submitError}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-[#1a4731] py-4 text-base font-semibold text-white shadow-md transition hover:bg-[#2d6a4f] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? 'Отправляем...' : 'Отправить заявку'}
          </button>

          <p className="text-center text-xs text-gray-400">
            Нажимая кнопку, вы соглашаетесь на обработку персональных данных
          </p>
        </form>
      </main>

      {/* Footer */}
      <footer className="pb-10 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} Екатерина Яхонтова · Аутсорс-CFO
      </footer>
    </div>
  );
}
