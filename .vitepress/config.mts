import { defineConfig } from 'vitepress'
import mathjax3 from 'markdown-it-mathjax3'
// @ts-ignore
import fs from 'fs'
// @ts-ignore
import path from 'path'

// [!code focus:4]
// -------------------------------------------------------------------------
// 🤖 自动生成侧边栏的魔法函数 (升级版：支持二级目录)
// -------------------------------------------------------------------------
function generateSidebar(folderName: string, title: string) {
  const dirPath = path.resolve(__dirname, '../' + folderName)
  const items: any[] = []

  //HB 如果文件夹不存在，直接返回空数组
  if (!fs.existsSync(dirPath)) return []

  // 1. 扫描一级子文件夹 (例如: lang/C++, lang/Python)
  const dirs = fs.readdirSync(dirPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)

  for (const dir of dirs) {
    const subDirPath = path.resolve(dirPath, dir)
    const sectionItems: any[] = []

    // 🅰️ 扫描当前目录下的 .md 文件 (例如: lang/C++/智能指针.md)
    const files = fs.readdirSync(subDirPath, { withFileTypes: true })
        .filter(dirent => !dirent.isDirectory() && dirent.name.endsWith('.md'))
        .map(dirent => {
          const name = dirent.name.replace('.md', '')
          return {
            text: name,
            link: `/${folderName}/${dir}/${name}`,
            name: name
          }
        })

    // 🅱️ 扫描二级子文件夹 (🔥 新增逻辑: 例如 lang/C++/C++ Primer)
    const subDirs = fs.readdirSync(subDirPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name)

    for (const subDir of subDirs) {
      const deepDirPath = path.resolve(subDirPath, subDir)
      const deepFiles = fs.readdirSync(deepDirPath)
          .filter(file => file.endsWith('.md'))
          .map(file => {
            const name = file.replace('.md', '')
            return {
              text: name,
              link: `/${folderName}/${dir}/${subDir}/${name}`,
              name: name
            }
          })

      const hasIndex = deepFiles.some(kf => kf.name === 'index');
      const visibleFiles = deepFiles.filter(f => f.name !== 'index')

      if (deepFiles.length > 0) {
        sectionItems.push({
          text: subDir, // 显示 "C++ Primer"
          link: hasIndex ? `/${folderName}/${dir}/${subDir}/` : undefined,
          items: visibleFiles,
          collapsed: true // 默认折QF
        })
      }
    }

    // 🟢 合并：把散文件(如智能指针)和子文件夹(如C++ Primer)放到一起
    const visibleRootFiles = files.filter(f => f.name !== 'index')
    sectionItems.push(...visibleRootFiles)

    // 检查一级目录是否有 index.md
    const hasRootIndex = files.some(f => f.name === 'index')

    if (sectionItems.length > 0) {
      items.push({
        text: dir, // 组名 (例如 C++)
        link: hasRootIndex ? `/${folderName}/${dir}/` : undefined,
        items: sectionItems,
        collapsed: false
      })
    }
  }

  // 2. 处理根目录下的散乱文件 (保持不变)
  const rootFiles = fs.readdirSync(dirPath)
      .filter(file => file.endsWith('.md') && !file.toLowerCase().includes('index'))
      .map(file => {
        const name = file.replace('.md', '')
        return {
          text: name,
          link: `/${folderName}/${name}`
        }
      })

  if (rootFiles.length > 0) {
    items.push({
      text: title,
      items: rootFiles
    })
  }

  return items
}


// -------------------------------------------------------------------------

export default defineConfig({
  // 1. 网站元数据
  title: "Scl's CS Wiki",
  description: "全栈开发、算法与人工智能学习笔记",
  lastUpdated: true,
  ignoreDeadLinks: true,
  head: [
    ['link', { rel: 'icon', href: '/logo.png' }]
  ],

  // Markdown 配置 (支持数学公式)
  markdown: {
    config: (md) => {
      md.use(mathjax3)
    }
  },

  themeConfig: {

    // 👇【新增 2】设置左上角导航栏 Logo
    logo: '/logo.png',


    // 2. 顶部导航栏 (Navbar)
    // 注意：这里的 link 需要指向你实际存在的某个 md 文件，否则点击会 404
    nav: [
      { text: '🏠 首页', link: '/' },
      { text: '💻 编程语言', link: '/lang/', activeMatch: '/lang/' },
      { text: '⚔️ 算法知识', link: '/algo/', activeMatch: '/algo/' },
      { text: '🐛 经典题目', link: '/leetcode/', activeMatch: '/leetcode/' },
      { text: '🧠 问题八股', link: '/problems/', activeMatch: '/problems/' },
      {
        text: '🔗 其他',
        items: [
          { text: '🤖 人工智能', link: '/ai/', activeMatch: '/ai/' },
          { text: '📅 100天计划', link: 'https://plan.testscl.xyz' },
          { text: '📝 刷题日记', link: 'https://diary.testscl.xyz' }
        ]
      }
    ],

    // 大纲显示配置 (右侧目录)
    outline: {
      level: [2, 4],
      label: '页面导航'
    },

    // 3. 侧边栏 (Sidebar) - 全自动生成 ✨
    // 这里调用函数扫描对应的文件夹
    sidebar: {
      '/lang/': generateSidebar('lang', '语言基础'),
      '/algo/': generateSidebar('algo', '算法杂项'),
      '/ai/': generateSidebar('ai', 'AI 笔记'),
      '/leetcode/': generateSidebar('leetcode', 'LeetCode 题解'),
      // ✨ 新增：自动生成 problems 文件夹的侧边栏
      '/problems/': generateSidebar('problems', '面试八股'),
    },

    // 社交链接
    socialLinks: [
      { icon: 'github', link: 'https://github.com/QIUYUSCL' }
    ],

    // 搜索
    search: { provider: 'local' },

    // 页脚
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026 Scl'
    }
  }
})