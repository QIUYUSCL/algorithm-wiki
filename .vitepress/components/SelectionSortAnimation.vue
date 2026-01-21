<script setup>
import { ref } from 'vue'

const INITIAL_ARR = [29, 10, 14, 37, 14, 25, 8, 32, 17, 5] // 包含重复元素演示不稳定性
const arr = ref([...INITIAL_ARR])

// 动画状态
const currentIndex = ref(-1)      // 当前轮次放置的位置 (i)
const scanningIndex = ref(-1)     // 正在扫描的位置 (j)
const minIndex = ref(-1)          // 当前找到的最小值下标 (狙击镜锁定的位置)
const isRunning = ref(false)
const message = ref('点击“开始排序”体验狙击过程')

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const reset = () => {
  arr.value = [...INITIAL_ARR]
  currentIndex.value = -1
  scanningIndex.value = -1
  minIndex.value = -1
  isRunning.value = false
  message.value = '准备就绪'
}

const startSort = async () => {
  if (isRunning.value) return
  isRunning.value = true
  
  const n = arr.value.length
  
  for (let i = 0; i < n - 1; i++) {
    currentIndex.value = i
    minIndex.value = i // 假设当前位置 i 就是最小的
    message.value = `第 ${i+1} 轮：假设位置 ${i} (${arr.value[i]}) 是最小的`
    await sleep(500)

    // 🔭 在后面剩下的堆里找个更小的
    for (let j = i + 1; j < n; j++) {
      scanningIndex.value = j
      await sleep(200)

      if (arr.value[j] < arr.value[minIndex.value]) {
        message.value = `发现了更小的目标！锁定位置 ${j} (${arr.value[j]})`
        minIndex.value = j // 更新瞄准点
        await sleep(400)
      }
    }
    
    scanningIndex.value = -1 // 扫描结束
    
    // 交换
    if (minIndex.value !== i) {
      message.value = `交换：把最小的 ${arr.value[minIndex.value]} 换到位置 ${i}`
      await sleep(400)
      let temp = arr.value[i]
      arr.value[i] = arr.value[minIndex.value]
      arr.value[minIndex.value] = temp
    } else {
      message.value = `位置 ${i} 已经是最小，无需交换`
    }
    
    await sleep(400)
  }
  
  // 收尾
  currentIndex.value = n // 全部标记为绿色
  minIndex.value = -1
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
            'sorted': index < currentIndex,          /* 已归档 (绿色) */
            'min-target': index === minIndex,        /* 当前锁定的最小值 (红色) */
            'scanning': index === scanningIndex,     /* 正在扫描 (蓝色) */
            'current-base': index === currentIndex   /* 当前轮次基准位 (黄色) */
          }"
          :style="{ height: num * 5 + 'px' }"
        >
          {{ num }}
        </div>
        <span class="index-label">{{ index }}</span>
        <span v-if="index === minIndex" class="target-icon">🎯</span>
      </div>
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
  height: 250px;
  gap: 8px;
  margin-bottom: 1rem;
}

.bar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 30px;
  position: relative;
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

.target-icon {
  position: absolute;
  bottom: -25px;
  font-size: 16px;
  animation: bounce 1s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

/* 状态颜色 */
.bar.sorted {
  background-color: #10b981; /* 绿色：已归位 */
}
.bar.scanning {
  background-color: #3b82f6; /* 蓝色：雷达扫描中 */
}
.bar.min-target {
  background-color: #ef4444; /* 红色：锁定目标 */
  color: white;
}
.bar.current-base {
  border: 2px dashed #f59e0b; /* 黄色虚线框：待交换的位置 */
}
</style>