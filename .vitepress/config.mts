import { defineConfig } from 'vitepress'
import mathjax3 from 'markdown-it-mathjax3'
import fs from 'fs'
import path from 'path'

// -------------------------------------------------------------------------
// 🤖 自动生成侧边栏的魔法函数
// -------------------------------------------------------------------------
function generateSidebar(folderName: string, title: string) {
  const dirPath = path.resolve(__dirname, '../' + folderName)
  const items: any[] = []

  // 如果文件夹不存在，直接返回空数组，防止报错
  if (!fs.existsSync(dirPath)) return []

  // 1. 先找子文件夹 (作为侧边栏的分组 Group)
  // 例如：algo/STL源码剖析/ -> 标题就是 "STL源码剖析"
  const dirs = fs.readdirSync(dirPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)

  for (const dir of dirs) {
    const subDirPath = path.resolve(dirPath, dir)
    const subFiles = fs.readdirSync(subDirPath)
        .filter(file => file.endsWith('.md'))
        .map(file => {
          const name = file.replace('.md', '')
          return {
            text: name,
            link: `/${folderName}/${dir}/${name}`,
            name: name // 临时存一下原始文件名，后面用来判断
          }
        })

    // 1. 检查是否有 index.md
    const hasIndex = subFiles.some(item => item.name === 'index')

    // 2. 过滤掉 index，不让它出现在子菜单里
    const visibleFiles = subFiles.filter(item => item.name !== 'index')

    if (subFiles.length > 0) {
      items.push({
        text: dir, // 组名 (例如 C++)
        // 🟢 关键点：如果有 index.md，点击组名直接跳转！
        link: hasIndex ? `/${folderName}/${dir}/` : undefined,
        items: visibleFiles,
        collapsed: false // 默认展开
      })
    }
  }

  // 2. 再找当前目录下的散乱 .md 文件 (作为默认分组)
  // 例如：algo/二分查找.md -> 归类到 "算法杂项" (即传入的 title)
  const files = fs.readdirSync(dirPath)
      .filter(file => file.endsWith('.md') && !file.toLowerCase().includes('index')) // 排除 index.md
      .map(file => {
        const name = file.replace('.md', '')
        return {
          text: name,
          link: `/${folderName}/${name}`
        }
      })

  if (files.length > 0) {
    items.push({
      text: title,
      items: files
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
      { text: '🤖 人工智能', link: '/ai/', activeMatch: '/ai/' },
      {
        text: '🔗 我的项目',
        items: [
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