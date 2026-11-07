@echo off
chcp 65001 >nul
title OmniYield Protocol - One-Click Stopper

echo =====================================================================
echo   🛑 OmniYield Protocol (GOSUN) - 一键停止程序
echo =====================================================================
echo.

echo 正在扫描并终止占用 3000 (前端) 与 4000 (安全节点) 的服务进程...

set KILLED=0

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING 2^>nul') do (
    echo [Port 3000] 终止前端进程 PID: %%a
    taskkill /F /PID %%a >nul 2>nul
    set KILLED=1
)

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :4000 ^| findstr LISTENING 2^>nul') do (
    echo [Port 4000] 终止安全节点进程 PID: %%a
    taskkill /F /PID %%a >nul 2>nul
    set KILLED=1
)

echo.
echo ✔ OmniYield 所有本地服务已安全停止并释放端口。
echo.
pause

