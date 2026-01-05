@echo off
chcp 65001

:: -------------------------------------------------------
:: 【关键修复】强制 Python 使用 UTF-8 编码，防止 Emoji 报错
set PYTHONIOENCODING=utf-8
:: -------------------------------------------------------

:: 强制跳转到项目所在的文件夹
cd /d "E:\vue\algorithm-wiki"

echo ==========================================
echo      🚀 开始自动化发布流程
echo ==========================================

:: 1. 从 Obsidian 同步
echo [1/3] 正在从 Obsidian 同步笔记...
python sync_notes.py

:: 检查 Python 是否出错，如果出错直接暂停，方便看报错
if %errorlevel% neq 0 (
    echo.
    echo ❌❌❌ 同步脚本出错！请检查上面的报错信息。
    exit /b
)

:: 2. 提交到 Git
echo [2/3] 正在添加到版本控制...
git add .
set timestamp=%date% %time%
git commit -m "Auto update: %timestamp%"

:: 3. 推送到 GitHub
echo [3/3] 正在推送到 GitHub...
git push

echo.
echo ✅✅✅ 发布成功！