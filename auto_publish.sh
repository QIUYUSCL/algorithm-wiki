#!/bin/bash

# ========================================================
# [核心修改] 强制将指定的 Node.js (v18.20.8) 加入环境变量 PATH
# 这样脚本在任何情况下运行时，都会使用这个特定版本的 Node 和 npm
# ========================================================
export PATH="/home/scl/.nvm/versions/node/v18.20.8/bin:$PATH"

# ============ 1. 配置区域 ============
# 你的云服务器公网 IP
SERVER_IP="47.93.24.69"

# 宝塔面板里的网站根目录
SERVER_DIR="/www/wwwroot/blog.testscl.xyz/dist"

# 项目所在的 Linux 文件夹路径 (保留之前的中文路径配置)
PROJECT_DIR="/home/scl/桌面/vue/algorithm-wiki"
# =====================================

# 遇到错误立即停止脚本
set -e

# 设置语言环境，防止中文乱码
export LANG=en_US.UTF-8

echo "=========================================="
echo "     🚀 全渠道发布 (GitHub + 云服务器)"
echo "     Node版本: $(node -v)"
echo "=========================================="

# 进入项目目录
cd "$PROJECT_DIR" || { echo "❌ 找不到目录: $PROJECT_DIR"; exit 1; }

# --- 第一步：同步笔记 ---
echo "[1/4] 正在从 Obsidian 同步笔记..."
python3 sync_notes.py

# --- 第二步：本地构建 ---
echo "[2/4] 正在本地构建静态网站 (npm run docs:build)..."
# 这里的 npm 现在会确保使用 v18.20.8
npm run docs:build

# --- 第三步：上传到云服务器 ---
echo "[3/4] 正在上传到服务器 ($SERVER_IP)..."
scp -r .vitepress/dist/* root@$SERVER_IP:$SERVER_DIR

# --- 第四步：推送到 GitHub ---
echo "[4/4] 正在备份源码到 GitHub..."
git add .

TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")

# 如果没有新文件，不报错直接跳过
git commit -m "Auto deploy: $TIMESTAMP" || echo "⚠️ 本地没有新修改，跳过提交步骤..."

# 推送 (已配置 SSH)
git push

echo ""
echo "🎉🎉🎉 全部流程结束！"
