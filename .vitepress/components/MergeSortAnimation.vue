<script setup>
import { ref } from 'vue'

// 18个元素，能很好地展示迭代法 2->4->8->16 的过程
const INITIAL_ARR = [65, 30, 82, 10, 45, 22, 90, 15, 77, 55, 33, 88, 5, 60, 28, 95, 12, 40]
const arr = ref([...INITIAL_ARR])
const tempArr = ref(new Array(INITIAL_ARR.length).fill(null))

// 颜色状态: 'default', 'left-group', 'right-group', 'sorted', 'gone'
const colorState = ref(new Array(INITIAL_ARR.length).fill('default'))

const mergePointers = ref({ i: -1, j: -1 })
const isRunning = ref(false)
const message = ref('请选择排序模式')
const currentMode = ref('') // 'recursive' | 'iterative'

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const reset = () => {
  arr.value = [...INITIAL_ARR]
  tempArr.value = new Array(INITIAL_ARR.length).fill(null)
  colorState.value.fill('default')
  mergePointers.value = { i: -1, j: -1 }
  isRunning.value = false
  message.value = '准备就绪'
  currentMode.value = ''
}

// === 核心：通用的 Merge 函数 ===
// 无论是递归还是迭代，最后都要调用这个函数来“合并两个有序区间”
const merge = async (left, mid, right) => {
  // 1. 染色阶段：区分左右阵营 (蓝 vs 紫)
  for(let x=left; x<=mid; x++) colorState.value[x] = 'left-group'
  for(let x=mid+1; x<=right; x++) colorState.value[x] = 'right-group'
  
  // 提示信息根据模式略有不同
  if (currentMode.value === 'iterative') {
     // message.value = `合并块: [${left}~${mid}] & [${mid+1}~${right}]`
  } else {
     message.value = `递归合并: 左[${left}~${mid}] & 右[${mid+1}~${right}]`
  }
  await sleep(600)

  let i = left
  let j = mid + 1
  let t = 0 
  let currentTemp = [] 

  // 2.搬运到 Temp
  while (i <= mid && j <= right) {
    mergePointers.value = { i, j }
    await sleep(200)

    if (arr.value[i] <= arr.value[j]) {
      tempArr.value[left + t] = arr.value[i]
      currentTemp.push(arr.value[i])
      colorState.value[i] = 'gone' 
      i++
    } else {
      tempArr.value[left + t] = arr.value[j]
      currentTemp.push(arr.value[j])
      colorState.value[j] = 'gone'
      j++
    }
    t++
    await sleep(50) 
  }

  while (i <= mid) {
    tempArr.value[left + t] = arr.value[i]
    currentTemp.push(arr.value[i])
    colorState.value[i] = 'gone'
    i++; t++; await sleep(30)
  }
  while (j <= right) {
    tempArr.value[left + t] = arr.value[j]
    currentTemp.push(arr.value[j])
    colorState.value[j] = 'gone'
    j++; t++; await sleep(30)
  }

  // 3. 抄回 (变绿)
  // message.value = '合并完成，写回原数组'
  await sleep(200)
  
  for (let k = 0; k < currentTemp.length; k++) {
    arr.value[left + k] = currentTemp[k]
    colorState.value[left + k] = 'sorted' 
    tempArr.value[left + k] = null        
    await sleep(50)
  }
}

// === 模式 1：递归归并 (Top-Down) ===
const recursiveMergeSort = async (left, right) => {
  if (left >= right) return
  const mid = Math.floor(left + (right - left) / 2)
  
  await recursiveMergeSort(left, mid)
  await recursiveMergeSort(mid + 1, right)
  await merge(left, mid, right)
}

// === 模式 2：迭代归并 (Bottom-Up) ===
const iterativeMergeSort = async () => {
  const n = arr.value.length
  
  // width 是子数组的大小：1 -> 2 -> 4 -> 8 -> 16...
  for (let width = 1; width < n; width *= 2) {
    message.value = `[迭代阶段] 当前合并块大小 (width) = ${width}`
    await sleep(1000) // 每一轮大循环暂停一下，让用户意识到“层级”变了
    
    // 遍历数组，每次处理两个 width 大小的块
    for (let i = 0; i < n; i += 2 * width) {
      let left = i
      let mid = i + width - 1
      let right = Math.min(i + 2 * width - 1, n - 1)
      
      // 只有存在右半部分时才需要合并
      if (mid < right) {
        await merge(left, mid, right)
      } else {
        // 剩下的这部分本轮无需合并，直接标绿过一下，保持视觉一致性
        // for(let k=left; k<=right; k++) colorState.value[k] = 'sorted'
      }
    }
  }
}

// === 控制逻辑 ===
const startRecursion = async () => {
  if (isRunning.value) return
  reset() // 先重置
  isRunning.value = true
  currentMode.value = 'recursive'
  await recursiveMergeSort(0, arr.value.length - 1)
  finish()
}

const startIteration = async () => {
  if (isRunning.value) return
  reset() // 先重置
  isRunning.value = true
  currentMode.value = 'iterative'
  await iterativeMergeSort()
  finish()
}

const finish = () => {
  message.value = '排序完成！'
  isRunning.value = false
  // 最终确保全绿
  colorState.value.fill('sorted')
}
</script>

