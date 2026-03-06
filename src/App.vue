<template>
  <div class="min-h-screen bg-slate-900 flex flex-col">
    <nav class="bg-slate-800/80 backdrop-blur-md border-b border-slate-700 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex items-center gap-2 md:gap-6 h-16 overflow-x-auto">
          <div class="text-amber-500 font-bold text-lg mr-4 flex-shrink-0">水晶档把库存系统</div>
          
          <button @click="currentTab = 'Dashboard'" :class="['px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors', currentTab === 'Dashboard' ? 'bg-amber-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700/50']">📊 数据看板</button>
          <button @click="currentTab = 'ScanOut'" :class="['px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors', currentTab === 'ScanOut' ? 'bg-amber-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700/50']">🔫 扫码出库</button>
          <button @click="currentTab = 'InventoryManage'" :class="['px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors', currentTab === 'InventoryManage' ? 'bg-amber-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700/50']">📦 入库与库存</button>
          <button @click="currentTab = 'WarehouseMap'" :class="['px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors', currentTab === 'WarehouseMap' ? 'bg-amber-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700/50']">🗺️ 库位地图</button>
        </div>
      </div>
    </nav>

    <main class="flex-1 overflow-auto">
      <component :is="currentComponent" />
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Dashboard from './components/Dashboard.vue'
import ScanOut from './components/ScanOut.vue'
import InventoryManage from './components/InventoryManage.vue'
import WarehouseMap from './components/WarehouseMap.vue'

// 默认打开刚做好的"入库页面"方便你调试
const currentTab = ref('InventoryManage')

const components = {
  Dashboard,
  ScanOut,
  InventoryManage,
  WarehouseMap
}

const currentComponent = computed(() => components[currentTab.value])
</script>