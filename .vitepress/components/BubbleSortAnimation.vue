<script setup>
import { ref, reactive } from 'vue'

// 状态定义
const arr = ref([20, 50, 10, 90, 30, 70, 40, 80, 60, 5])
const comparing = ref([]) // 当前正在比较的两个下标
const sorted = ref(new Set()) // 已经排好序（锁定）的下标
const isRunning = ref(false)
const message = ref('点击“开始排序”演示冒泡过程')

// 辅助：重置数组
const reset = () => {
  arr.value = [20, 50, 10, 90, 30, 70, 40, 80, 60, 5]
  comparing.value = []
  sorted.value = new Set()
  isRunning.value = false
  message.value = '准备就绪'
}

// 辅助：睡眠函数用于控制动画速度
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// 核心排序逻辑（对应你的 C++ 代码逻辑）
const startSort = async () => {
  if (isRunning.value) return
  isRunning.value = true
  
  const n = arr.value.length
  
  // 外层循环：n-1轮
  for (let i = 0; i < n - 1; i++) {
    let swapped = false
    message.value = `第 ${i + 1} 轮推土机开始`
    
    // 内层循环：推土机工作
    for (let j = 0; j < n - 1 - i; j++) {
      // 状态：正在比较
      comparing.value = [j, j + 1]
      await sleep(300) 
      
      if (arr.value[j] > arr.value[j + 1]) {
        // 交换
        let temp = arr.value[j]
        arr.value[j] = arr.value[j + 1]
        arr.value[j + 1] = temp
        swapped = true
      }
      
      // 比较结束，稍微停顿
      await sleep(200)
    }
    
    // 每一轮结束，最后那个元素被锁定
    sorted.value.add(n - 1 - i)
    comparing.value = []
    
    if (!swapped) {
      message.value = '检测到本轮无交换，提前结束！'
      // 把剩下的都标记为 sorted
      for (let k = 0; k < n - i; k++) sorted.value.add(k)
      break
    }
  }
  
  // 确保第0个也被标记
  sorted.value.add(0)
  isRunning.value = false
  message.value = '排序完成！'
}
</script>

<template>
  <div class="sort-container">
    <div class="controls">
      <button @click="startSort" :disabled="isRunning" class="btn primary">开始排序</button>
      <button @click="reset" :disabled="isRunning" class="btn">重置</button>
      <span class="status">{{ message }}</span>
    </div>

    <div class="visualization">
      <div 
        v-for="(num, index) in arr" 
        :key="index"
        class="bar-wrapper"
      >
        <div 
          class="bar"
          :class="{
            'active': comparing.includes(index),
            'sorted': sorted.has(index)
          }"
          :style="{ height: num * 3 + 'px' }"
        >
          <span class="bar-value">{{ num }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sort-container {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 1.5rem;
  margin: 1rem 0;
  background-color: var(--vp-c-bg-soft);
}

.controls {
  margin-bottom: 1.5rem;
  display: flex;
  gap: 10px;
  align-items: center;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  cursor: pointer;
  transition: all 0.2s;
}

.btn.primary {
  background-color: var(--vp-c-brand);
  color: white;
  border-color: var(--vp-c-brand);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.status {
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
  margin-left: auto;
}

.visualization {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  height: 300px;
  gap: 8px;
  border-bottom: 2px solid var(--vp-c-divider);
  padding-bottom: 5px;
}

.bar-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  width: 40px;
}

.bar {
  background-color: var(--vp-c-brand-dimm);
  border-radius: 4px 4px 0 0;
  transition: height 0.3s ease, background-color 0.3s ease;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  position: relative;
}

.bar-value {
  margin-top: -25px;
  font-size: 12px;
  font-weight: bold;
  color: var(--vp-c-text-1);
}

/* 正在比较（高亮） */
.bar.active {
  background-color: #f59e0b; /* 橙色 */
}

/* 已归位（锁定） */
.bar.sorted {
  background-color: #10b981; /* 绿色 */
}
</style>