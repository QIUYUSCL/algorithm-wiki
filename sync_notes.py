import os
import shutil
import platform
import sys

# ================= 配置区域 (自动适配 Windows/Linux) =================

# 检测当前操作系统
current_os = platform.system()

if current_os == "Windows":
    # Windows 路径配置
    OBSIDIAN_PUBLIC_DIR = r"E:\笔记\Public"
    VITEPRESS_ROOT = r"E:\vue\algorithm-wiki"
    print("🖥️  检测到运行环境: Windows")

elif current_os == "Linux":
    # Ubuntu 路径配置
    OBSIDIAN_PUBLIC_DIR = "/home/scl/文档/笔记/Public"
    VITEPRESS_ROOT = "/home/scl/桌面/vue/algorithm-wiki"
    print("🐧 检测到运行环境: Linux (Ubuntu)")

else:
    print(f"⚠️ 未知操作系统: {current_os}，请手动检查路径配置")
    OBSIDIAN_PUBLIC_DIR = ""
    VITEPRESS_ROOT = ""

# 3. 文件夹映射关系 (保持不变)
FOLDER_MAPPING = {
    "algo": "algo",
    "lang": "lang",
    "ai": "ai",
    "leetcode": "leetcode",
}

# 4. 图片资源文件夹
VITEPRESS_ASSETS_DIR = os.path.join(VITEPRESS_ROOT, "public")

# =======================================================

def sync_files():
    print(f"🚀 开始从 [{OBSIDIAN_PUBLIC_DIR}] 同步笔记...")

    # 1. 确保目标图片目录存在
    if not os.path.exists(VITEPRESS_ASSETS_DIR):
        try:
            os.makedirs(VITEPRESS_ASSETS_DIR)
        except OSError as e:
            print(f"❌ 创建目录失败: {e}")
            return

    # 2. 遍历 Obsidian Public 目录
    for root, dirs, files in os.walk(OBSIDIAN_PUBLIC_DIR):
        for filename in files:
            source_file = os.path.join(root, filename)

            # --- 处理 Markdown 文件 ---
            if filename.endswith(".md"):
                # 获取相对路径 (跨平台兼容)
                relative_path = os.path.relpath(root, OBSIDIAN_PUBLIC_DIR)

                # 拆分路径 (使用 os.sep 自动识别 / 或 \)
                path_parts = relative_path.split(os.sep)

                # 获取顶级文件夹名
                if not path_parts: continue
                top_folder = path_parts[0]

                # 检查顶级文件夹是否在映射表中
                if top_folder in FOLDER_MAPPING:
                    target_root_name = FOLDER_MAPPING[top_folder]

                    # 拼接目标路径
                    target_dir = os.path.join(VITEPRESS_ROOT, target_root_name, *path_parts[1:])

                    if not os.path.exists(target_dir):
                        os.makedirs(target_dir)

                    target_file = os.path.join(target_dir, filename)

                    # 复制文件
                    shutil.copy2(source_file, target_file)

                    # 打印信息
                    display_path = os.path.join(target_root_name, *path_parts[1:], filename)
                    print(f"✅ [笔记] 已同步: {display_path}")

            # --- 处理图片文件 ---
            elif filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.webp')):
                target_image = os.path.join(VITEPRESS_ASSETS_DIR, filename)
                shutil.copy2(source_file, target_image)

    print("\n🎉 同步完成！")

if __name__ == "__main__":
    try:
        # Windows 控制台编码修复 (Linux通常默认UTF-8，此段代码仅在需要时执行)
        if sys.stdout.encoding != 'utf-8':
            import codecs
            try:
                sys.stdout = codecs.getwriter("utf-8")(sys.stdout.detach())
            except AttributeError:
                pass # 防止在某些特殊环境报错

        # 检查路径是否存在
        if not OBSIDIAN_PUBLIC_DIR or not os.path.exists(OBSIDIAN_PUBLIC_DIR):
            print(f"❌ 错误：找不到 Obsidian 路径: {OBSIDIAN_PUBLIC_DIR}")
        elif not VITEPRESS_ROOT or not os.path.exists(VITEPRESS_ROOT):
            print(f"❌ 错误：找不到 VitePress 项目路径: {VITEPRESS_ROOT}")
        else:
            sync_files()
            
    except Exception as e:
        print(f"❌ 发生未知错误: {e}")
