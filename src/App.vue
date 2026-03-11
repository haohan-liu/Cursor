<template>
  <div class="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col transition-colors duration-300">

    <!-- ===== PC 端顶部导航栏（md 以上显示） ===== -->
    <nav class="hidden md:block bg-white/90 dark:bg-slate-800/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-700 sticky top-0 z-40 transition-colors duration-300">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex items-center gap-2 md:gap-3 h-16">
          <div class="text-amber-500 font-bold text-base mr-2 flex-shrink-0 whitespace-nowrap">水晶档把库存系统</div>

          <button @click="currentTab = 'Dashboard'"      :class="navBtnClass('Dashboard')">📊 数据看板</button>
          <button @click="currentTab = 'ScanStation'"    :class="navBtnClass('ScanStation')">🔫 扫码工作台</button>
          <button @click="currentTab = 'InventoryManage'" :class="navBtnClass('InventoryManage')">📦 入库与库存</button>
          <button @click="currentTab = 'WarehouseMap'"   :class="navBtnClass('WarehouseMap')">🗺️ 库位地图</button>

          <div class="flex-1"></div>

          <!-- 主题切换 -->
          <button
            @click="toggleTheme"
            :title="isDark ? '切换到亮色模式' : '切换到暗色模式'"
            class="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-600 dark:text-slate-300"
          >
            <svg v-if="isDark" class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <svg v-else class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </button>
        </div>
      </div>
    </nav>

    <!-- ===== 主内容区域 ===== -->
    <main class="flex-1 overflow-auto pb-20 md:pb-0">
      <component :is="currentComponent" />
    </main>

    <!-- ===== 移动端底部 Tab Bar（md 以下显示） ===== -->
    <nav
      class="md:hidden fixed bottom-0 left-0 right-0 z-50 transition-colors duration-300
             bg-white dark:bg-slate-900"
      style="padding-bottom: env(safe-area-inset-bottom)"
    >
      <!-- 顶部阴影隔离内容区 -->
      <div class="absolute top-0 left-0 right-0 h-px bg-gradient-to-b from-gray-200/60 dark:from-slate-700/60 to-transparent"></div>

      <div class="flex justify-around items-stretch h-[68px] pt-1">
        <button
          v-for="tab in mobileTabs"
          :key="tab.key"
          @click="currentTab = tab.key"
          class="flex-1 flex flex-col items-center justify-start pt-2 relative outline-none group"
          :class="currentTab === tab.key ? 'text-amber-500' : 'text-slate-400 dark:text-slate-500'"
        >
          <!-- 选中状态指示器 -->
          <div
            class="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-0.5 rounded-full transition-all duration-300"
            :class="currentTab === tab.key ? 'bg-amber-500 scale-100' : 'scale-0 group-hover:scale-50 group-hover:bg-slate-300 dark:group-hover:bg-slate-600'"
          ></div>

          <!-- 图标容器 -->
          <div
            class="w-7 h-7 flex items-center justify-center mb-1 transition-all duration-200"
            :class="currentTab === tab.key ? 'transform scale-110' : ''"
          >
            <component :is="tab.icon" class="w-6 h-6" />
          </div>

          <!-- 文字标签 -->
          <span
            class="text-[11px] font-medium leading-tight transition-all duration-200"
            :class="currentTab === tab.key ? 'text-amber-500' : 'text-slate-500 dark:text-slate-400'"
          >{{ tab.label }}</span>
        </button>
      </div>
    </nav>

  </div>

  <!-- 全局 Toast + Confirm -->
  <AppToast />
</template>

<script setup>
import { ref, computed, onMounted, h } from 'vue'
import Dashboard       from './pages/Dashboard/index.vue'
import ScanStation     from './pages/ScanStation/index.vue'
import InventoryManage from './pages/InventoryManage/index.vue'
import WarehouseMap    from './pages/WarehouseMap/index.vue'
import AppToast        from './widgets/AppToast.vue'

const currentTab = ref('Dashboard')

const components = { Dashboard, ScanStation, InventoryManage, WarehouseMap }
const currentComponent = computed(() => components[currentTab.value])

// 底部导航图标组件（使用 h 函数渲染）
const DashboardIcon = () => h('svg', {
  fill: 'none',
  stroke: 'currentColor',
  viewBox: '0 0 24 24'
}, [
  h('path', {
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'stroke-width': '2',
    d: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z'
  })
])

const ScanStationIcon = () => h('svg', {
  fill: 'none',
  stroke: 'currentColor',
  viewBox: '0 0 24 24'
}, [
  h('path', {
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'stroke-width': '2',
    d: 'M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z'
  })
])

const InventoryIcon = () => h('svg', {
  fill: 'none',
  stroke: 'currentColor',
  viewBox: '0 0 24 24'
}, [
  h('path', {
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'stroke-width': '2',
    d: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
  })
])

const MapIcon = () => h('svg', {
  fill: 'none',
  stroke: 'currentColor',
  viewBox: '0 0 24 24'
}, [
  h('path', {
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'stroke-width': '2',
    d: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7'
  })
])

// 移动端底部导航配置
const mobileTabs = [
  { key: 'Dashboard',       label: '看板', icon: DashboardIcon   },
  { key: 'ScanStation',     label: '扫码', icon: ScanStationIcon },
  { key: 'InventoryManage', label: '库存', icon: InventoryIcon    },
  { key: 'WarehouseMap',    label: '库位', icon: MapIcon          },
]

// PC 端顶部导航按钮样式
function navBtnClass(tab) {
  const base = 'px-3 py-2 rounded-lg font-medium whitespace-nowrap transition-colors text-sm'
  return currentTab.value === tab
    ? `${base} bg-amber-500 text-white`
    : `${base} text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700/50`
}

// ==================== 主题切换 ====================
const isDark = ref(false)

function applyTheme(dark) {
  isDark.value = dark
  if (dark) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
  localStorage.setItem('theme', dark ? 'dark' : 'light')
}

function toggleTheme() { applyTheme(!isDark.value) }

// 导出给子组件使用
defineExpose({ isDark, toggleTheme })

onMounted(() => {
  // 从 localStorage 读取主题（注意：HTML 中已预加载 dark class，这里仅做同步）
  const saved = localStorage.getItem('theme')
  // 如果 localStorage 有值则使用，否则默认暗色
  const preferDark = saved ? saved === 'dark' : true
  applyTheme(preferDark)
})
</script>
