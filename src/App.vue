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
      class="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t transition-colors duration-300
             bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-gray-200 dark:border-slate-800"
      style="padding-bottom: env(safe-area-inset-bottom)"
    >
      <div class="flex justify-around items-stretch h-16">
        <button
          v-for="tab in mobileTabs"
          :key="tab.key"
          @click="currentTab = tab.key"
          class="flex-1 flex flex-col items-center justify-center py-2 transition-transform active:scale-95 outline-none"
          :class="currentTab === tab.key ? 'text-amber-500' : 'text-slate-400'"
        >
          <span class="text-xl leading-none">{{ tab.icon }}</span>
          <span class="text-[10px] mt-1 font-medium leading-none">{{ tab.label }}</span>
        </button>
      </div>
    </nav>

  </div>

  <!-- 全局 Toast + Confirm -->
  <AppToast />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Dashboard       from './components/Dashboard.vue'
import ScanStation     from './components/ScanStation.vue'
import InventoryManage from './components/InventoryManage.vue'
import WarehouseMap    from './components/WarehouseMap.vue'
import AppToast        from './components/AppToast.vue'

const currentTab = ref('Dashboard')

const components = { Dashboard, ScanStation, InventoryManage, WarehouseMap }
const currentComponent = computed(() => components[currentTab.value])

// 移动端底部导航配置
const mobileTabs = [
  { key: 'Dashboard',       icon: '📊', label: '看板'   },
  { key: 'ScanStation',     icon: '🔫', label: '扫码'   },
  { key: 'InventoryManage', icon: '📦', label: '库存'   },
  { key: 'WarehouseMap',    icon: '🗺️', label: '地图'   },
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

onMounted(() => {
  const saved      = localStorage.getItem('theme')
  const preferDark = saved ? saved === 'dark' : true
  applyTheme(preferDark)
})
</script>
