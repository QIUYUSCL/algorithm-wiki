<script setup>
import { ref } from 'vue'

const INITIAL_ARR = [45, 12, 89, 34, 76, 23, 56, 4, 90, 67, 15, 88, 33, 72, 50, 95, 20, 8, 62, 40]
const arr = ref([...INITIAL_ARR])

// 0: 普通, 1: 基准(Pivot), 2: 小于基准(Left Part), 3: 大于基准(Right Part), 4: 已排序(Sorted)
const colorStates = ref(new Array(INITIAL_ARR.length).fill(0)) 

const leftPtr = ref(-1)
const rightPtr = ref(-1)
const currentRange = ref([-1, -1]) 
const isRunning = ref(false)
const message = ref('点击“开始排序”体验分治过程')

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const reset = () => {
  arr.value = [...INITIAL_ARR]
  colorStates.value = new Array(INITIAL_ARR.length).fill(0)
  leftPtr.value = -1
  rightPtr.value = -1
  currentRange.value = [-1, -1]
  isRunning.value = false
  message.value = '准备就绪'
}

const partition = async (left, right) => {
  currentRange.value = [left, right]
  
  // 重置当前区间颜色
  for(let k=left; k<=right; k++) colorStates.value[k] = 0
  
  // 1. 直接选择最左侧为基准
  let pivotIdx = left; 
  colorStates.value[pivotIdx] = 1; // Pivot Color (Orange)
  message.value = `固定选择最左侧元素: ${arr.value[pivotIdx]} 作为基准`;
  await sleep(500);

  let pivot = arr.value[left];
  message.value = `基准 ${pivot} 准备就绪，开始扫描`;
  await sleep(400);

  let i = left + 1
  let j = right

  while (true) {
    // i 向右找比 pivot 大的
    while (i <= right && arr.value[i] < pivot) {
      leftPtr.value = i; rightPtr.value = j;
      colorStates.value[i] = 2; // Green (Small)
      await sleep(50) 
      i++
    }
    leftPtr.value = i;
    
    // j 向左找比 pivot 小的
    while (j > left && arr.value[j] > pivot) {
      rightPtr.value = j; leftPtr.value = i; 
      colorStates.value[j] = 3; // Purple (Large)
      await sleep(50)
      j--
    }
    rightPtr.value = j;

    if (i >= j) break

    // 交换
    message.value = `交换: ${arr.value[i]} (大) <-> ${arr.value[j]} (小)`
    await sleep(400);
    
    let temp = arr.value[i]; arr.value[i] = arr.value[j]; arr.value[j] = temp;
    
    colorStates.value[i] = 2; 
    colorStates.value[j] = 3; 
    await sleep(400)
    
    i++; j--
  }

  // 基准归位
  message.value = `基准 ${pivot} 归位到下标 ${j}`
  
  let temp = arr.value[left]; arr.value[left] = arr.value[j]; arr.value[j] = temp;
  
  colorStates.value[left] = 2; 
  colorStates.value[j] = 1;   
  
  leftPtr.value = -1
  rightPtr.value = -1
  await sleep(600)
  
  return j
}

const quickSort = async (left, right) => {
  if (left >= right) {
    // 递归基准情况：单个元素暂时设为普通色，等待最终统一变绿
    if(left >= 0 && left < arr.value.length) colorStates.value[left] = 0 
    return
  }

  const pIndex = await partition(left, right)
  
  await sleep(200)
  
  await quickSort(left, pIndex - 1)
  await quickSort(pIndex + 1, right)
}

