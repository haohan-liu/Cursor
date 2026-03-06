<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 md:p-6">
    <div class="max-w-7xl mx-auto">
      <!-- 顶部标题栏 -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold text-white">数据看板</h1>
          <p class="text-slate-400">Inventory Dashboard</p>
        </div>
        
        <!-- 导出按钮 -->
        <button
          @click="exportToExcel"
          :disabled="isExporting"
          class="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-600 text-white rounded-xl font-medium transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/30 active:scale-95"
        >
          <svg v-if="!isExporting" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <svg v-else class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{{ isExporting ? '导出中...' : '导出Excel' }}</span>
        </button>
      </div>

      <!-- 1. 顶部核心数据卡片 -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
        <!-- 今日发货总量 -->
        <div class="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-5 border border-slate-700/50 hover:border-amber-500/50 transition-all duration-300 group">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-slate-400 text-sm mb-1">今日发货总量</p>
              <p class="text-3xl font-bold text-white group-hover:text-amber-400 transition-colors">
                {{ formatNumber(stats.todayQuantity) }}
                <span class="text-lg text-slate-500 font-normal">件</span>
              </p>
            </div>
            <div class="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </div>
          </div>
          <div class="mt-3 flex items-center gap-1 text-sm">
            <span :class="stats.todayQuantityTrend >= 0 ? 'text-emerald-400' : 'text-red-400'">
              {{ stats.todayQuantityTrend >= 0 ? '↑' : '↓' }} {{ Math.abs(stats.todayQuantityTrend) }}%
            </span>
            <span class="text-slate-500">较昨日</span>
          </div>
        </div>

        <!-- 今日发货成本 -->
        <div class="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-5 border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-300 group">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-slate-400 text-sm mb-1">今日发货成本</p>
              <p class="text-3xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                ¥{{ formatMoney(stats.todayCost) }}
              </p>
            </div>
            <div class="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div class="mt-3 flex items-center gap-1 text-sm">
            <span :class="stats.todayCostTrend >= 0 ? 'text-emerald-400' : 'text-red-400'">
              {{ stats.todayCostTrend >= 0 ? '↑' : '↓' }} {{ Math.abs(stats.todayCostTrend) }}%
            </span>
            <span class="text-slate-500">较昨日</span>
          </div>
        </div>

        <!-- 本月发货总量 -->
        <div class="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-5 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 group">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-slate-400 text-sm mb-1">本月发货总量</p>
              <p class="text-3xl font-bold text-white group-hover:text-blue-400 transition-colors">
                {{ formatNumber(stats.monthQuantity) }}
                <span class="text-lg text-slate-500 font-normal">件</span>
              </p>
            </div>
            <div class="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <div class="mt-3 text-sm text-slate-500">
            <span>{{ currentMonth }}</span>
          </div>
        </div>

        <!-- 本月发货成本 -->
        <div class="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-5 border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 group">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-slate-400 text-sm mb-1">本月发货成本</p>
              <p class="text-3xl font-bold text-white group-hover:text-purple-400 transition-colors">
                ¥{{ formatMoney(stats.monthCost) }}
              </p>
            </div>
            <div class="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div class="mt-3 text-sm text-slate-500">
            <span>月环比 {{ stats.monthCostTrend >= 0 ? '↑' : '↓' }} {{ Math.abs(stats.monthCostTrend) }}%</span>
          </div>
        </div>
      </div>

      <!-- 2. 缺货预警区 -->
      <div class="bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-700/50 mb-6 overflow-hidden">
        <div class="p-4 border-b border-slate-700/50 flex items-center gap-3">
          <div class="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h2 class="text-lg font-bold text-white">缺货预警</h2>
            <p class="text-slate-400 text-sm">库存低于安全库存，需要补货</p>
          </div>
          <span class="ml-auto px-3 py-1 bg-red-500/20 text-red-400 text-sm font-medium rounded-full">
            {{ lowStockItems.length }} 项
          </span>
        </div>
        
        <div v-if="lowStockItems.length === 0" class="p-8 text-center">
          <svg class="w-16 h-16 mx-auto text-emerald-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-emerald-400">库存充足，无需补货</p>
        </div>
        
        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-slate-700/30">
              <tr>
                <th class="text-left text-slate-400 text-sm font-medium px-4 py-3">SKU条码</th>
                <th class="text-left text-slate-400 text-sm font-medium px-4 py-3">产品名称</th>
                <th class="text-center text-slate-400 text-sm font-medium px-4 py-3">当前库存</th>
                <th class="text-center text-slate-400 text-sm font-medium px-4 py-3">安全库存</th>
                <th class="text-center text-slate-400 text-sm font-medium px-4 py-3">状态</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-700/30">
              <tr 
                v-for="item in lowStockItems" 
                :key="item.id"
                class="hover:bg-slate-700/20 transition-colors"
              >
                <td class="px-4 py-3">
                  <span class="text-red-400 font-mono text-sm">{{ item.sku_code }}</span>
                </td>
                <td class="px-4 py-3 text-white">{{ item.name }}</td>
                <td class="px-4 py-3 text-center">
                  <span class="text-red-400 font-bold">{{ item.current_stock }}</span>
                </td>
                <td class="px-4 py-3 text-center text-slate-400">{{ item.safe_stock }}</td>
                <td class="px-4 py-3 text-center">
                  <span class="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-medium rounded">
                    缺货
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 3. 趋势图表 + 4. 成本排行 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- 近30天发货趋势 -->
        <div class="bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-4 md:p-5">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-white flex items-center gap-2">
              <svg class="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
              近30天发货趋势
            </h3>
          </div>
          <div class="h-[300px]">
            <canvas ref="trendChartRef"></canvas>
          </div>
        </div>

        <!-- 成本排行明细 -->
        <div class="bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
          <div class="p-4 border-b border-slate-700/50 flex items-center justify-between">
            <h3 class="text-lg font-bold text-white flex items-center gap-2">
              <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              本月发货 Top 10
            </h3>
          </div>
          
          <div class="overflow-x-auto max-h-[340px] overflow-y-auto">
            <table class="w-full">
              <thead class="bg-slate-700/30 sticky top-0">
                <tr>
                  <th class="text-center text-slate-400 text-sm font-medium px-3 py-2 w-12">排名</th>
                  <th class="text-left text-slate-400 text-sm font-medium px-3 py-2">产品名称</th>
                  <th class="text-center text-slate-400 text-sm font-medium px-3 py-2">发货量</th>
                  <th class="text-right text-slate-400 text-sm font-medium px-3 py-2">总成本</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-700/30">
                <tr 
                  v-for="(item, index) in topProducts" 
                  :key="item.id"
                  class="hover:bg-slate-700/20 transition-colors"
                >
                  <td class="px-3 py-3 text-center">
                    <span 
                      :class="[
                        'inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold',
                        index === 0 ? 'bg-amber-500 text-white' :
                        index === 1 ? 'bg-slate-400 text-white' :
                        index === 2 ? 'bg-amber-700 text-white' :
                        'bg-slate-700 text-slate-400'
                      ]"
                    >
                      {{ index + 1 }}
                    </span>
                  </td>
                  <td class="px-3 py-3">
                    <div class="text-white font-medium">{{ item.name }}</div>
                    <div class="text-slate-500 text-xs">{{ item.sku_code }}</div>
                  </td>
                  <td class="px-3 py-3 text-center">
                    <span class="text-blue-400 font-bold">{{ item.quantity }}</span>
                    <span class="text-slate-500 text-sm">件</span>
                  </td>
                  <td class="px-3 py-3 text-right">
                    <span class="text-purple-400 font-bold">¥{{ formatMoney(item.totalCost) }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- 底部时间 -->
      <div class="text-center text-slate-500 text-sm pb-4">
        数据更新时间: {{ lastUpdateTime }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'
import { getStats, getTrendStats, getTopProducts, getLowStockProducts } from '@/api'

// 注册 Chart.js
Chart.register(...registerables)

// ==================== 响应式状态 ====================
const trendChartRef = ref(null)
let trendChart = null
const isExporting = ref(false)
const lastUpdateTime = ref('')

// 核心统计数据
const stats = reactive({
  todayQuantity: 0,
  todayQuantityTrend: 0,
  todayCost: 0,
  todayCostTrend: 0,
  monthQuantity: 0,
  monthCost: 0,
  monthCostTrend: 0
})

// 缺货预警列表
const lowStockItems = ref([])

// Top 10 产品排行
const topProducts = ref([])

// 近30天趋势数据
const trendData = reactive({
  labels: [],
  data: []
})

// ==================== 数据加载 ====================
async function loadData() {
  try {
    // 1. 核心统计
    const statsRes = await getStats()
    if (statsRes.success) {
      const s = statsRes.data
      stats.todayQuantity = s.todayQuantity
      stats.todayQuantityTrend = s.todayQuantityTrend
      stats.todayCost = s.todayCost
      stats.todayCostTrend = s.todayCostTrend
      stats.monthQuantity = s.monthQuantity
      stats.monthCost = s.monthCost
      stats.monthCostTrend = s.monthCostTrend
    }

    // 2. 缺货预警
    const lowStockRes = await getLowStockProducts()
    if (lowStockRes.success) {
      lowStockItems.value = lowStockRes.data
    }

    // 3. Top 10 产品
    const topRes = await getTopProducts()
    if (topRes.success) {
      topProducts.value = topRes.data
    }

    // 4. 近30天趋势
    const trendRes = await getTrendStats()
    if (trendRes.success) {
      trendData.labels = trendRes.data.map(d => d.date)
      trendData.data = trendRes.data.map(d => d.quantity)
    }
  } catch (error) {
    console.error('加载数据失败:', error)
  }
}

// ==================== 图表初始化 ====================
function initTrendChart() {
  if (!trendChartRef.value) return
  
  const ctx = trendChartRef.value.getContext('2d')
  
  // 创建渐变背景
  const gradient = ctx.createLinearGradient(0, 0, 0, 300)
  gradient.addColorStop(0, 'rgba(251, 191, 36, 0.3)')
  gradient.addColorStop(1, 'rgba(251, 191, 36, 0)')
  
  trendChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: trendData.labels,
      datasets: [{
        label: '发货量',
        data: trendData.data,
        backgroundColor: gradient,
        borderColor: 'rgba(251, 191, 36, 1)',
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          titleColor: '#fff',
          bodyColor: '#94a3b8',
          borderColor: 'rgba(71, 85, 105, 0.5)',
          borderWidth: 1,
          padding: 12,
          displayColors: false,
          callbacks: {
            label: function(context) {
              return `发货量: ${context.raw} 件`
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: '#64748b',
            font: {
              size: 10
            },
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 10
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(71, 85, 105, 0.2)'
          },
          ticks: {
            color: '#64748b',
            font: {
              size: 11
            },
            callback: function(value) {
              return value + ' 件'
            }
          }
        }
      }
    }
  })
}

