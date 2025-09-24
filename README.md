# Static Linux Terminal (DevOps mini-project)

## Локальный запуск (без Docker)
Откройте `public/index.html` в браузере.

## Локальный запуск в Docker
```bash
docker build -t static-terminal .
docker run --rm -p 8080:80 static-terminal
# откройте http://localhost:8080
```

## Команды
`help`, `clear`, `echo`, `date`, `uname -a`, `whoami`, `pwd`, `ls [path]`, `cd <path>`, `cat <file>`, `man <cmd>`,  
`addcmd <name> "<output>"`, `cmds`.

## Деплой на GitHub Pages
- Создайте репозиторий, положите файлы.
- Включите Pages: *Settings → Pages → Build and deployment → GitHub Actions*.
- Пуш в `main` запустит публикацию.

## Идеи для расширения
- Автодополнение по Tab.
- «Псевдо-kubectl» с несколькими под-командами.
- Тесты (Playwright) как часть CI.
- Хостинг через S3 + CloudFront (Terraform) — по желанию.
