import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import LC142CycleAnimation from '../components/LC142CycleAnimation.vue'
import BubbleSortAnimation from '../components/BubbleSortAnimation.vue'
import InsertionSortAnimation from '../components/InsertionSortAnimation.vue'
// 1. 引入新组件
import SelectionSortAnimation from '../components/SelectionSortAnimation.vue'
import QuickSortAnimation from '../components/QuickSortAnimation.vue'
import MergeSortAnimation from '../components/MergeSortAnimation.vue' // 新增
import HeapSortAnimation from '../components/HeapSortAnimation.vue'

export default {
    extends: DefaultTheme,
    enhanceApp({ app }) {
        app.component('LC142CycleAnimation', LC142CycleAnimation)
        app.component('BubbleSortAnimation', BubbleSortAnimation)
        app.component('InsertionSortAnimation', InsertionSortAnimation)
        // 2. 注册新组件
        app.component('SelectionSortAnimation', SelectionSortAnimation)
        app.component('QuickSortAnimation', QuickSortAnimation)
        app.component('MergeSortAnimation', MergeSortAnimation) // 注册
        app.component('HeapSortAnimation', HeapSortAnimation)
    }
} satisfies Theme