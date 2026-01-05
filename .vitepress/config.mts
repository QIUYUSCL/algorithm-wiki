import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Testscl's Wiki",
  description: "算法模板与学习笔记",

  // 开启最后更新时间
  lastUpdated: true,

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config

    // 1. 顶部导航栏 (Navbar)
    nav: [
      { text: '🏠 首页', link: '/' },
      { text: '📚 算法模板', link: '/templates/intro' }, // 稍后我们创建这个目录
      { text: '💡 刷题心得', link: '/notes/intro' },

      // 这里添加你的另外两个子域名的跳转
      { text: '📅 100天计划', link: 'http://plan.testscl.xyz', target: '_self' },
      { text: '📝 刷题日记', link: 'http://diary.testscl.xyz', target: '_self' }
    ],

    // 2. 侧边栏 (Sidebar) - 就像书的目录
    sidebar: {
      // 当用户进入 /templates/ 目录时，显示这个侧边栏
      '/templates/': [
        {
          text: '基础算法',
          items: [
            { text: '介绍', link: '/templates/intro' },
            { text: '二分查找', link: '/templates/binary-search' },
            { text: '前缀和与差分', link: '/templates/prefix-sum' }
          ]
        },
        {
          text: '数据结构',
          items: [
            { text: '并查集', link: '/templates/union-find' },
            { text: '线段树', link: '/templates/segment-tree' }
          ]
        }
      ],

      // 当用户进入 /notes/ 目录时，显示这个侧边栏
      '/notes/': [
        {
          text: '动态规划',
          items: [
            { text: '背包问题', link: '/notes/knapsack' }
          ]
        }
      ]
    },

    // 3. 社交链接 (右上角)
    socialLinks: [
      { icon: 'github', link: 'https://github.com/你的github用户名' }
    ],

    // 4. 开启本地搜索 (Ctrl + K)
    search: {
      provider: 'local'
    },

    // 页脚
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026 Testscl'
    }
  }
})