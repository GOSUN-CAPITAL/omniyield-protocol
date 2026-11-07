# OmniYield Protocol - One-Click PowerShell Archiver
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$rootPath = $PSScriptRoot
if (-not $rootPath) { $rootPath = Get-Location }

node (Join-Path $rootPath "scripts\archive.js")

