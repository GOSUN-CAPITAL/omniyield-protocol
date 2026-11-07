# OmniYield Protocol - One-Click PowerShell Stopper
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host "  🛑 OmniYield Protocol (GOSUN) - 一键停止程序" -ForegroundColor Yellow
Write-Host "=====================================================================" -ForegroundColor Cyan

$ports = @(3000, 4000)
$stopped = 0
foreach ($p in $ports) {
    $conns = Get-NetTCPConnection -LocalPort $p -ErrorAction SilentlyContinue
    if ($conns) {
        foreach ($c in $conns) {
            $pidToKill = $c.OwningProcess
            if ($pidToKill -gt 0) {
                Write-Host "  [Port $p] 正在停止进程 (PID: $pidToKill)..." -ForegroundColor Yellow
                Stop-Process -Id $pidToKill -Force -ErrorAction SilentlyContinue
                $stopped++
            }
        }
    }
}

if ($stopped -gt 0) {
    Write-Host "`n✔ 成功终止 $stopped 个相关进程，端口 3000 与 4000 已释放！" -ForegroundColor Green
} else {
    Write-Host "`n✔ 未发现正在运行的 3000 / 4000 端口服务，系统空闲。" -ForegroundColor Green
}

