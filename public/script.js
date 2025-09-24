(function () {
  const term = document.getElementById('terminal');
  const form = document.getElementById('cmdForm');
  const input = document.getElementById('cmd');
  const copyBtn = document.getElementById('copyAll');

  // Виртуальный «диск»
  const fs = {
    '/': ['README.md', 'scripts', 'logs', 'notes.txt'],
    '/scripts': ['deploy.sh', 'healthcheck.sh'],
    '/logs': ['build.log'],
  };
  const files = {
    '/README.md': `# Demo
Это статический терминал. Попробуйте: help, ls, cat README.md, addcmd hello "Hi!"`,
    '/scripts/deploy.sh': `#!/usr/bin/env bash
echo "Simulated deploy..."`,
    '/scripts/healthcheck.sh': `#!/usr/bin/env bash
echo "OK"`,
    '/logs/build.log': `[2025-09-01 12:00:00] build: success`,
    '/notes.txt': `Список дел: 
- добавить команду kubectl (фиктивно)
- сделать автодополнение`,
  };
  let cwd = '/';
  const user = 'devops';
  const host = 'demo';

  // Пользовательские команды (persist)
  const CUSTOM_CMDS_KEY = 'static_term_custom_cmds';
  const custom = JSON.parse(localStorage.getItem(CUSTOM_CMDS_KEY) || '{}');

  const history = [];
  let hPtr = -1;

  function scrollBottom() { term.scrollTop = term.scrollHeight; }

  function print(text = '') {
    const el = document.createElement('div');
    el.className = 'line';
    el.textContent = text;
    term.appendChild(el);
    scrollBottom();
  }

  function printHTML(html) {
    const el = document.createElement('div');
    el.className = 'line';
    el.innerHTML = html;
    term.appendChild(el);
    scrollBottom();
  }

  function promptLine(cmd = '') {
    printHTML(`<span class="prompt">${user}@${host}:${cwd}$</span> ${escapeHtml(cmd)}`);
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"'`=\/]/g, ch => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '`': '&#96;', '=': '&#61;', '/': '&#47;'
    }[ch]));
  }

  function pathJoin(base, add) {
    if (add.startsWith('/')) return add;
    if (base === '/') return `/${add}`;
    return `${base}/${add}`.replace(/\/+/g, '/');
  }

  function existsPath(p) {
    if (p in files) return true;
    if (p in fs) return true;
    // check dir membership
    const parts = p.split('/').filter(Boolean);
    if (parts.length === 0) return true;
    let cur = '/';
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const dirPath = cur;
      const next = pathJoin(cur, part);
      if (!(dirPath in fs) || !fs[dirPath].includes(part)) return false;
      cur = next;
    }
    return true;
  }

  function isDir(p) {
    return p in fs;
  }

  function resolve(p) {
    if (!p || p === '.') return cwd;
    if (p === '~') return '/';
    let out = p.startsWith('/') ? p : pathJoin(cwd, p);
    // упрощение /a/../b
    const parts = out.split('/').filter(Boolean);
    const stack = [];
    for (const part of parts) {
      if (part === '.') continue;
      if (part === '..') stack.pop();
      else stack.push(part);
    }
    return '/' + stack.join('/');
  }

  function cmd_help() {
    return [
      'Доступные команды:',
      '  help                 — эта справка',
      '  clear                — очистить экран',
      '  echo <текст>         — вывести текст',
      '  date                 — текущая дата/время',
      '  uname -a             — сведения о системе',
      '  whoami               — имя пользователя',
      '  pwd                  — текущий каталог',
      '  ls [путь]            — список файлов',
      '  cd <путь>            — сменить каталог',
      '  cat <файл>           — показать содержимое файла',
      '  man <cmd>            — кратко о команде',
      '  addcmd <name> "<out>" — добавить пользовательскую команду',
      '  cmds                 — показать пользовательские команды',
      '',
      'Примеры:',
      '  addcmd hi "Hello!"',
      '  ls /scripts',
      '  cat README.md',
    ].join('\n');
  }

  function cmd_uname(args) {
    if (args.join(' ') === '-a') {
      return 'Linux demo 6.6.0-static #1 SMP PREEMPT x86_64 GNU/Linux';
    }
    return 'Linux';
  }

  function cmd_ls(args) {
    const p = resolve(args[0] || '.');
    if (!existsPath(p)) return `ls: не удалось получить доступ к '${args[0] || p}': Нет такого файла или каталога`;
    if (isDir(p)) {
      return (fs[p] || []).join('  ');
    } else {
      return args[0] || p;
    }
  }

  function cmd_cd(args) {
    const p = resolve(args[0] || '/');
    if (!existsPath(p) || !isDir(p)) return `cd: ${args[0] || p}: Нет такого каталога`;
    cwd = p || '/';
    return '';
  }

  function cmd_cat(args) {
    if (!args[0]) return 'cat: укажите файл';
    const p = resolve(args[0]);
    const key = isDir(p) ? null : (p in files ? p : null);
    if (!existsPath(p) || !key) return `cat: ${args[0]}: Нет такого файла`;
    return files[key];
  }

  function cmd_man(args) {
    const m = {
      help: 'help — список доступных команд.',
      clear: 'clear — очищает окно терминала.',
      echo: 'echo — выводит строку.',
      date: 'date — печатает текущую дату и время.',
      'uname -a': 'uname -a — печатает информацию о системе (эмуляция).',
      whoami: 'whoami — печатает имя пользователя.',
      pwd: 'pwd — печатает текущий каталог.',
      ls: 'ls [путь] — список файлов каталога.',
      cd: 'cd <путь> — сменить каталог.',
      cat: 'cat <файл> — показать содержимое.',
      addcmd: 'addcmd <имя> "<вывод>" — добавляет кастомную команду.',
      cmds: 'cmds — показать кастомные команды.',
    };
    const name = (args[0] || '').trim();
    if (!name) return 'Укажите команду: man <cmd>';
    return m[name] || `man: нет страницы для '${name}'`;
  }

  function cmd_addcmd(args, raw) {
    if (args.length < 2) return 'Использование: addcmd <имя> "<вывод>"';
    const name = args[0];
    const rest = raw.replace(/^addcmd\s+[^ ]+\s+/, '');
    const match = rest.match(/^"([\s\S]*)"$/);
    const out = match ? match[1] : args.slice(1).join(' ');
    custom[name] = out;
    localStorage.setItem(CUSTOM_CMDS_KEY, JSON.stringify(custom));
    return `Добавлена команда '${name}'`;
  }

  function cmd_cmds() {
    const keys = Object.keys(custom);
    if (!keys.length) return 'Пользовательские команды отсутствуют.';
    return keys.map(k => `${k} -> ${custom[k]}`).join('\n');
  }

  const builtins = {
    help: cmd_help,
    clear: () => { term.innerHTML = ''; return ''; },
    echo: (_, raw) => raw.replace(/^echo\s+/, ''),
    date: () => new Date().toString(),
    uname: cmd_uname,
    whoami: () => user,
    pwd: () => cwd,
    ls: cmd_ls,
    cd: cmd_cd,
    cat: cmd_cat,
    man: cmd_man,
    addcmd: cmd_addcmd,
    cmds: cmd_cmds,
  };

  function parse(input) {
    // Простейший парсер, учитывающий кавычки
    const tokens = [];
    let cur = '';
    let q = null;
    for (let i = 0; i < input.length; i++) {
      const c = input[i];
      if (q) {
        if (c === q) { q = null; }
        else { cur += c; }
      } else {
        if (c === '"' || c === "'") q = c;
        else if (/\s/.test(c)) { if (cur) { tokens.push(cur); cur=''; } }
        else cur += c;
      }
    }
    if (cur) tokens.push(cur);
    return tokens;
  }

  function execute(raw) {
    if (!raw.trim()) { promptLine(''); return; }
    promptLine(raw);

    const tokens = parse(raw);
    const cmd = tokens[0];
    const args = tokens.slice(1);

    // Спец-случай для "uname -a"
    if (cmd === 'uname' && args.length && args[0] === '-a') {
      print(builtins['uname'](args));
      return;
    }

    if (builtins[cmd]) {
      const out = builtins[cmd](args, raw);
      if (out) print(out);
      return;
    }

    if (custom[cmd]) {
      print(custom[cmd]);
      return;
    }

    printHTML(`<span class="error">${escapeHtml(cmd)}: команда не найдена</span>. Введите <code>help</code>.`);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const value = input.value;
    history.push(value);
    hPtr = history.length;
    execute(value);
    input.value = '';
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') {
      if (hPtr > 0) { hPtr--; input.value = history[hPtr] || ''; input.setSelectionRange(input.value.length, input.value.length); e.preventDefault(); }
    } else if (e.key === 'ArrowDown') {
      if (hPtr < history.length) { hPtr++; input.value = history[hPtr] || ''; input.setSelectionRange(input.value.length, input.value.length); e.preventDefault(); }
    }
  });

  copyBtn.addEventListener('click', async () => {
    const text = term.innerText;
    try {
      await navigator.clipboard.writeText(text);
      copyBtn.textContent = 'Скопировано!';
      setTimeout(() => copyBtn.textContent = 'Скопировать вывод', 1200);
    } catch {
      // ignore
    }
  });

  // Приветствие
  print('Добро пожаловать в статический терминал. Введите help.');
})();