// ==================== Excel 导出功能 ====================
async function exportToExcel() {
  isExporting.value = true
  
  try {
    // 模拟导出延迟
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // 创建工作簿
    const workbook = {
      sheets: [
        {
          name: '核心统计',
          headers: ['指标', '数值', '趋势'],
          rows: [
            ['今日发货总量', `${stats.todayQuantity} 件`, `↑${stats.todayQuantityTrend}%`],
            ['今日发货成本', `¥${formatMoney(stats.todayCost)}`, `↑${stats.todayCostTrend}%`],
            ['本月发货总量', `${stats.monthQuantity} 件`, ''],
            ['本月发货成本', `¥${formatMoney(stats.monthCost)}`, `${stats.monthCostTrend >= 0 ? '↑' : '↓'}${Math.abs(stats.monthCostTrend)}%`]
          ]
        },
        {
          name: '缺货预警',
          headers: ['SKU条码', '产品名称', '当前库存', '安全库存', '状态'],
          rows: lowStockItems.value.map(item => [
            item.sku_code,
            item.name,
            item.current_stock,
            item.safe_stock,
            '缺货'
          ])
        },
        {
          name: '发货排行',
          headers: ['排名', 'SKU条码', '产品名称', '发货量', '总成本'],
          rows: topProducts.value.map((item, index) => [
            index + 1,
            item.sku_code,
            item.name,
            item.quantity,
            `¥${formatMoney(item.totalCost)}`
          ])
        }
      ]
    }
    
    // 生成 CSV（兼容 Excel）
    let csvContent = '\uFEFF' // BOM for UTF-8
    
    workbook.sheets.forEach((sheet, sheetIndex) => {
      if (sheetIndex > 0) csvContent += '\n\n'
      csvContent += sheet.name + '\n'
      csvContent += sheet.headers.join('\t') + '\n'
      sheet.rows.forEach(row => {
        csvContent += row.join('\t') + '\n'
      })
    })
    
    // 下载文件
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const fileName = `库存数据报表_${new Date().toISOString().split('T')[0]}.csv`
    
    link.href = URL.createObjectURL(blob)
    link.download = fileName
    link.click()
    URL.revokeObjectURL(link.href)
    
    alert('导出成功！')
  } catch (error) {
    console.error('导出失败:', error)
    alert('导出失败，请重试')
  } finally {
    isExporting.value = false
  }
}

// ==================== 工具函数 ====================
function formatNumber(num) {
  return new Intl.NumberFormat('zh-CN').format(num)
}

function formatMoney(num) {
  return new Intl.NumberFormat('zh-CN', { minimumFractionDigits: 2 }).format(num)
}

function getCurrentMonth() {
  const now = new Date()
  return now.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })
}

const currentMonth = getCurrentMonth()

// ==================== 生命周期 ====================
onMounted(async () => {
  // 加载数据
  await loadData()
  
  // 更新时间
  lastUpdateTime.value = new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
  
  // 初始化图表
  nextTick(() => {
    initTrendChart()
  })
})
</script>

<style scoped>
/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(30, 41, 59, 0.5);
}

::-webkit-scrollbar-thumb {
  background: rgba(71, 85, 105, 0.5);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(100, 116, 139, 0.5);
}

/* 表格悬停效果 */
tbody tr:hover {
  background-color: rgba(51, 65, 85, 0.3);
}
</style>
