#!/bin/bash

# ============ 1. 配置区域 ============
# 你的云服务器公网 IP
SERVER_IP="47.93.24.69"

# 宝塔面板里的网站根目录
SERVER_DIR="/www/wwwroot/blog.testscl.xyz/dist"

# 【修正】项目所在的 Linux 文件夹路径
# 注意：路径中有中文，变量引用时必须加引号
PROJECT_DIR="/home/scl/桌面/vue/algorithm-wiki"
# =====================================

# 遇到错误立即停止脚本
set -e

echo "=========================================="
echo "     🚀 全渠道发布 (GitHub + 云服务器)"
echo "=========================================="

# 进入项目目录 (使用双引号包裹变量以处理中文路径)
cd "$PROJECT_DIR" || { echo "❌ 找不到目录: $PROJECT_DIR"; exit 1; }

# --- 第一步：同步笔记 ---
echo "[1/4] 正在从 Obsidian 同步笔记..."
# 确保调用 python3
python3 sync_notes.py

if [ $? -ne 0 ]; then
    echo "❌ 同步失败，脚本终止。"
    exit 1
fi

# --- 第二步：本地构建 ---
echo "[2/4] 正在本地构建静态网站 (npm run docs:build)..."
npm run docs:build

if [ $? -ne 0 ]; then
    echo "❌ 构建失败！请检查 Markdown 语法或依赖是否安装 (npm install)。"
    exit 1
fi

# --- 第三步：上传到云服务器 ---
echo "[3/4] 正在上传到服务器 ($SERVER_IP)..."
# scp 递归上传 dist 目录下的内容
scp -r .vitepress/dist/* root@$SERVER_IP:$SERVER_DIR

if [ $? -eq 0 ]; then
    echo "✅ 服务器部署成功！网站已更新。"
else
    echo "❌ 上传失败！请检查 SSH 免密登录或网络连接。"
    exit 1
fi

# --- 第四步：推送到 GitHub ---
echo "[4/4] 正在备份源码到 GitHub..."
git add .

# 获取当前时间
TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")

git commit -m "Auto deploy: $TIMESTAMP"
git push

echo ""
echo "🎉🎉🎉 全部流程结束！"
