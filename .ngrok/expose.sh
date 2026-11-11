#!/usr/bin/env bash
# Открывает публичную ссылку на демо OAuth-callback (порт 3000).
set -euo pipefail

PORT="${PORT:-3000}"

if ! command -v ngrok >/dev/null 2>&1; then
  echo "ngrok не установлен. Установите CLI и повторите."
  exit 1
fi

if ! ngrok config check >/dev/null 2>&1 && [[ -z "${NGROK_AUTHTOKEN:-}" ]]; then
  echo "Нужен ключ ngrok (один раз)."
  echo "1) Откройте https://dashboard.ngrok.com/get-started/your-authtoken"
  echo "2) В терминале выполните: ngrok config add-authtoken ВАШ_ТОКЕН"
  echo "   (токен в чат не присылайте)"
  exit 1
fi

echo "Открываю туннель на порт ${PORT}…"
exec ngrok http "http://127.0.0.1:${PORT}" --log=stdout
