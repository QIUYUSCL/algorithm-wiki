import os
import shutil
from pathlib import Path

# ================= 配置区域 (请修改这里) =================

# 1. Obsidian Public 文件夹的绝对路径
OBSIDIAN_PUBLIC_DIR = r"E:\笔记\Public"

# 2. VitePress 项目的根目录
VITEPRESS_ROOT = r"E:\vue\algorithm-wiki"

# 3. 文件夹映射关系
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
                # 获取相对路径 (例如: algo\STL)
                relative_path = os.path.relpath(root, OBSIDIAN_PUBLIC_DIR)

                # 拆分路径 (例如: ['algo', 'STL'])
                path_parts = relative_path.split(os.sep)

                # 获取顶级文件夹名 (例如: 'algo')
                top_folder = path_parts[0]

                # 检查顶级文件夹是否在映射表中
                if top_folder in FOLDER_MAPPING:
                    target_root_name = FOLDER_MAPPING[top_folder]

                    # 【核心修改】这里把子文件夹路径接回去
                    # 如果 path_parts 是 ['algo', 'STL']，parts[1:] 就是 ['STL']
                    # 结果就是: .../algorithm-wiki/algo/STL
                    target_dir = os.path.join(VITEPRESS_ROOT, target_root_name, *path_parts[1:])

                    # 如果目标文件夹不存在，自动创建 (包括多级目录)
                    if not os.path.exists(target_dir):
                        os.makedirs(target_dir)

                    target_file = os.path.join(target_dir, filename)

                    # 复制文件
                    shutil.copy2(source_file, target_file)

                    # 打印信息时显示完整路径，方便确认
                    display_path = os.path.join(target_root_name, *path_parts[1:], filename)
                    print(f"✅ [笔记] 已同步: {display_path}")

            # --- 处理图片文件 (保持不变，全部平铺到 public) ---
            elif filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.webp')):
                target_image = os.path.join(VITEPRESS_ASSETS_DIR, filename)
                shutil.copy2(source_file, target_image)
                # print(f"🖼️ [图片] 已同步: {filename}")

    print("\n🎉 同步完成！")

if __name__ == "__main__":
    try:
        # 设置控制台输出编码为 UTF-8，防止表情符号报错
        import sys
        if sys.stdout.encoding != 'utf-8':
            import codecs
            sys.stdout = codecs.getwriter("utf-8")(sys.stdout.detach())

        if not os.path.exists(OBSIDIAN_PUBLIC_DIR):
            print(f"❌ 错误：找不到 Obsidian 路径: {OBSIDIAN_PUBLIC_DIR}")
        elif not os.path.exists(VITEPRESS_ROOT):
            print(f"❌ 错误：找不到 VitePress 项目路径: {VITEPRESS_ROOT}")
        else:
            sync_files()
    except Exception as e:
        print(f"❌ 发生未知错误: {e}")