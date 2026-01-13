import DefaultTheme from 'vitepress/theme'
import LC142CycleAnimation from '../components/LC142CycleAnimation.vue'

export default {
    extends: DefaultTheme,
    enhanceApp({ app }) {
        // 注册全局组件
        app.component('LC142CycleAnimation', LC142CycleAnimation)
    }
}