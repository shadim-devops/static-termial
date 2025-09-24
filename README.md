# Static Linux Terminal (DevOps mini-project)

This project is a static simulation of a Linux terminal in the browser.  
It demonstrates basic Linux commands for educational purposes.  

## Run locally
Open public/index.html in the browser.  

## Run with Docker
docker build -t static-terminal .
docker run -p 8080:8080 static-terminal

## Supported commands
Examples:  
help, clear, echo, date, uname, uname -a, lscpu,  
pwd, ls, ls -l, ls -la, cd, touch, mkdir, rm,  
cp, mv, ln, ln -s, uptime, free, top,  
ip addr, ifconfig, ping  

## Note
Commands are emulated and do not run on the real system.