const startSort = async () => {
  if (isRunning.value) return
  isRunning.value = true
  
  await quickSort(0, arr.value.length - 1)
  
  // === 新增：排序完成后的庆祝动画 ===
  message.value = '排序完成！'
  currentRange.value = [-1, -1] // 清除聚焦框
  
  // 依次变绿，产生扫描完成的效果
  for (let i = 0; i < arr.value.length; i++) {
    colorStates.value[i] = 4 // 设置为 Sorted 状态
    await sleep(30) // 30ms 间隔
  }
  
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
        :class="{ 'dimmed': currentRange[0] !== -1 && (index < currentRange[0] || index > currentRange[1]) }"
      >
        <div 
          class="bar"
          :class="{
            'state-pivot': colorStates[index] === 1,
            'state-small': colorStates[index] === 2,
            'state-large': colorStates[index] === 3,
            'state-sorted': colorStates[index] === 4, /* 新增绑定 */
            'left-ptr': index === leftPtr,
            'right-ptr': index === rightPtr
          }"
          :style="{ height: num * 1.8 + 10 + 'px' }"
        >
          <span class="bar-val" v-if="arr.length <= 25">{{ num }}</span>
        </div>
        
        <span class="index-label">{{ index }}</span>
        <span v-if="colorStates[index] === 1" class="pivot-icon">👑</span>
        
        <div class="pointers">
          <span v-if="index === leftPtr" class="ptr-text l-ptr">i</span>
          <span v-if="index === rightPtr" class="ptr-text r-ptr">j</span>
        </div>
      </div>
    </div>
    
    <div class="legend">
      <div class="item"><span class="dot pivot"></span>基准</div>
      <div class="item"><span class="dot small"></span>小于基准</div>
      <div class="item"><span class="dot large"></span>大于基准</div>
      <div class="item"><span class="dot sorted"></span>已排序</div>
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
.controls { display: flex; gap: 12px; margin-bottom: 1.5rem; align-items: center; }
.btn { padding: 4px 12px; border-radius: 4px; border: 1px solid var(--vp-c-divider); cursor: pointer; transition: 0.2s; }
.btn.primary { background: var(--vp-c-brand); color: white; border: none; }
.btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }

.visual-area {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  height: 280px;
  gap: 2px;
  margin-bottom: 1rem;
}

.bar-container { 
  flex: 1;
  max-width: 40px;
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  transition: opacity 0.3s; 
  position: relative; 
}
.bar-container.dimmed { opacity: 0.2; filter: blur(0.5px); } 

.bar {
  width: 90%;
  background: var(--vp-c-brand-dimm);
  border-radius: 3px 3px 0 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  transition: all 0.2s;
  position: relative;
}

.bar-val { font-size: 10px; color: var(--vp-c-text-2); font-weight: bold; margin-bottom: 2px; }

/* 颜色语义 */
.state-pivot { background-color: #f59e0b !important; z-index: 10; box-shadow: 0 0 8px rgba(245, 158, 11, 0.4); }
.state-small { background-color: #10b981 !important; opacity: 0.9; } 
.state-large { background-color: #ef4444 !important; opacity: 0.9; } 

/* 新增：完成状态 (明亮的绿色 + 发光) */
.state-sorted { 
  background-color: #10b981 !important; 
  opacity: 1; 
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.5); 
}

.left-ptr { border-bottom: 3px solid #3b82f6; } 
.right-ptr { border-bottom: 3px solid #8b5cf6; } 

.index-label { font-size: 9px; color: var(--vp-c-text-3); margin-top: 2px; }
.pivot-icon { position: absolute; top: -18px; font-size: 12px; animation: bounce 1s infinite; }
@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }

.pointers { height: 15px; position: relative; width: 100%; }
.ptr-text { position: absolute; top: 0; left: 50%; transform: translateX(-50%); font-size: 11px; font-weight: 800; }
.l-ptr { color: #3b82f6; }
.r-ptr { color: #8b5cf6; }

.legend { display: flex; gap: 15px; justify-content: center; font-size: 12px; color: var(--vp-c-text-2); margin-top: 10px; }
.item { display: flex; align-items: center; gap: 5px; }
.dot { width: 10px; height: 10px; display: inline-block; border-radius: 50%; }
.dot.pivot { background: #f59e0b; }
.dot.small { background: #10b981; }
.dot.large { background: #ef4444; }
.dot.sorted { background: #10b981; box-shadow: 0 0 5px rgba(16, 185, 129, 0.5); }
</style>