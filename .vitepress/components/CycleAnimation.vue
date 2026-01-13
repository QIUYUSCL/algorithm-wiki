<script setup>
import { ref, computed } from 'vue'

// 状态机：0=初始, 1=赛跑中, 2=相遇暂停, 3=归位准备, 4=验证中, 5=验证完成
const status = ref(0)
const speedRate = ref(1)

// 文本提示
const statusText = computed(() => {
  switch(status.value) {
    case 0: return '准备：点击按钮开始'
    case 1: return '阶段一：龟兔赛跑 (2x 速度差)'
    case 2: return '相遇：两人停在 Meet 点'
    case 3: return '重置：慢指针瞬移回 Head，快指针原地待命'
    case 4: return '阶段二：同速前进 (证明 a = c)'
    case 5: return '验证成功：同时到达入口！'
    default: return ''
  }
})

// 按钮文本
const btnText = computed(() => {
  switch(status.value) {
    case 0: return '▶️ 开始追及 (Phase 1)'
    case 1: return '🏃 正在奔跑...'
    case 2: return '🔄 慢指针归位 (Reset)'
    case 3: return '✨ 开始验证 (Phase 2)'
    case 4: return '🚶 正在验证...'
    case 5: return '↺ 重置演示'
    default: return ''
  }
})

const handleAction = () => {
  if (status.value === 0) {
    // 开始阶段一
    status.value = 1
    setTimeout(() => { status.value = 2 }, 3000)
  } else if (status.value === 2) {
    // 归位
    status.value = 3
  } else if (status.value === 3) {
    // 开始阶段二
    status.value = 4
    setTimeout(() => { status.value = 5 }, 3000)
  } else if (status.value === 5) {
    // 重置
    status.value = 0
  }
}
</script>

