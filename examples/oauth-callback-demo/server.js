#!/usr/bin/env node
/**
 * Простой демо-сервер: показывает, зачем ngrok нужен
 * при проверке входа через Google/OAuth в этом проекте.
 *
 * Сервер крутится на удалённом компьютере (Cloud Agent).
 * С вашего телефона или ноутбука localhost:3000 не открыть.
 * ngrok даёт обычную ссылку в интернет — как будто сайт «снаружи».
 */

const http = require("http");
const { URL } = require("url");

const PORT = Number(process.env.PORT || 3000);
const PUBLIC_BASE = (process.env.PUBLIC_BASE_URL || "").replace(/\/$/, "");

const visits = [];

function baseFrom(req) {
  if (PUBLIC_BASE) return PUBLIC_BASE;
  const host = req.headers["x-forwarded-host"] || req.headers.host || `localhost:${PORT}`;
  const proto = req.headers["x-forwarded-proto"] || "http";
  return `${proto}://${host}`;
}

function page(title, body) {
  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700&family=Source+Sans+3:wght@400;600&display=swap" rel="stylesheet" />
  <style>
    :root {
      --ink: #1a2332;
      --muted: #4a5a6d;
      --paper: #f7f3ec;
      --sea: #0f6b6b;
      --sea-deep: #0a4f4f;
      --sand: #e8dcc8;
      --glow: rgba(15, 107, 107, 0.18);
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      font-family: "Source Sans 3", sans-serif;
      color: var(--ink);
      background:
        radial-gradient(1200px 600px at 10% -10%, #d8efe8 0%, transparent 55%),
        radial-gradient(900px 500px at 100% 0%, #f0e2c8 0%, transparent 50%),
        linear-gradient(165deg, #fbf8f2 0%, #eef4f2 45%, #e7efe9 100%);
    }
    .wrap {
      max-width: 640px;
      margin: 0 auto;
      padding: 12vh 1.5rem 3rem;
    }
    h1 {
      font-family: Fraunces, serif;
      font-weight: 700;
      font-size: clamp(2rem, 5vw, 2.75rem);
      line-height: 1.15;
      margin: 0 0 0.75rem;
      letter-spacing: -0.02em;
    }
    .brand {
      font-family: Fraunces, serif;
      font-size: 1.05rem;
      font-weight: 500;
      color: var(--sea);
      margin-bottom: 1.25rem;
    }
    p { color: var(--muted); font-size: 1.1rem; line-height: 1.55; margin: 0 0 1rem; }
    .cta {
      display: inline-block;
      margin-top: 0.5rem;
      padding: 0.85rem 1.35rem;
      background: var(--sea);
      color: white;
      text-decoration: none;
      font-weight: 600;
      border-radius: 4px;
      box-shadow: 0 10px 30px var(--glow);
      transition: background 160ms ease, transform 160ms ease;
    }
    .cta:hover { background: var(--sea-deep); transform: translateY(-1px); }
    .panel {
      margin-top: 2rem;
      padding: 1.25rem 1.35rem;
      background: rgba(255,255,255,0.55);
      border: 1px solid var(--sand);
      backdrop-filter: blur(6px);
    }
    .panel h2 {
      font-family: Fraunces, serif;
      font-size: 1.15rem;
      margin: 0 0 0.75rem;
    }
    code, .mono {
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 0.92rem;
      word-break: break-all;
    }
    ul { margin: 0; padding-left: 1.2rem; color: var(--muted); }
    li { margin: 0.35rem 0; }
    .ok {
      color: var(--sea-deep);
      font-weight: 600;
      font-size: 1.2rem;
    }
  </style>
</head>
<body>
  <main class="wrap">${body}</main>
</body>
</html>`;
}

const server = http.createServer((req, res) => {
  const base = baseFrom(req);
  const url = new URL(req.url, base);

  if (url.pathname === "/health") {
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ ok: true, service: "oauth-callback-demo" }));
    return;
  }

  if (url.pathname === "/") {
    const html = page(
      "Демо входа OAuth",
      `
      <div class="brand">node-oauth · демо с ngrok</div>
      <h1>Проверка «возврата» после входа</h1>
      <p>В этом проекте есть примеры входа через Google и другие сервисы.
      После «Разрешить» сервис отправляет человека <strong>обратно в приложение</strong>
      по специальной ссылке (callback).</p>
      <p>Сайт сейчас работает на удалённом компьютере. Без ngrok вы бы не открыли его
      из браузера дома. С ngrok появляется обычная интернет-ссылка.</p>
      <a class="cta" href="/start-login">Сымитировать вход через Google</a>
      <div class="panel">
        <h2>Адрес возврата (callback)</h2>
        <p class="mono">${base}/google_cb</p>
        <p>Именно такой адрес прописывают в настройках OAuth-приложения
        (как в примере <span class="mono">examples/express-gdata</span>).</p>
      </div>
      `
    );
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(html);
    return;
  }

  if (url.pathname === "/start-login") {
    // Имитация: будто Google отправил человека обратно с кодом
    const fakeCode = `demo_${Date.now().toString(36)}`;
    res.writeHead(302, { Location: `/google_cb?oauth_verifier=${fakeCode}&from=google-demo` });
    res.end();
    return;
  }

  if (url.pathname === "/google_cb") {
    const verifier = url.searchParams.get("oauth_verifier") || "(нет кода)";
    const from = url.searchParams.get("from") || "неизвестно";
    const when = new Date().toLocaleString("ru-RU", { timeZone: "UTC" }) + " UTC";
    visits.unshift({ when, verifier, from, path: url.pathname + url.search });
    if (visits.length > 8) visits.length = 8;

    const list = visits
      .map((v) => `<li><span class="mono">${v.when}</span> — код <span class="mono">${v.verifier}</span></li>`)
      .join("");

    const html = page(
      "Возврат после входа",
      `
      <div class="brand">node-oauth · callback принят</div>
      <p class="ok">Получилось: приложение «приняло» возврат после входа</p>
      <h1>Google как будто вернул вас сюда</h1>
      <p>В настоящем примере библиотека обменивает этот код на доступ к контактам или календарю.
      Здесь мы только показываем, что публичная ссылка ngrok доставляет ответ до сервера.</p>
      <div class="panel">
        <h2>Что пришло</h2>
        <ul>
          <li>Откуда: <span class="mono">${from}</span></li>
          <li>Код: <span class="mono">${verifier}</span></li>
          <li>Путь: <span class="mono">${url.pathname}${url.search}</span></li>
        </ul>
      </div>
      <div class="panel">
        <h2>Последние возвраты</h2>
        <ul>${list}</ul>
      </div>
      <p style="margin-top:1.5rem"><a class="cta" href="/">На главную</a></p>
      `
    );
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(html);
    return;
  }

  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Страница не найдена");
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`oauth-callback-demo слушает http://127.0.0.1:${PORT}`);
  if (PUBLIC_BASE) console.log(`Публичный адрес (ngrok): ${PUBLIC_BASE}`);
});
