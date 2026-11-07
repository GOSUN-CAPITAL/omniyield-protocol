@echo off
chcp 65001 >nul
title OmniYield Protocol - One-Click Launcher

echo =====================================================================
echo   🌟 OmniYield Protocol (GOSUN) - 一键智能启动程序
echo   母港双金库矩阵: NUSD (11.84%% APY) + OmniUSDC 全天候 (16.40%% APY)
echo   Google Gemini 实时行情推理 + OmniSafe 链下主权节点 (SputnikDAO)
echo =====================================================================
echo.

:: 1. 检查 Node.js 环境
echo [1/5] 检查系统 Node.js 运行环境...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Node.js，请先安装 Node.js (推荐 v18 或 v20 及以上版本): https://nodejs.org/
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node -v') do set NODE_VERSION=%%v
echo   ✔ Node.js 已安装: %NODE_VERSION%

:: 2. 清理占用端口 3000 与 4000 的历史进程
echo.
echo [2/5] 检查并清理端口冲突 (Port 3000 前端 / Port 4000 安全节点)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING 2^>nul') do (
    echo   发现端口 3000 被进程 PID:%%a 占用，正在释放...
    taskkill /F /PID %%a >nul 2>nul
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :4000 ^| findstr LISTENING 2^>nul') do (
    echo   发现端口 4000 被进程 PID:%%a 占用，正在释放...
    taskkill /F /PID %%a >nul 2>nul
)
echo   ✔ 端口就绪 (3000 / 4000)

:: 3. 检查依赖与构建
echo.
echo [3/5] 检查服务依赖与构建状态...
if not exist "omniyield-safe-node\node_modules" (
    echo   正在安装 omniyield-safe-node 依赖...
    cd omniyield-safe-node && call npm install && cd ..
)
if not exist "omniyield-safe-node\dist\server.js" (
    echo   正在编译 omniyield-safe-node TypeScript 核心...
    cd omniyield-safe-node && call npm run build && cd ..
)
if not exist "frontend\node_modules" (
    echo   正在安装 frontend 前端依赖...
    cd frontend && call npm install && cd ..
)
echo   ✔ 核心模块与依赖均已齐备

:: 4. 启动后端主权节点与前端界面
echo.
echo [4/5] 正在启动 OmniYield 双轨服务...
echo   -> 启动 OmniSafe 主权安全节点 (VPS Daemon: Port 4000)...
start "OmniSafe Sovereign Node [Port 4000]" cmd /k "cd omniyield-safe-node && title OmniSafe Node [Port 4000] && node dist/server.js"

echo   -> 启动 Next.js 交互式 Web 前端 (Port 3000)...
start "OmniYield Web App [Port 3000]" cmd /k "cd frontend && title OmniYield Frontend [Port 3000] && npm run dev"

:: 5. 打开浏览器并就绪
echo.
echo [5/5] 等待服务初始化并拉起浏览器...
timeout /t 4 /nobreak >nul
start http://localhost:3000

echo.
echo =====================================================================
echo   🎉 OmniYield 协议已成功启动！
echo.
echo   • 前端体验大厅:  http://localhost:3000
echo   • 安全节点接口:  http://localhost:4000
echo   • 健康检查探针:  http://localhost:4000/health
echo   • 实时预言机:    CoinGecko / Coinbase / TradingView 信号就绪
echo.
echo   [提示]
echo   1. 请保留弹出的 2 个服务窗口（或最小化）。
echo   2. 若需停止所有服务，可随时双击运行 stop.bat 一键停止。
echo =====================================================================
echo.
pause

