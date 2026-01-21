<script setup>
import { ref } from 'vue'

// 1. 更丰富的数据集 (18个元素)
const INITIAL_ARR = [65, 30, 82, 10, 45, 22, 90, 15, 77, 55, 33, 88, 5, 60, 28, 95, 12, 40]
const arr = ref([...INITIAL_ARR])
const tempArr = ref(new Array(INITIAL_ARR.length).fill(null))

// 颜色状态: 'default', 'left-group', 'right-group', 'sorted', 'gone'
const colorState = ref(new Array(INITIAL_ARR.length).fill('default'))

const activeRange = ref([-1, -1]) 
const mergePointers = ref({ i: -1, j: -1 })
const isRunning = ref(false)
const message = ref('点击“开始排序”体验归并逻辑')

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const reset = () => {
  arr.value = [...INITIAL_ARR]
  tempArr.value = new Array(INITIAL_ARR.length).fill(null)
  colorState.value.fill('default')
  activeRange.value = [-1, -1]
  mergePointers.value = { i: -1, j: -1 }
  isRunning.value = false
  message.value = '准备就绪'
}

const merge = async (left, mid, right) => {
  activeRange.value = [left, right]
  
  // 1. 染色阶段：区分左右阵营 (蓝 vs 紫)
  for(let x=left; x<=mid; x++) colorState.value[x] = 'left-group'
  for(let x=mid+1; x<=right; x++) colorState.value[x] = 'right-group'
  
  message.value = `合并: [${left}~${mid}] (蓝) 与 [${mid+1}~${right}] (紫)`
  await sleep(600)

  let i = left
  let j = mid + 1
  let t = 0 
  let currentTemp = [] // 逻辑暂存

  while (i <= mid && j <= right) {
    mergePointers.value = { i, j }
    await sleep(300)

    if (arr.value[i] <= arr.value[j]) {
      // message.value = `取左边: ${arr.value[i]}`
      tempArr.value[left + t] = arr.value[i]
      currentTemp.push(arr.value[i])
      colorState.value[i] = 'gone' // 原位置元素"消失"
      i++
    } else {
      // message.value = `取右边: ${arr.value[j]}`
      tempArr.value[left + t] = arr.value[j]
      currentTemp.push(arr.value[j])
      colorState.value[j] = 'gone' // 原位置元素"消失"
      j++
    }
    t++
    await sleep(100) // 移动速度稍快
  }

  // 处理剩余部分
  while (i <= mid) {
    tempArr.value[left + t] = arr.value[i]
    currentTemp.push(arr.value[i])
    colorState.value[i] = 'gone'
    i++; t++; await sleep(50)
  }
  while (j <= right) {
    tempArr.value[left + t] = arr.value[j]
    currentTemp.push(arr.value[j])
    colorState.value[j] = 'gone'
    j++; t++; await sleep(50)
  }

  // 抄回
  message.value = '临时区有序，抄回原数组 (变绿)'
  activeRange.value = [-1, -1] // 取消范围框，专注看抄回
  await sleep(300)
  
  for (let k = 0; k < currentTemp.length; k++) {
    arr.value[left + k] = currentTemp[k]
    colorState.value[left + k] = 'sorted' // 抄回来变成绿色(有序)
    tempArr.value[left + k] = null        // 临时区清空
    await sleep(80)
  }
}

const mergeSort = async (left, right) => {
  if (left >= right) return
  const mid = Math.floor(left + (right - left) / 2)
  
  await mergeSort(left, mid)
  await mergeSort(mid + 1, right)
  await merge(left, mid, right)
}

const startSort = async () => {
  if (isRunning.value) return
  isRunning.value = true
  await mergeSort(0, arr.value.length - 1)
  message.value = '排序完成！'
  activeRange.value = [-1, -1]
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
      <div class="item"><span class="dot left"></span>左有序组</div>
      <div class="item"><span class="dot right"></span>右有序组</div>
      <div class="item"><span class="dot sorted"></span>合并完成</div>
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
.controls { display: flex; gap: 10px; margin-bottom: 0.5rem; align-items: center; }
.btn { padding: 4px 12px; border-radius: 4px; border: 1px solid var(--vp-c-divider); cursor: pointer; }
.btn.primary { background: var(--vp-c-brand); color: white; border: none; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }

.visual-area {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  height: 140px; /* 调整高度 */
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
.main-bar .bar-val { color: var(--vp-c-text-2); } /* 默认文字颜色 */

.main-bar.gone { opacity: 0.1; transform: scale(0.8); } /* 移走后变淡 */

.main-bar.group-left { background: #3b82f6; } /* 左组 Blue */
.main-bar.group-left .bar-val { color: white; }

.main-bar.group-right { background: #a855f7; } /* 右组 Purple */
.main-bar.group-right .bar-val { color: white; }

.main-bar.sorted { background: #10b981; } /* 合并完 Green */
.main-bar.sorted .bar-val { color: white; }

/* 比较中高亮 */
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