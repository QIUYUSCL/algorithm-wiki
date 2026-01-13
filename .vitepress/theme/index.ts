import DefaultTheme from 'vitepress/theme'
import CycleAnimation from '../components/CycleAnimation.vue'

export default {
    extends: DefaultTheme,
    enhanceApp({ app }) {
        // 注册全局组件
        app.component('CycleAnimation', CycleAnimation)
    }
}