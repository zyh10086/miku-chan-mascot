# 发布到 GitHub

本仓库已经初始化好 git 并提交（master 分支）。发布需要 GitHub 认证，二选一：

## 方式 A：提供 Personal Access Token（推荐）

1. 打开 https://github.com/settings/tokens → **Generate new token (classic)**
2. 勾选 `repo`（完整仓库权限），生成 `ghp_...`
3. 在本机 PowerShell 执行：

```powershell
cd C:\Users\84791\Desktop\miku\miku-chan-mascot
$env:GH_TOKEN = "ghp_你的token"
$env:GH_USER = "你的GitHub用户名"
.\scripts\publish.ps1 -Public   # 公开仓库；去掉 -Public 则为私有
```

脚本会通过 GitHub API 创建仓库、添加远程并推送 master 分支。

## 方式 B：安装 GitHub CLI

```powershell
winget install GitHub.cli
gh auth login    # 浏览器登录
gh repo create miku-chan-mascot --public --source . --push
```

## 手动推送（有远程仓库时）

```bash
git remote add origin https://github.com/<你的用户名>/miku-chan-mascot.git
git push -u origin master
```

---

## 发布前自检清单

- [ ] `git log --oneline` 有至少 2 个提交
- [ ] `plugin/host.js` 与 `plugin/client.js` 为最新（v6，含 `inject: ['timer']`）
- [ ] token 仅用于本次推送，完成后建议在 GitHub 上撤销