<template>
  <div class="cycle-anim-container">
    <div class="svg-wrapper">
      <svg viewBox="0 0 400 200" class="cycle-svg">
        <defs>
          <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L6,3 z" fill="#ccc" />
          </marker>
          <marker id="arrow-active" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L6,3 z" fill="#ff9f43" />
          </marker>
        </defs>

        <line x1="20" y1="100" x2="134" y2="100" stroke="#eee" stroke-width="6" marker-end="url(#arrow)" />

        <circle cx="200" cy="100" r="60" stroke="#f0f0f0" stroke-width="6" fill="none" />

        <line v-if="status >= 3" x1="20" y1="100" x2="134" y2="100"
              class="highlight-path" marker-end="url(#arrow-active)" />
        <text v-if="status >= 3" x="80" y="90" fill="#ff9f43" font-weight="bold" font-size="14">a</text>
        <text v-else x="80" y="90" fill="#bbb" font-size="14">a</text>

        <path v-if="status >= 3" d="M 235 149 A 60 60 0 0 1 146 128"
              fill="none" stroke="#ff9f43" stroke-width="6" marker-end="url(#arrow-active)" class="highlight-path"/>
        <text v-if="status >= 3" x="170" y="165" fill="#ff9f43" font-weight="bold" font-size="14">c</text>
        <text v-else x="180" y="160" fill="#bbb" font-size="14">c</text>

        <path d="M 140 100 A 60 60 0 1 1 235 149" fill="none" stroke="#ddd" stroke-width="6" stroke-dasharray="6 4" opacity="0.5"/>
        <text x="240" y="60" fill="#bbb" font-size="14">b</text>

        <circle cx="20" cy="100" r="6" fill="#666" />
        <text x="20" y="125" font-size="12" fill="#666" text-anchor="middle">Head</text>

        <circle cx="140" cy="100" r="6" fill="#f9f" stroke="#fff" stroke-width="2"/>
        <text x="130" y="85" font-size="12" fill="#f9f" font-weight="bold">Entry</text>

        <circle cx="235" cy="149" r="6" fill="#bbf" stroke="#fff" stroke-width="2"/>
        <text x="250" y="165" font-size="12" fill="#bbf" font-weight="bold">Meet</text>


        <g class="runner rabbit" :class="`status-${status}`" style="transform: translateY(8px)">
          <circle r="10" fill="#FF5252" stroke="white" stroke-width="2" />
          <text y="4" x="-6" font-size="12">🐇</text>
        </g>

        <g class="runner turtle" :class="`status-${status}`" style="transform: translateY(-8px)">
          <circle r="10" fill="#4CAF50" stroke="white" stroke-width="2" />
          <text y="4" x="-6" font-size="12">🐢</text>
        </g>
      </svg>
    </div>

    <div class="controls">
      <div class="status-bar">
        <span class="status-dot" :class="{active: status!==0}"></span>
        {{ statusText }}
      </div>

      <button @click="handleAction" :disabled="status===1 || status===4" class="action-btn">
        {{ btnText }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.cycle-anim-container {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  margin: 20px 0;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.svg-wrapper {
  padding: 20px 0;
  background: radial-gradient(circle at center, var(--vp-c-bg) 0%, var(--vp-c-bg-soft) 100%);
}

.cycle-svg {
  width: 100%;
  height: auto;
  max-width: 600px;
  margin: 0 auto;
  display: block;
}

/* === 文本与按钮 === */
.controls {
  padding: 16px 24px;
  background: var(--vp-c-bg);
  border-top: 1px solid var(--vp-c-divider);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-bar {
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-1);
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ccc;
  transition: background 0.3s;
}
.status-dot.active { background: #4CAF50; }

.action-btn {
  padding: 6px 16px;
  border-radius: 6px;
  background: var(--vp-c-brand);
  color: white;
  font-weight: 600;
  font-size: 13px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 140px;
}
.action-btn:hover { opacity: 0.9; transform: translateY(-1px); }
.action-btn:disabled { background: var(--vp-c-gray-3); cursor: not-allowed; transform: none; }

/* === 动画核心逻辑 === */

.runner {
  offset-rotate: auto;
  transition: opacity 0.3s;
}

/* 🐢 乌龟路径定义 */
/* Phase 1: 直线 -> 弧线到 Meet */
.turtle.status-0 { offset-path: path("M 20 100 L 20 100"); offset-distance: 0%; }
.turtle.status-1 {
  offset-path: path("M 20 100 L 140 100 A 60 60 0 1 1 235 149");
  animation: runP1 3s linear forwards;
}
.turtle.status-2 {
  offset-path: path("M 20 100 L 140 100 A 60 60 0 1 1 235 149");
  offset-distance: 100%;
}
/* Reset: 瞬移回 Head */
.turtle.status-3 {
  offset-path: path("M 20 100 L 140 100");
  offset-distance: 0%;
  transition: offset-distance 0s; /* 瞬移 */
  opacity: 1;
}
/* Phase 2: 再走直线到达 Entry */
.turtle.status-4 {
  offset-path: path("M 20 100 L 140 100");
  animation: runP2 3s linear forwards;
}
.turtle.status-5 {
  offset-path: path("M 20 100 L 140 100");
  offset-distance: 100%;
}

/* 🐇 兔子路径定义 */
/* Phase 1: 直线 -> 绕圈 -> 到 Meet (路径需长于乌龟) */
.rabbit.status-0 { offset-path: path("M 20 100 L 20 100"); offset-distance: 0%; }
.rabbit.status-1 {
  /* 修复版：将一整圈拆分为两个半圆 (Entry -> FarSide -> Entry)，避免浏览器忽略路径 */
  /* 1. 直线: 20,100 -> 140,100 */
  /* 2. 半圆1: 140,100 -> 260,100 (绕过圆心 200,100) */
  /* 3. 半圆2: 260,100 -> 140,100 (回到入口) */
  /* 4. 追击段: 140,100 -> 235,149 (到达 Meet) */
  offset-path: path("M 20 100 L 140 100 A 60 60 0 1 1 260 100 A 60 60 0 1 1 140 100 A 60 60 0 1 1 235 149");
  animation: runP1 3s linear forwards;
}
.rabbit.status-2 {
  offset-path: path("M 20 100 L 140 100 A 60 60 0 1 1 140 100 A 60 60 0 1 1 235 149");
  offset-distance: 100%;
}
/* Reset: 兔子原地不动 */
.rabbit.status-3 {
  /* 路径切换为 Phase 2 的起点 (Meet点) */
  offset-path: path("M 235 149 A 60 60 0 0 1 140 100");
  offset-distance: 0%;
}
/* Phase 2: 从 Meet 走到 Entry (c段) */
.rabbit.status-4 {
  offset-path: path("M 235 149 A 60 60 0 0 1 140 100");
  animation: runP2 3s linear forwards;
}
.rabbit.status-5 {
  offset-path: path("M 235 149 A 60 60 0 0 1 140 100");
  offset-distance: 100%;
}

@keyframes runP1 {
  0% { offset-distance: 0%; }
  100% { offset-distance: 100%; }
}

@keyframes runP2 {
  0% { offset-distance: 0%; }
  100% { offset-distance: 100%; }
}

/* 高亮线动画 */
.highlight-path {
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  animation: drawLine 3s forwards;
}

@keyframes drawLine {
  to { stroke-dashoffset: 0; }
}
</style>