# Miku-chan Mascot - GitHub publish script
# Usage:
#   $env:GH_TOKEN = "ghp_xxx"   (classic, repo scope) or fine-grained with Contents:write + repo selected
#   $env:GH_USER = "your-github-username"
#   .\scripts\publish.ps1 [-RepoName miku-chan-mascot] [-Public]
# NOTE:
#   - Creates the repo via the GitHub REST API when it does not exist yet.
#     A fine-grained PAT cannot create a new repo (403) - create an empty
#     repo on github.com/new first, then this script only pushes.
#   - Default repo name: miku-chan-mascot. Default visibility: private; add -Public for public.

param(
  [string]$RepoName = "miku-chan-mascot",
  [switch]$Public
)

$ErrorActionPreference = "Stop"

if (-not $env:GH_TOKEN) { throw "Set GH_TOKEN first (GitHub PAT with repo access)" }
if (-not $env:GH_USER) { throw "Set GH_USER first (GitHub username)" }

$repoRoot = Split-Path -Parent $PSScriptRoot
Push-Location $repoRoot

# 1. Try to create the repo (fails harmlessly for fine-grained PATs -> 403 -> fall through to push)
$api = "https://api.github.com"
$headers = @{
  "Authorization" = "token $env:GH_TOKEN"
  "Accept"        = "application/vnd.github+json"
  "User-Agent"    = "miku-chan-mascot-publish"
}
$exists = $false
try {
  Invoke-RestMethod -Uri "$api/repos/$env:GH_USER/$RepoName" -Headers $headers -Method Get | Out-Null
  $exists = $true
  Write-Host "Repo already exists: $env:GH_USER/$RepoName"
} catch {
  if ($_.Exception.Response.StatusCode.value__ -ne 404) {
    Write-Warning "Could not check repo existence: $($_.Exception.Message). Trying push anyway."
  }
}

if (-not $exists) {
  try {
    $body = @{
      name        = $RepoName
      description = "Hatsune Miku green theme + chibi Miku DeepSeek balance mascot for DeepSeek Harness (DSH)"
      homepage    = "https://github.com/$env:GH_USER/$RepoName"
      private     = -not $Public
      auto_init   = $false
    } | ConvertTo-Json
    Invoke-RestMethod -Uri "$api/user/repos" -Headers $headers -Method Post -Body $body | Out-Null
    Write-Host "Created repo ($(if ($Public) {'public'} else {'private'})): $env:GH_USER/$RepoName"
  } catch {
    Write-Warning "Could not create repo via API: $($_.Exception.Message)"
    Write-Warning "If your token is a fine-grained PAT, create an empty repo manually at https://github.com/new first."
  }
}

# 2. Add remote and push (token embedded only for this push, then scrubbed)
git remote remove origin 2>$null
git remote add origin "https://$env:GH_USER`:$env:GH_TOKEN@github.com/$env:GH_USER/$RepoName.git"
git push -u origin master
git remote set-url origin "https://github.com/$env:GH_USER/$RepoName.git"

Pop-Location
Write-Host ""
Write-Host "Published: https://github.com/$env:GH_USER/$RepoName"
