require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fetch = require('node-fetch');
const multer = require('multer');
const fs = require('fs');
const { setSetting, getSetting, saveDraft, getDraft, addHistory, getHistory } = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

// Папка для изображений
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(uploadsDir));

// ── Боты BotHelp (список из конфигурации) ─────────────────────────────────
const BOTS = [
  { id: '6646920973', name: 'Помощник Екатерины Яхонтовой', username: '@finyahontovaBot' },
  { id: '7671567584', name: 'Маркетплейс для финансистов', username: '@finmarket_yahontova_bot' },
  { id: null,         name: 'Нейросети с Яхонтовой', username: '@ai_yahontova_bot' },
  { id: '8290358498', name: 'Розыгрыш подарков с Яхонтовой', username: '@birthday_yahontova_bot' },
  { id: '8354192373', name: 'Подслушано Финдирам', username: '@podslushano_findirom_bot' },
];

// ── OAuth кэш ─────────────────────────────────────────────────────────────
let oauthCache = { token: null, expiresAt: 0 };

async function getBotHelpAccessToken() {
  const now = Date.now();
  // Если токен ещё действителен (с запасом 60 сек)
  if (oauthCache.token && oauthCache.expiresAt > now + 60000) {
    return oauthCache.token;
  }

  const clientId = getSetting('bothelp_client_id') || process.env.BOTHELP_CLIENT_ID || '';
  const clientSecret = getSetting('bothelp_client_secret') || process.env.BOTHELP_CLIENT_SECRET || '';

  if (!clientId || !clientSecret) {
    throw new Error('Не указаны Client ID и Client Secret BotHelp в настройках');
  }

  const res = await fetch('https://oauth.bothelp.io/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=client_credentials&client_id=${encodeURIComponent(clientId)}&client_secret=${encodeURIComponent(clientSecret)}`,
    redirect: 'follow',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OAuth ошибка ${res.status}: ${text}`);
  }

  const data = await res.json();
  oauthCache.token = data.access_token;
  oauthCache.expiresAt = now + (data.expires_in || 3600) * 1000;
  return oauthCache.token;
}

// ── Хелпер для BotHelp API ────────────────────────────────────────────────
async function botHelpRequest(apiPath, method = 'GET', body = null, contentType = 'application/json') {
  const token = await getBotHelpAccessToken();
  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': contentType,
    },
    redirect: 'follow',
  };
  if (body !== null) options.body = JSON.stringify(body);

  const res = await fetch(`https://api.bothelp.io${apiPath}`, options);
  let data;
  const text = await res.text();
  try { data = JSON.parse(text); } catch { data = { raw: text }; }
  return { ok: res.ok, status: res.status, data };
}

// ══════════════════════════════════════════════════════════════════════════
// API маршруты
// ══════════════════════════════════════════════════════════════════════════

// ── Список ботов ──────────────────────────────────────────────────────────
app.get('/api/bots', (req, res) => {
  res.json(BOTS);
});

// ── Черновик ──────────────────────────────────────────────────────────────
app.get('/api/draft', (req, res) => {
  res.json(getDraft() || { title: '', body: '' });
});

app.post('/api/draft', (req, res) => {
  const { title, body } = req.body;
  const id = saveDraft(title || '', body || '');
  res.json({ ok: true, id });
});

// ── Настройки ─────────────────────────────────────────────────────────────
app.get('/api/settings', (req, res) => {
  res.json({
    bothelp_client_id: getSetting('bothelp_client_id') || process.env.BOTHELP_CLIENT_ID || '',
    bothelp_client_secret: getSetting('bothelp_client_secret') || process.env.BOTHELP_CLIENT_SECRET || '',
    bothelp_test_subscriber_id: getSetting('bothelp_test_subscriber_id') || '',
    getcourse_account: getSetting('getcourse_account') || process.env.GETCOURSE_ACCOUNT || '',
    getcourse_api_key: getSetting('getcourse_api_key') || process.env.GETCOURSE_API_KEY || '',
  });
});

app.post('/api/settings', (req, res) => {
  const {
    bothelp_client_id, bothelp_client_secret,
    bothelp_test_subscriber_id,
    getcourse_account, getcourse_api_key,
  } = req.body;

  if (bothelp_client_id !== undefined) { setSetting('bothelp_client_id', bothelp_client_id); oauthCache = { token: null, expiresAt: 0 }; }
  if (bothelp_client_secret !== undefined) { setSetting('bothelp_client_secret', bothelp_client_secret); oauthCache = { token: null, expiresAt: 0 }; }
  if (bothelp_test_subscriber_id !== undefined) setSetting('bothelp_test_subscriber_id', bothelp_test_subscriber_id);
  if (getcourse_account !== undefined) setSetting('getcourse_account', getcourse_account);
  if (getcourse_api_key !== undefined) setSetting('getcourse_api_key', getcourse_api_key);
  res.json({ ok: true });
});

// ── Проверка BotHelp ──────────────────────────────────────────────────────
app.get('/api/bothelp/check', async (req, res) => {
  try {
    const result = await botHelpRequest('/v1/bots/');
    res.json({ ok: result.ok, status: result.status, data: result.data });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// ── Тест BotHelp: отправить сообщение себе ────────────────────────────────
app.post('/api/bothelp/test', async (req, res) => {
  const { subscriber_id, title, body } = req.body;
  const testSubscriberId = subscriber_id || getSetting('bothelp_test_subscriber_id');

  if (!testSubscriberId) {
    return res.status(400).json({ ok: false, error: 'Укажите ваш Subscriber ID в настройках' });
  }

  // Форматируем для Telegram (Markdown)
  const text = title ? `*${title}*\n\n${body}` : body;

  try {
    // BotHelp API: Content-Type = application/vnd.api+json, тело = массив объектов
    const result = await botHelpRequest(
      `/v1/subscribers/${testSubscriberId}/messages`,
      'POST',
      [{ content: text }],
      'application/vnd.api+json'
    );
    res.json({ ok: result.ok, status: result.status, data: result.data });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// ── Загрузка изображения ──────────────────────────────────────────────────
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ ok: false, error: 'Файл не получен' });
  const url = `/uploads/${req.file.filename}`;
  res.json({ ok: true, url });
});

// ── История ───────────────────────────────────────────────────────────────
app.get('/api/history', (req, res) => {
  res.json(getHistory());
});

// ── Статика (production) ───────────────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`\n✅ Сервер запущен: http://localhost:${PORT}\n`);
});
