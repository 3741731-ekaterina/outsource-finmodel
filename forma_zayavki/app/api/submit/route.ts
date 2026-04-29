import { NextRequest, NextResponse } from 'next/server';

interface FormPayload {
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

async function sendToTelegram(payload: FormPayload): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const lines = [
    '🆕 *Новая заявка на консультацию*',
    '',
    `👤 *Имя:* ${payload.name}`,
    `📧 *Email:* ${payload.email}`,
    `📱 *Телефон:* ${payload.phone}`,
    `📍 *Откуда:* ${payload.source}`,
    `🏢 *Ниша:* ${payload.niche.join(', ')}`,
    `💰 *Выручка:* ${payload.revenue}`,
    `📋 *Налоги:* ${payload.tax.join(', ')}`,
    `📊 *Учёт:* ${payload.accounting}`,
    `📈 *Отчёты:* ${payload.reports.length ? payload.reports.join(', ') : 'не указано'}`,
    `🔄 *Деб/кред задолженность:* ${payload.debtors}`,
  ];

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: lines.join('\n'),
      parse_mode: 'Markdown',
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error('[Telegram] error:', body);
    throw new Error(`Telegram error: ${body}`);
  }
}

async function saveToSheets(payload: FormPayload): Promise<void> {
  const scriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
  if (!scriptUrl || scriptUrl.startsWith('сюда')) return;

  const res = await fetch(scriptUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    console.error('[Sheets] error:', await res.text());
  }
}

export async function POST(req: NextRequest) {
  let payload: FormPayload;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }

  const required: (keyof FormPayload)[] = ['email', 'name', 'phone', 'source', 'accounting', 'revenue', 'debtors'];
  for (const field of required) {
    const val = payload[field];
    if (!val || (typeof val === 'string' && !val.trim())) {
      return NextResponse.json({ error: `Missing: ${field}` }, { status: 400 });
    }
  }
  if (!payload.niche?.length || !payload.tax?.length) {
    return NextResponse.json({ error: 'Missing niche or tax' }, { status: 400 });
  }

  const [telegramResult, sheetsResult] = await Promise.allSettled([
    sendToTelegram(payload),
    saveToSheets(payload),
  ]);

  if (telegramResult.status === 'rejected') {
    console.error('[submit] Telegram failed:', telegramResult.reason);
  }
  if (sheetsResult.status === 'rejected') {
    console.error('[submit] Sheets failed:', sheetsResult.reason);
  }

  // Если Telegram упал — возвращаем ошибку (основной канал)
  if (telegramResult.status === 'rejected') {
    return NextResponse.json({ error: 'Failed to deliver' }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
