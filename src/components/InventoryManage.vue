<template>
  <div class="min-h-screen p-4 md:p-6 space-y-6">
    <div class="max-w-7xl mx-auto bg-slate-800/80 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-slate-700/50 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <div>
          <h1 class="text-xl md:text-2xl font-bold text-white">入库与库存管理</h1>
          <p class="text-slate-400 text-sm">Inventory Management</p>
        </div>
      </div>
      <button class="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
        手动新增产品
      </button>
    </div>

    <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-1 bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-slate-700/50 h-fit sticky top-24">
        <h2 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <svg class="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
          极速扫码入库
        </h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-400 mb-1">商品条码 (自动获取焦点)</label>
            <input 
              v-model="scanInput"
              @keydown.enter="handleScanIn"
              type="text" 
              placeholder="请使用扫码枪扫描..." 
              class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
              autofocus
            >
          </div>
          <div v-if="scannedProduct" class="p-4 bg-slate-700/30 rounded-xl border border-slate-600 space-y-3">
            <div class="text-emerald-400 text-sm font-bold">✓ 识别成功：{{ scannedProduct.name }}</div>
            <div class="flex gap-4">
              <div class="flex-1">
                <label class="block text-xs text-slate-400 mb-1">入库数量</label>
                <input type="number" value="10" class="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white">
              </div>
              <div class="flex-1">
                <label class="block text-xs text-slate-400 mb-1">成本价(元)</label>
                <input type="number" :value="scannedProduct.cost" class="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white">
              </div>
            </div>
            <button class="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold transition-colors">
              确认入库
            </button>
          </div>
        </div>
      </div>

      <div class="lg:col-span-2 bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-700/50 overflow-hidden flex flex-col">
        <div class="p-4 border-b border-slate-700/50 flex flex-wrap items-center justify-between gap-4">
          <h2 class="text-lg font-bold text-white">当前库存明细</h2>
          <div class="relative">
            <input type="text" placeholder="搜索产品名称或条码..." class="pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:ring-1 focus:ring-blue-500 outline-none w-64">
            <svg class="w-4 h-4 text-slate-500 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
        </div>
        
        <div class="overflow-x-auto flex-1">
          <table class="w-full text-left border-collapse">
            <thead class="bg-slate-900/50 text-slate-400 text-sm">
              <tr>
                <th class="p-4 font-medium">产品信息</th>
                <th class="p-4 font-medium">库位号</th>
                <th class="p-4 font-medium text-right">成本价</th>
                <th class="p-4 font-medium text-center">当前库存</th>
                <th class="p-4 font-medium text-center">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-700/50 text-sm">
              <tr v-for="item in mockInventory" :key="item.id" class="hover:bg-slate-700/20 transition-colors">
                <td class="p-4">
                  <div class="text-white font-medium">{{ item.name }}</div>
                  <div class="text-slate-500 text-xs mt-1">{{ item.sku }} | {{ item.attributes }}</div>
                </td>
                <td class="p-4">
                  <span class="px-2 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded font-mono text-xs">{{ item.location }}</span>
                </td>
                <td class="p-4 text-right text-slate-300">¥{{ item.cost }}</td>
                <td class="p-4 text-center">
                  <span :class="item.stock < 5 ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'">{{ item.stock }}</span>
                </td>
                <td class="p-4 text-center">
                  <button class="text-blue-400 hover:text-blue-300 mr-3">编辑</button>
                  <button class="text-red-400 hover:text-red-300">删除</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const scanInput = ref('')
const scannedProduct = ref(null)

// 模拟的库存数据 (临时展示用)
const mockInventory = ref([
  { id: 1, sku: 'SKU-A001', name: '路虎旋钮-黑钻', attributes: '螺纹:12mm', cost: '55.00', stock: 15, location: 'A-01-01' },
  { id: 2, sku: 'SKU-A002', name: '手动挡-水晶标', attributes: 'LOGO:雷克萨斯', cost: '80.00', stock: 3, location: 'A-01-03' },
  { id: 3, sku: 'SKU-A003', name: '奥迪盖子-发光', attributes: '螺纹:10mm', cost: '60.00', stock: 28, location: 'B-02-01' },
  { id: 4, sku: 'SKU-A004', name: '奔驰旋钮-原厂', attributes: '颜色:黑钛色', cost: '36.00', stock: 4, location: 'B-03-04' },
])

// 模拟扫码回车事件
function handleScanIn() {
  if (!scanInput.value) return
  // 假装从后端查到了数据
  scannedProduct.value = { name: '模拟识别出的产品', cost: '55.00' }
  scanInput.value = ''
}
</script>