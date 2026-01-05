import os
import shutil
from pathlib import Path

# ================= 配置区域 (请修改这里) =================

# 1. Obsidian Public 文件夹的绝对路径
# 注意：路径前面加 r 是为了防止转义字符报错
OBSIDIAN_PUBLIC_DIR = r"E:\笔记\Public"

# 2. VitePress 项目的根目录
VITEPRESS_ROOT = r"E:\vue\algorithm-wiki"

# 3. 文件夹映射关系 { "Obsidian子文件夹": "VitePress子文件夹" }
# 左边是你 Obsidian 里的名字，右边是网站里的名字
FOLDER_MAPPING = {
    "algo": "algo",
    "lang": "lang",
    "ai": "ai",
    "leetcode": "leetcode",
    # 如果你有其他文件夹，继续在这里添加
}

# 4. 图片资源文件夹 (VitePress 的 public 目录)
VITEPRESS_ASSETS_DIR = os.path.join(VITEPRESS_ROOT, "public")

# =======================================================

def sync_files():
    print("🚀 开始同步 Obsidian 笔记...")

    # 1. 确保目标图片目录存在
    if not os.path.exists(VITEPRESS_ASSETS_DIR):
        os.makedirs(VITEPRESS_ASSETS_DIR)

    # 2. 遍历 Obsidian Public 目录
    for root, dirs, files in os.walk(OBSIDIAN_PUBLIC_DIR):
        for filename in files:
            source_file = os.path.join(root, filename)

            # --- 处理 Markdown 文件 ---
            if filename.endswith(".md"):
                # 获取当前文件所在的 Obsidian 子文件夹名
                # 例如 E:\ObsidianVault\Public\algo -> sub_folder_name 是 "algo"
                relative_path = os.path.relpath(root, OBSIDIAN_PUBLIC_DIR)
                sub_folder_name = relative_path.split(os.sep)[0]

                # 检查这个文件夹是否在我们的映射列表中
                if sub_folder_name in FOLDER_MAPPING:
                    target_folder_name = FOLDER_MAPPING[sub_folder_name]
                    target_dir = os.path.join(VITEPRESS_ROOT, target_folder_name)

                    # 如果目标文件夹不存在，自动创建
                    if not os.path.exists(target_dir):
                        os.makedirs(target_dir)

                    target_file = os.path.join(target_dir, filename)

                    # 复制文件
                    shutil.copy2(source_file, target_file)
                    print(f"✅ [笔记] 已同步: {sub_folder_name}/{filename}")

            # --- 处理图片文件 (自动搬运到 public) ---
            elif filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.webp')):
                target_image = os.path.join(VITEPRESS_ASSETS_DIR, filename)
                shutil.copy2(source_file, target_image)
                print(f"🖼️ [图片] 已同步: {filename}")

    print("\n🎉 同步完成！")

if __name__ == "__main__":
    # 简单的错误捕获，防止配置路径不对导致闪退
    try:
        if not os.path.exists(OBSIDIAN_PUBLIC_DIR):
            print(f"❌ 错误：找不到 Obsidian 路径: {OBSIDIAN_PUBLIC_DIR}")
        elif not os.path.exists(VITEPRESS_ROOT):
            print(f"❌ 错误：找不到 VitePress 项目路径: {VITEPRESS_ROOT}")
        else:
            sync_files()
    except Exception as e:
        print(f"❌ 发生未知错误: {e}")