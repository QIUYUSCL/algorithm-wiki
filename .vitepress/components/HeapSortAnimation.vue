<script setup>
import { ref } from 'vue'

const INITIAL_ARR = [4, 10, 3, 5, 1, 2, 8] // 乱序数组
const arr = ref([...INITIAL_ARR])

// 状态
const heapSize = ref(INITIAL_ARR.length)
const activeParent = ref(-1) // 当前正在 heapify 的父节点
const activeChild = ref(-1)  // 当前正在比较的子节点
const sortedIndices = ref(new Set()) // 已经排好序的尾部元素
const isRunning = ref(false)
const message = ref('点击“开始排序”演示堆化过程')

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const reset = () => {
  arr.value = [...INITIAL_ARR]
  heapSize.value = INITIAL_ARR.length
  activeParent.value = -1
  activeChild.value = -1
  sortedIndices.value = new Set()
  isRunning.value = false
  message.value = '准备就绪'
}

// 核心下沉函数
const heapify = async (n, i) => {
  let largest = i
  let l = 2 * i + 1
  let r = 2 * i + 2
  
  activeParent.value = i
  message.value = `检查节点 ${i} (值为 ${arr.value[i]}) 及其子节点`
  await sleep(400)

  // 检查左孩子
  if (l < n) {
    activeChild.value = l
    await sleep(300)
    if (arr.value[l] > arr.value[largest]) {
      largest = l
      message.value = `左孩子 ${arr.value[l]} 更大，标记为最大`
    }
  }

  // 检查右孩子
  if (r < n) {
    activeChild.value = r
    await sleep(300)
    if (arr.value[r] > arr.value[largest]) {
      largest = r
      message.value = `右孩子 ${arr.value[r]} 更大，标记为最大`
    }
  }

  activeChild.value = -1 // 比较结束

  if (largest !== i) {
    message.value = `交换：父节点 ${arr.value[i]} 下沉，${arr.value[largest]} 上位`
    await sleep(500)
    
    // Swap
    let temp = arr.value[i]
    arr.value[i] = arr.value[largest]
    arr.value[largest] = temp
    
    // 递归下沉
    await heapify(n, largest)
  }
}

const startSort = async () => {
  if (isRunning.value) return
  isRunning.value = true
  
  const n = arr.value.length
  
  // 1. 建堆
  message.value = '阶段一：构建大顶堆 (Build Heap)'
  await sleep(800)
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    await heapify(n, i)
  }
  message.value = '大顶堆构建完成！堆顶元素最大。'
  activeParent.value = -1
  await sleep(1000)

  // 2. 排序
  message.value = '阶段二：依次交换堆顶与末尾 (Sort)'
  for (let i = n - 1; i > 0; i--) {
    // 交换堆顶
    message.value = `把堆顶 ${arr.value[0]} (最大) 换到末尾 ${i}`
    let temp = arr.value[0]
    arr.value[0] = arr.value[i]
    arr.value[i] = temp
    
    sortedIndices.value.add(i) // 锁定末尾
    heapSize.value = i // 缩小堆范围
    await sleep(600)
    
    // 重新堆化
    await heapify(i, 0)
  }
  
  sortedIndices.value.add(0)
  message.value = '排序完成！'
  isRunning.value = false
  activeParent.value = -1
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
      <div v-for="(num, index) in arr" :key="index" class="bar-wrapper">
        <div 
          class="bar"
          :class="{
            'sorted': sortedIndices.has(index),
            'parent': index === activeParent,
            'child': index === activeChild,
            'heap-scope': index < heapSize && !sortedIndices.has(index)
          }"
          :style="{ height: num * 12 + 'px' }"
        >
          {{ num }}
        </div>
        <span class="idx">{{ index }}</span>
      </div>
    </div>
    
    <div class="legend">
      <span class="dot parent"></span> 父节点
      <span class="dot child"></span> 比较中子节点
      <span class="dot sorted"></span> 已锁定
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
.controls { display: flex; gap: 10px; margin-bottom: 1.5rem; align-items: center; }
.btn { padding: 4px 12px; border-radius: 4px; border: 1px solid var(--vp-c-divider); cursor: pointer; }
.btn.primary { background: var(--vp-c-brand); color: white; border: none; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }

.visual-area {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  height: 200px;
  gap: 8px;
  margin-bottom: 1rem;
}

.bar-wrapper { width: 30px; display: flex; flex-direction: column; align-items: center; }
.bar {
  width: 100%;
  background: var(--vp-c-brand-dimm);
  border-radius: 4px 4px 0 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 2px;
  font-weight: bold;
  color: var(--vp-c-text-1);
  transition: all 0.3s;
  opacity: 0.5; /* 默认稍微暗淡一点 */
}

/* 状态类 */
.bar.heap-scope { opacity: 1; background: #94a3b8; } /* 堆范围内的元素 */
.bar.parent { background: #8b5cf6 !important; color: white; opacity: 1; transform: scale(1.1); } /* 紫色：父节点 */
.bar.child { background: #3b82f6 !important; color: white; opacity: 1; } /* 蓝色：比较对象 */
.bar.sorted { background: #10b981 !important; color: white; opacity: 1; } /* 绿色：已排序 */

.idx { font-size: 10px; color: var(--vp-c-text-3); margin-top: 4px; }

.legend { display: flex; gap: 15px; justify-content: center; font-size: 12px; color: var(--vp-c-text-2); }
.dot { width: 10px; height: 10px; display: inline-block; border-radius: 50%; margin-right: 4px; }
.dot.parent { background: #8b5cf6; }
.dot.child { background: #3b82f6; }
.dot.sorted { background: #10b981; }
</style>