<template>
  <div class="sort-box">
    <div class="controls">
      <button @click="startRecursion" :disabled="isRunning" class="btn primary">递归法动画</button>
      <button @click="startIteration" :disabled="isRunning" class="btn secondary">迭代法动画</button>
      <button @click="reset" :disabled="isRunning" class="btn">重置</button>
    </div>
    
    <div class="status-bar">
       <span class="mode-tag" v-if="currentMode === 'recursive'">Recursive (Top-Down)</span>
       <span class="mode-tag iter" v-if="currentMode === 'iterative'">Iterative (Bottom-Up)</span>
       <span class="msg">{{ message }}</span>
    </div>

    <div class="visual-area main-area">
      <div v-for="(num, index) in arr" :key="'main'+index" class="bar-wrapper">
        <div 
          class="bar main-bar"
          :class="{
            'group-left': colorState[index] === 'left-group',
            'group-right': colorState[index] === 'right-group',
            'sorted': colorState[index] === 'sorted',
            'gone': colorState[index] === 'gone',
            'comparing': index === mergePointers.i || index === mergePointers.j
          }"
          :style="{ height: num * 1.2 + 10 + 'px' }"
        >
          <span class="bar-val" v-if="colorState[index] !== 'gone'">{{ num }}</span>
        </div>
      </div>
    </div>

    <div class="divider">
      <span>Auxiliary Array (临时空间)</span>
      <span class="arrow">⬇️ Copy To Temp / Copy Back ⬆️</span>
    </div>

    <div class="visual-area temp-area">
      <div v-for="(num, index) in tempArr" :key="'temp'+index" class="bar-wrapper">
        <div 
          class="bar temp-bar"
          :class="{ 'visible': num !== null }"
          :style="{ height: (num || 0) * 1.2 + 10 + 'px' }"
        >
          <span class="bar-val">{{ num }}</span>
        </div>
      </div>
    </div>
    
    <div class="legend">
      <div class="item"><span class="dot left"></span>左组 (Blue)</div>
      <div class="item"><span class="dot right"></span>右组 (Purple)</div>
      <div class="item"><span class="dot sorted"></span>已合并 (Green)</div>
    </div>
  </div>
</template>

<style scoped>
.sort-box {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 1rem;
  background: var(--vp-c-bg-soft);
  margin: 1rem 0;
}
.controls { display: flex; gap: 10px; margin-bottom: 0.5rem; align-items: center; flex-wrap: wrap; }
.btn { padding: 5px 14px; border-radius: 4px; border: 1px solid var(--vp-c-divider); cursor: pointer; font-size: 13px; font-weight: 500; }
.btn.primary { background: #3b82f6; color: white; border: none; }
.btn.secondary { background: #8b5cf6; color: white; border: none; } /* 紫色按钮 */
.btn:disabled { opacity: 0.5; cursor: not-allowed; }

.status-bar { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; font-size: 13px; height: 24px; }
.mode-tag { background: #3b82f6; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; }
.mode-tag.iter { background: #8b5cf6; }
.msg { color: var(--vp-c-text-2); font-weight: bold; }

.visual-area {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  height: 140px; 
  gap: 2px;
}
.main-area { border-bottom: 1px dashed var(--vp-c-divider); padding-bottom: 5px; }
.temp-area { margin-top: 5px; }

.divider { 
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  color: var(--vp-c-text-3); font-size: 10px; margin: 5px 0; font-weight: bold; 
}
.divider .arrow { font-size: 12px; margin-top: 2px; opacity: 0.6; }

.bar-wrapper { flex: 1; max-width: 30px; display: flex; flex-direction: column; align-items: center; }
.bar {
  width: 90%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  border-radius: 3px 3px 0 0;
  transition: all 0.2s;
  position: relative;
}
.bar-val { font-size: 9px; margin-bottom: 2px; font-weight: bold; color: rgba(255,255,255,0.9); text-shadow: 0 1px 2px rgba(0,0,0,0.3); }

/* 核心配色逻辑 */
.main-bar { background: var(--vp-c-brand-dimm); color: var(--vp-c-text-1); }
.main-bar.gone { opacity: 0.1; transform: scale(0.8); } 
.main-bar.group-left { background: #3b82f6; } 
.main-bar.group-right { background: #a855f7; } 
.main-bar.sorted { background: #10b981; } 
.main-bar.comparing { 
  border: 2px solid #f59e0b; 
  transform: translateY(-5px) scale(1.1); 
  z-index: 10; 
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.temp-bar { background: #10b981; opacity: 0; transform: translateY(-10px); transition: all 0.2s; }
.temp-bar.visible { opacity: 1; transform: translateY(0); }
.temp-bar .bar-val { color: white; }

.legend { display: flex; gap: 15px; justify-content: center; font-size: 12px; color: var(--vp-c-text-2); margin-top: 10px; }
.item { display: flex; align-items: center; gap: 5px; }
.dot { width: 10px; height: 10px; display: inline-block; border-radius: 50%; }
.dot.left { background: #3b82f6; }
.dot.right { background: #a855f7; }
.dot.sorted { background: #10b981; }
</style>