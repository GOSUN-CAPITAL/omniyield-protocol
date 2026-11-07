# OmniYield Protocol - One-Click PowerShell Launcher
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host "  🌟 OmniYield Protocol (GOSUN) - 一键智能启动程序 (PowerShell)" -ForegroundColor Yellow
Write-Host "  母港双金库矩阵: NUSD (11.84% APY) + OmniUSDC 全天候 (16.40% APY)" -ForegroundColor Green
Write-Host "  Google Gemini 实时行情推理 + OmniSafe 链下主权节点 (SputnikDAO)" -ForegroundColor Green
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host ""

$rootPath = $PSScriptRoot
if (-not $rootPath) { $rootPath = Get-Location }

# 1. 检查 Node.js
Write-Host "[1/5] 检查系统 Node.js 运行环境..." -ForegroundColor White
try {
    $nodeVer = & node -v
    Write-Host "  ✔ Node.js 已就绪: $nodeVer" -ForegroundColor Green
} catch {
    Write-Host "  [错误] 未检测到 Node.js，请先安装 Node.js (推荐 v18/v20): https://nodejs.org/" -ForegroundColor Red
    pause
    exit 1
}

# 2. 清理端口冲突
Write-Host "`n[2/5] 检查并清理端口冲突 (3000 / 4000)..." -ForegroundColor White
$ports = @(3000, 4000)
foreach ($p in $ports) {
    $conns = Get-NetTCPConnection -LocalPort $p -ErrorAction SilentlyContinue
    if ($conns) {
        foreach ($c in $conns) {
            $pidToKill = $c.OwningProcess
            if ($pidToKill -gt 0) {
                Write-Host "  发现端口 $p 占用 (PID: $pidToKill)，正在释放..." -ForegroundColor Yellow
                Stop-Process -Id $pidToKill -Force -ErrorAction SilentlyContinue
            }
        }
    }
}
Write-Host "  ✔ 端口 3000 和 4000 已就绪" -ForegroundColor Green

# 3. 检查构建状态
Write-Host "`n[3/5] 检查构建状态..." -ForegroundColor White
$backendDist = Join-Path $rootPath "omniyield-safe-node\dist\server.js"
if (-not (Test-Path $backendDist)) {
    Write-Host "  正在编译 omniyield-safe-node TypeScript 核心..." -ForegroundColor Yellow
    Set-Location (Join-Path $rootPath "omniyield-safe-node")
    & npm run build
    Set-Location $rootPath
}
Write-Host "  ✔ 核心构建已完成" -ForegroundColor Green

# 4. 启动服务
Write-Host "`n[4/5] 正在拉起后台双服务..." -ForegroundColor White
Start-Process cmd -ArgumentList "/k cd /d `"$rootPath\omniyield-safe-node`" && title OmniSafe Node [Port 4000] && node dist/server.js"
Start-Process cmd -ArgumentList "/k cd /d `"$rootPath\frontend`" && title OmniYield Frontend [Port 3000] && npm run dev"

# 5. 打开浏览器
Write-Host "`n[5/5] 等待服务初始化并拉起浏览器..." -ForegroundColor White
Start-Sleep -Seconds 4
Start-Process "http://localhost:3000"

Write-Host "`n=====================================================================" -ForegroundColor Cyan
Write-Host "  🎉 OmniYield 协议已成功启动！" -ForegroundColor Green
Write-Host "  • 前端体验大厅:  http://localhost:3000" -ForegroundColor White
Write-Host "  • 安全节点接口:  http://localhost:4000" -ForegroundColor White
Write-Host "  • 健康检查探针:  http://localhost:4000/health" -ForegroundColor White
Write-Host "`n  运行 stop.bat 或 .\stop.ps1 可随时一键停止全部服务。" -ForegroundColor Yellow
Write-Host "=====================================================================" -ForegroundColor Cyan

