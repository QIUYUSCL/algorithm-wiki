<script setup>
import { ref } from 'vue'

// 初始数据
const INITIAL_ARR = [12, 11, 13, 5, 6, 7, 3, 15, 2]
const arr = ref([...INITIAL_ARR])

// 动画状态控制
const activeKeyIndex = ref(-1)    // 当前“摸在手里”的那张牌的原始位置
const activeKeyValue = ref(null)  // 当前“摸在手里”的那张牌的值
const comparingIndex = ref(-1)    // 正在和手里牌比较的“已排序牌”的下标
const sortedIndex = ref(0)        // 绿色分界线：0 到 sortedIndex 都是已排序的
const isRunning = ref(false)
const message = ref('点击“开始排序”体验理牌过程')

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const reset = () => {
  arr.value = [...INITIAL_ARR]
  activeKeyIndex.value = -1
  activeKeyValue.value = null
  comparingIndex.value = -1
  sortedIndex.value = 0
  isRunning.value = false
  message.value = '准备就绪'
}

const startSort = async () => {
  if (isRunning.value) return
  isRunning.value = true
  
  const n = arr.value.length
  
  // 逻辑对应你的 C++ 代码
  // 默认第0张已排好，从第1张开始摸牌
  for (let i = 1; i < n; i++) {
    // 1. 摸牌动作
    let key = arr.value[i]
    activeKeyValue.value = key
    activeKeyIndex.value = i 
    message.value = `摸到了新牌: ${key}，准备插入左边`
    await sleep(800)

    let j = i - 1
    
    // 2. 在已排序区间从后往前扫描
    while (j >= 0) {
      comparingIndex.value = j
      message.value = `拿 ${key} 和 ${arr.value[j]} 比一下...`
      await sleep(400)

      if (arr.value[j] > key) {
        // 3. 发现前面的牌比新牌大，往后挪
        message.value = `${arr.value[j]} 比 ${key} 大，${arr.value[j]} 往后挪一格`
        arr.value[j + 1] = arr.value[j]
        j--
        await sleep(400)
      } else {
        // 不需要挪了，找到位置
        break
      }
    }
    
    // 4. 插入新牌
    comparingIndex.value = -1
    arr.value[j + 1] = key
    message.value = `把 ${key} 插到位置 ${j + 1}`
    
    // 更新已排序边界（这一轮结束，0到i都是有序的）
    sortedIndex.value = i
    activeKeyIndex.value = -1 // 放手
    activeKeyValue.value = null
    await sleep(600)
  }
  
  message.value = '排序完成！'
  isRunning.value = false
}
</script>

<template>
  <div class="sort-box">
    <div class="controls">
      <button @click="startSort" :disabled="isRunning" class="btn primary">开始排序</button>
      <button @click="reset" :disabled="isRunning" class="btn">重置</button>
      <div class="status-text">{{ message }}</div>
    </div>

    <div class="visual-area">
      <div 
        v-for="(num, index) in arr" 
        :key="index"
        class="bar-container"
      >
        <div 
          class="bar"
          :class="{
            'sorted': index <= sortedIndex,   /* 已排序区 (绿色) */
            'key-card': index === activeKeyIndex || (activeKeyIndex !== -1 && index === comparingIndex + 1), /* 这是一个视觉trick，模拟移动中的空位 */
            'comparing': index === comparingIndex /* 正在被比较 (黄色) */
          }"
          :style="{ height: num * 12 + 'px' }"
        >
          {{ num }}
        </div>
        <span class="index-label">{{ index }}</span>
      </div>
    </div>
    
    <div class="hand-card-area" v-if="activeKeyValue !== null">
      <span>✋ 手里的牌: </span>
      <span class="hand-card">{{ activeKeyValue }}</span>
    </div>
  </div>
</template>

<style scoped>
.sort-box {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 1.5rem;
  background: var(--vp-c-bg-soft);
  margin: 1rem 0;
}

.controls {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.btn {
  padding: 4px 12px;
  border-radius: 4px;
  border: 1px solid var(--vp-c-divider);
  cursor: pointer;
}
.btn.primary {
  background: var(--vp-c-brand);
  color: white;
  border: none;
}
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.visual-area {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  height: 220px;
  gap: 6px;
  margin-bottom: 1rem;
}

.bar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 30px;
}

.bar {
  width: 100%;
  background: var(--vp-c-brand-dimm);
  border-radius: 4px 4px 0 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 4px;
  font-weight: bold;
  font-size: 14px;
  color: var(--vp-c-text-1);
  transition: all 0.3s ease;
}

.index-label {
  margin-top: 4px;
  font-size: 12px;
  color: var(--vp-c-text-3);
}

/* 状态颜色 */
.bar.sorted {
  background-color: #10b981; /* 绿色：已排序 */
}

.bar.comparing {
  background-color: #f59e0b; /* 橙色：正在被比较 */
}

/* 模拟“当前操作的位置” */
.bar.key-card {
  background-color: #8b5cf6; /* 紫色：插入点/新牌位置 */
  color: white;
}

.hand-card-area {
  text-align: center;
  font-weight: bold;
  height: 30px;
  color: var(--vp-c-text-2);
}
.hand-card {
  display: inline-block;
  background: #8b5cf6;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
}
</style>