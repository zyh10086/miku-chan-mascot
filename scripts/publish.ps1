# Miku-chan Mascot — GitHub 发布脚本
# 用法:
#   $env:GH_TOKEN = "ghp_xxx"  (或 github_pat_xxx)
#   $env:GH_USER = "你的GitHub用户名"
#   .\scripts\publish.ps1 [-RepoName miku-chan-mascot] [-Public]
# 说明:
#   - 通过 GitHub REST API 创建仓库（若不存在）
#   - 添加远程并推送 master 分支
#   - 仓库名默认 miku-chan-mascot；默认 private，加 -Public 改为 public

param(
  [string]$RepoName = "miku-chan-mascot",
  [switch]$Public
)

$ErrorActionPreference = "Stop"

if (-not $env:GH_TOKEN) { throw "请先设置 GH_TOKEN 环境变量（GitHub Personal Access Token，需 repo 权限）" }
if (-not $env:GH_USER) { throw "请先设置 GH_USER 环境变量（GitHub 用户名）" }

$repoRoot = Split-Path -Parent $PSScriptRoot
Push-Location $repoRoot

$api = "https://api.github.com"
$headers = @{
  "Authorization" = "token $env:GH_TOKEN"
  "Accept"        = "application/vnd.github+json"
  "User-Agent"    = "miku-chan-mascot-publish"
}

# 1. 检查仓库是否已存在
$exists = $false
try {
  Invoke-RestMethod -Uri "$api/repos/$env:GH_USER/$RepoName" -Headers $headers -Method Get | Out-Null
  $exists = $true
  Write-Host "仓库已存在: $env:GH_USER/$RepoName"
} catch {
  if ($_.Exception.Response.StatusCode.value__ -ne 404) { throw }
}

# 2. 不存在则创建
if (-not $exists) {
  $body = @{
    name        = $RepoName
    description = "Hatsune Miku green theme + chibi Miku DeepSeek balance mascot for DeepSeek Harness (DSH)"
    homepage    = "https://github.com/$env:GH_USER/$RepoName"
    private     = -not $Public
    auto_init   = $false
  } | ConvertTo-Json
  Invoke-RestMethod -Uri "$api/user/repos" -Headers $headers -Method Post -Body $body | Out-Null
  Write-Host "已创建仓库 ($(if ($Public) {'public'} else {'private'})): $env:GH_USER/$RepoName"
}

# 3. 添加远程并推送
git remote remove origin 2>$null
git remote add origin "https://$env:GH_USER`:$env:GH_TOKEN@github.com/$env:GH_USER/$RepoName.git"
git push -u origin master
git remote set-url origin "https://github.com/$env:GH_USER/$RepoName.git"

Pop-Location
Write-Host ""
Write-Host "发布完成: https://github.com/$env:GH_USER/$RepoName"
