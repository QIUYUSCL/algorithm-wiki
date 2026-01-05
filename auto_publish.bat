@echo off
chcp 65001
echo ==========================================
echo      🚀 开始自动化发布流程
echo ==========================================

:: 1. 从 Obsidian 同步 (如果你写了那个 python 脚本的话)
:: 如果没写 python 脚本，可以把下面这两行删掉，手动复制文件也行
echo [1/3] 正在从 Obsidian 同步笔记...
python sync_notes.py

:: 2. 提交到 Git
echo [2/3] 正在添加到版本控制...
git add .
set timestamp=%date% %time%
git commit -m "Auto update: %timestamp%"

:: 3. 推送到 GitHub (这一步会触发 Cloudflare 自动构建)
echo [3/3] 正在推送到 GitHub...
git push

echo.
if %errorlevel% equ 0 (
    echo ✅✅✅ 发送成功！Cloudflare 正在云端自动构建，请稍等 2 分钟。
) else (
    echo ❌❌❌ 出错了，请检查网络。
)
pause