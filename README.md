# 🖥️ Static Linux Terminal (DevOps Mini-Project)

[![Deploy Static Terminal to Pages](https://github.com/shadim-devops/static-terminal/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/shadim-devops/static-terminal/actions/workflows/deploy-pages.yml)

### 🔗 Live Demo  
👉 [Try it here](https://shadim-devops.github.io/static-terminal/)

---

## 📌 Overview
This is a **static emulation of a Linux terminal** built with HTML, CSS, and JavaScript.  
It is not a real shell but a **client-side simulation** designed for educational and portfolio purposes.  

The project demonstrates:
- How to build and deploy static projects using **GitHub Pages**  
- How to emulate CLI commands in the browser using **JavaScript**  
- How to structure a simple DevOps-style demo environment  

---

## ✨ Features
- Looks like a **real Linux terminal** (with prompt, input, and output).  
- Supports a wide range of **emulated Linux commands**:
  - `ls`, `ls -l`, `pwd`, `cd`  
  - `uptime`, `uname`, `uname -a`, `lscpu`  
  - `free`, `free -h`, `du -sh`  
  - `ip addr`, `ifconfig`, `ping` (simulated output)  
  - File management (`touch`, `rm`, `mkdir`, `cp`, `mv`, etc.)  
  - User management (`useradd`, `passwd`, `cat /etc/passwd`, etc.)  
  - Fun/“dangerous” commands (e.g., `sudo rm -R /`) return **joke messages**.  
- Includes **help command** to list available commands.  
- Fully **static** – no backend required.  

---

## 🚀 Deployment
The project is deployed using **GitHub Actions** and served via **GitHub Pages**.

Workflow: [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml)  

To deploy your own fork:
1. Fork the repository.  
2. Push changes to `main`.  
3. GitHub Actions will automatically build & deploy to Pages.  

---

## 🛠️ Local Development
Clone the repo and start a simple HTTP server:

```bash
git clone https://github.com/shadim-devops/static-terminal.git
cd static-terminal/public
python3 -m http.server 8080
