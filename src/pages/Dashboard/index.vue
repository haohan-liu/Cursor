<template>
  <!-- 骨架屏加载状态 -->
  <div v-if="isLoading" class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800 p-4 md:p-6">
    <div class="max-w-7xl mx-auto">
      <!-- 标题骨架 -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div class="skeleton h-12 w-48"></div>
        <div class="skeleton h-10 w-32"></div>
      </div>

      <!-- 统计卡片骨架 -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
        <div v-for="i in 4" :key="i" class="skeleton h-28 rounded-2xl"></div>
      </div>
      
      <!-- 第二行统计骨架 -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
        <div v-for="i in 4" :key="'b'+i" class="skeleton h-28 rounded-2xl"></div>
      </div>

      <!-- 缺货预警骨架 -->
      <div class="skeleton h-64 rounded-2xl mb-6"></div>

      <!-- 图表和排行骨架 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="skeleton h-[400px] rounded-2xl"></div>
        <div class="skeleton h-[400px] rounded-2xl"></div>
      </div>
    </div>
  </div>

  <!-- 正常内容 -->
  <div v-else class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800 p-4 md:p-6 transition-colors duration-300 pb-24 md:pb-6">
    <div class="max-w-7xl mx-auto">
      <!-- 顶部标题栏 -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">数据看板</h1>
          <p class="text-gray-500 dark:text-slate-400 text-sm">Inventory Dashboard</p>
        </div>

        <div class="flex items-center gap-3 w-full sm:w-auto">
          <button
            @click="toggleTheme"
            class="p-2 md:p-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center"
          >
            <svg v-if="!isDark" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          </button>

          <button
            @click="exportToExcel"
            :disabled="isExporting"
            class="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 md:py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 dark:disabled:bg-slate-600 text-white rounded-xl font-medium transition-all duration-200 shadow-sm active:scale-95"
          >
            <svg v-if="!isExporting" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            <svg v-else class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <span class="whitespace-nowrap">{{ isExporting ? '导出中...' : '导出Excel' }}</span>
          </button>
        </div>
      </div>

      <!-- 1. 大屏核心数据卡片 -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6">
        <!-- 总库存 -->
        <div class="bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-3 md:p-5 border border-gray-200 dark:border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300 group shadow-sm dark:shadow-none">
          <!-- 顶部：标题在左，图标在右 -->
          <div class="flex items-center justify-between mb-2 md:mb-3">
            <p class="text-xs md:text-sm text-gray-500 dark:text-slate-400">总库存</p>
            <div class="w-9 h-9 md:w-12 md:h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg class="w-4 h-4 md:w-6 md:h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
          <!-- 底部：数值独占一行 -->
          <p class="text-lg md:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-cyan-400 transition-colors truncate">
            {{ formatNumber(dashboardStats.totalStock) }}
            <span class="text-xs md:text-lg text-gray-400 dark:text-slate-500 font-normal">件</span>
          </p>
        </div>

        <!-- 总资产 -->
        <div class="bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-3 md:p-5 border border-gray-200 dark:border-slate-700/50 hover:border-yellow-500/50 transition-all duration-300 group shadow-sm dark:shadow-none">
          <!-- 顶部：标题在左，图标在右 -->
          <div class="flex items-center justify-between mb-2 md:mb-3">
            <p class="text-xs md:text-sm text-gray-500 dark:text-slate-400">总资产</p>
            <div class="w-9 h-9 md:w-12 md:h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg class="w-4 h-4 md:w-6 md:h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <!-- 底部：数值独占一行 -->
          <p class="text-lg md:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-yellow-400 transition-colors truncate">
            ¥{{ formatMoney(dashboardStats.totalAsset) }}
          </p>
        </div>

        <!-- 本月入库 -->
        <div class="bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-3 md:p-5 border border-gray-200 dark:border-slate-700/50 hover:border-green-500/50 transition-all duration-300 group shadow-sm dark:shadow-none">
          <!-- 顶部：标题在左，图标在右 -->
          <div class="flex items-center justify-between mb-2 md:mb-3">
            <p class="text-xs md:text-sm text-gray-500 dark:text-slate-400">本月入库</p>
            <div class="w-9 h-9 md:w-12 md:h-12 bg-green-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg class="w-4 h-4 md:w-6 md:h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </div>
          </div>
          <!-- 底部：数值独占一行 -->
          <p class="text-lg md:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-green-400 transition-colors truncate">
            {{ formatNumber(dashboardStats.monthIn) }}
            <span class="text-xs md:text-lg text-gray-400 dark:text-slate-500 font-normal">件</span>
          </p>
        </div>

        <!-- 本月出库 -->
        <div class="bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-3 md:p-5 border border-gray-200 dark:border-slate-700/50 hover:border-orange-500/50 transition-all duration-300 group shadow-sm dark:shadow-none">
          <!-- 顶部：标题在左，图标在右 -->
          <div class="flex items-center justify-between mb-2 md:mb-3">
            <p class="text-xs md:text-sm text-gray-500 dark:text-slate-400">本月出库</p>
            <div class="w-9 h-9 md:w-12 md:h-12 bg-orange-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg class="w-4 h-4 md:w-6 md:h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16v2a2 2 0 01-2 2H7a2 2 0 01-2-2v-2m4-4V6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8m-6 4l-4-4" />
              </svg>
            </div>
          </div>
          <!-- 底部：数值独占一行 -->
          <p class="text-lg md:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-orange-400 transition-colors truncate">
            {{ formatNumber(dashboardStats.monthOut) }}
            <span class="text-xs md:text-lg text-gray-400 dark:text-slate-500 font-normal">件</span>
          </p>
        </div>
      </div>

      <!-- 2. 今日/本月发货统计 -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6">
        <!-- 今日发货总量 -->
        <div class="bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-3 md:p-5 border border-gray-200 dark:border-slate-700/50 hover:border-amber-500/50 transition-all duration-300 group shadow-sm dark:shadow-none">
          <!-- 顶部：标题在左，图标在右 -->
          <div class="flex items-center justify-between mb-2 md:mb-3">
            <p class="text-xs md:text-sm text-gray-500 dark:text-slate-400">今日发货总量</p>
            <div class="w-9 h-9 md:w-12 md:h-12 bg-amber-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg class="w-4 h-4 md:w-6 md:h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </div>
          </div>
          <!-- 底部：数值独占一行 -->
          <p class="text-lg md:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-amber-400 transition-colors truncate">
            {{ formatNumber(stats.todayQuantity) }}
            <span class="text-xs md:text-lg text-gray-400 dark:text-slate-500 font-normal">件</span>
          </p>
          <!-- 趋势 -->
          <div class="mt-2 md:mt-3 flex items-center gap-1 text-xs md:text-sm">
            <template v-if="stats.todayQuantityTrend > 0">
              <svg class="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              <span class="text-emerald-400 font-medium">+{{ stats.todayQuantityTrend }}%</span>
              <span class="text-gray-400 dark:text-slate-500">较昨日</span>
            </template>
            <template v-else-if="stats.todayQuantityTrend < 0">
              <svg class="w-3 h-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
              <span class="text-red-400 font-medium">{{ stats.todayQuantityTrend }}%</span>
              <span class="text-gray-400 dark:text-slate-500">较昨日</span>
            </template>
            <template v-else>
              <span class="text-gray-400 dark:text-slate-500">与昨日持平</span>
            </template>
          </div>
        </div>

        <!-- 今日发货成本 -->
        <div class="bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-3 md:p-5 border border-gray-200 dark:border-slate-700/50 hover:border-emerald-500/50 transition-all duration-300 group shadow-sm dark:shadow-none">
          <!-- 顶部：标题在左，图标在右 -->
          <div class="flex items-center justify-between mb-2 md:mb-3">
            <p class="text-xs md:text-sm text-gray-500 dark:text-slate-400">今日发货成本</p>
            <div class="w-9 h-9 md:w-12 md:h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg class="w-4 h-4 md:w-6 md:h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <!-- 底部：数值独占一行 -->
          <p class="text-lg md:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-emerald-400 transition-colors truncate">
            ¥{{ formatMoney(stats.todayCost) }}
          </p>
          <!-- 趋势 -->
          <div class="mt-2 md:mt-3 flex items-center gap-1 text-xs md:text-sm">
            <template v-if="stats.todayCostTrend > 0">
              <svg class="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              <span class="text-emerald-400 font-medium">+{{ stats.todayCostTrend }}%</span>
              <span class="text-gray-400 dark:text-slate-500">较昨日</span>
            </template>
            <template v-else-if="stats.todayCostTrend < 0">
              <svg class="w-3 h-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
              <span class="text-red-400 font-medium">{{ stats.todayCostTrend }}%</span>
              <span class="text-gray-400 dark:text-slate-500">较昨日</span>
            </template>
            <template v-else>
              <span class="text-gray-400 dark:text-slate-500">与昨日持平</span>
            </template>
          </div>
        </div>

        <!-- 本月发货总量 -->
        <div class="bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-3 md:p-5 border border-gray-200 dark:border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 group shadow-sm dark:shadow-none">
          <!-- 顶部：标题在左，图标在右 -->
          <div class="flex items-center justify-between mb-2 md:mb-3">
            <p class="text-xs md:text-sm text-gray-500 dark:text-slate-400">本月发货总量</p>
            <div class="w-9 h-9 md:w-12 md:h-12 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg class="w-4 h-4 md:w-6 md:h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <!-- 底部：数值独占一行 -->
          <p class="text-lg md:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-blue-400 transition-colors truncate">
            {{ formatNumber(stats.monthQuantity) }}
            <span class="text-xs md:text-lg text-gray-400 dark:text-slate-500 font-normal">件</span>
          </p>
          <div class="mt-2 md:mt-3 text-xs md:text-sm text-gray-400 dark:text-slate-500">
            <span>{{ currentMonth }}</span>
          </div>
        </div>

        <!-- 本月发货成本 -->
        <div class="bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-3 md:p-5 border border-gray-200 dark:border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 group shadow-sm dark:shadow-none">
          <!-- 顶部：标题在左，图标在右 -->
          <div class="flex items-center justify-between mb-2 md:mb-3">
            <p class="text-xs md:text-sm text-gray-500 dark:text-slate-400">本月发货成本</p>
            <div class="w-9 h-9 md:w-12 md:h-12 bg-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg class="w-4 h-4 md:w-6 md:h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <!-- 底部：数值独占一行 -->
          <p class="text-lg md:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-purple-400 transition-colors truncate">
            ¥{{ formatMoney(stats.monthCost) }}
          </p>
          <div class="mt-2 md:mt-3 text-xs md:text-sm">
            <template v-if="stats.monthCostTrend > 0">
              <span class="text-emerald-400 font-medium">↑ +{{ stats.monthCostTrend }}%</span>
              <span class="text-gray-400 dark:text-slate-500"> 月环比</span>
            </template>
            <template v-else-if="stats.monthCostTrend < 0">
              <span class="text-red-400 font-medium">↓ {{ stats.monthCostTrend }}%</span>
              <span class="text-gray-400 dark:text-slate-500"> 月环比</span>
            </template>
            <template v-else>
              <span class="text-gray-400 dark:text-slate-500">月环比持平</span>
            </template>
          </div>
        </div>
      </div>

      <!-- 2. 缺货预警区 -->
      <div class="bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-slate-700/50 mb-6 overflow-hidden shadow-sm dark:shadow-none">
        <div class="p-3 md:p-4 border-b border-gray-200 dark:border-slate-700/50 flex items-center gap-3 flex-nowrap overflow-x-auto">
          <div class="w-9 h-9 md:w-10 md:h-10 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg class="w-4 h-4 md:w-5 md:h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div class="flex-shrink-0 min-w-0">
            <h2 class="text-base md:text-lg font-bold text-gray-900 dark:text-white whitespace-nowrap">缺货预警</h2>
            <p class="text-xs md:text-sm text-gray-500 dark:text-slate-400 whitespace-nowrap">库存低于安全库存，需要补货</p>
          </div>
          <span class="ml-auto flex-shrink-0 px-2.5 py-1 md:px-3 md:py-1 bg-red-500/20 text-red-400 text-xs md:text-sm font-medium rounded-full whitespace-nowrap">
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
            <thead class="bg-gray-50 dark:bg-slate-700/30">
              <tr>
                <th class="whitespace-nowrap text-left text-gray-500 dark:text-slate-400 text-sm font-medium px-4 py-3">SKU条码</th>
                <th class="whitespace-nowrap text-left text-gray-500 dark:text-slate-400 text-sm font-medium px-4 py-3">产品名称</th>
                <th class="whitespace-nowrap text-center text-gray-500 dark:text-slate-400 text-sm font-medium px-4 py-3">当前库存</th>
                <th class="whitespace-nowrap text-center text-gray-500 dark:text-slate-400 text-sm font-medium px-4 py-3">安全库存</th>
                <th class="whitespace-nowrap text-center text-gray-500 dark:text-slate-400 text-sm font-medium px-4 py-3">状态</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-slate-700/30">
              <tr 
                v-for="item in lowStockItems" 
                :key="item.id"
                class="hover:bg-gray-50 dark:hover:bg-slate-700/20 transition-colors"
              >
                <td class="whitespace-nowrap px-4 py-3">
                  <span class="text-red-400 font-mono text-sm">{{ item.sku_code }}</span>
                </td>
                <td class="whitespace-nowrap px-4 py-3 text-gray-900 dark:text-white">{{ item.name }}</td>
                <td class="whitespace-nowrap px-4 py-3 text-center">
                  <span class="text-red-400 font-bold">{{ item.current_stock }}</span>
                </td>
                <td class="whitespace-nowrap px-4 py-3 text-center text-gray-500 dark:text-slate-400">{{ item.safe_stock }}</td>
                <td class="whitespace-nowrap px-4 py-3 text-center">
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
        <div class="bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-slate-700/50 p-4 md:p-5 shadow-sm dark:shadow-none">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
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

        <!-- 近30天发货排名 -->
        <div class="bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-slate-700/50 overflow-hidden shadow-sm dark:shadow-none">
          <div class="p-4 border-b border-gray-200 dark:border-slate-700/50 flex items-center justify-between">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              近30天发货排名
            </h3>
            <span class="text-xs text-gray-400 dark:text-slate-500">{{ topProducts.length }} 条记录</span>
          </div>
          
          <div class="overflow-x-auto max-h-[340px] overflow-y-auto">
            <table class="w-full">
              <thead class="bg-gray-50 dark:bg-slate-700/30 sticky top-0">
                <tr>
                  <th class="text-center text-gray-500 dark:text-slate-400 text-sm font-medium px-3 py-2 w-12">排名</th>
                  <th class="text-left text-gray-500 dark:text-slate-400 text-sm font-medium px-3 py-2">产品名称</th>
                  <th class="text-center text-gray-500 dark:text-slate-400 text-sm font-medium px-3 py-2">发货量</th>
                  <th class="text-right text-gray-500 dark:text-slate-400 text-sm font-medium px-3 py-2">总成本</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-slate-700/30">
                <tr
                  v-for="(item, index) in topProducts"
                  :key="item.id"
                  class="hover:bg-gray-50 dark:hover:bg-slate-700/20 transition-colors"
                >
                  <!-- 排名 -->
                  <td class="px-3 py-3 text-center whitespace-nowrap">
                    <span
                      :class="[
                        'inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold',
                        index === 0 ? 'bg-amber-500 text-white' :
                        index === 1 ? 'bg-slate-400 text-white' :
                        index === 2 ? 'bg-amber-700 text-white' :
                        'bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-slate-400'
                      ]"
                    >{{ index + 1 }}</span>
                  </td>
                  <!-- 产品名称 + 大类 + 规格标签 -->
                  <td class="px-3 py-2.5">
                    <div class="flex items-center gap-1.5 flex-wrap">
                      <span class="text-gray-900 dark:text-white font-medium text-sm">{{ item.name }}</span>
                      <span
                        v-if="item.category"
                        class="px-1.5 py-0.5 bg-indigo-500/15 text-indigo-500 dark:text-indigo-400 border border-indigo-500/20 rounded text-[10px] font-medium whitespace-nowrap"
                      >{{ item.category }}</span>
                    </div>
                    <div class="text-gray-400 dark:text-slate-500 text-[10px] font-mono mt-0.5">{{ item.sku_code }}</div>
                    <!-- attributes 规格标签 -->
                    <div v-if="dashboardParseAttrs(item.attributes).length" class="flex flex-wrap gap-1 mt-1">
                      <span
                        v-for="(tag, ti) in dashboardParseAttrs(item.attributes)"
                        :key="ti"
                        class="inline-flex items-center px-1.5 py-0.5 bg-gray-100 dark:bg-slate-700/60 text-gray-500 dark:text-slate-400 border border-gray-200 dark:border-slate-600/50 rounded text-[9px] whitespace-nowrap"
                      >{{ tag.key }}: {{ tag.val }}</span>
                    </div>
                  </td>
                  <!-- 发货量 -->
                  <td class="px-3 py-3 text-center whitespace-nowrap">
                    <span class="text-blue-400 font-bold">{{ item.quantity }}</span>
                    <span class="text-gray-400 dark:text-slate-500 text-sm"> 件</span>
                  </td>
                  <!-- 总成本 -->
                  <td class="px-3 py-3 text-right whitespace-nowrap">
                    <span class="text-purple-400 font-bold">¥{{ formatMoney(item.totalCost) }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- 底部时间 -->
      <div class="flex justify-center pb-4">
        <p class="text-gray-400 dark:text-slate-500 text-xs md:text-sm">
          数据更新时间: <span class="text-gray-500 dark:text-slate-400 font-medium">{{ lastUpdateTime }}</span>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, getCurrentInstance } from 'vue'
import { Chart, registerables } from 'chart.js'
import * as XLSX from 'xlsx'
import { getDashboardStats, getStats, getTrendStats, getTopProducts, getLowStockProducts, exportLogs } from '@/apis'
import { toast } from '@/composables/useToast'

// 注册 Chart.js
Chart.register(...registerables)

// ==================== 响应式状态 ====================
const trendChartRef = ref(null)
let trendChart = null
const isExporting = ref(false)
const isLoading = ref(false) // 骨架屏状态
const lastUpdateTime = ref('')

// 主题切换
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

// 大屏统计数据
const dashboardStats = reactive({
  totalStock: 0,
  totalAsset: 0,
  monthIn: 0,
  monthOut: 0
})

// 缺货预警列表
const lowStockItems = ref([])

// Top 10 产品排行
const topProducts = ref([])

// 解析 attributes JSON 为标签数组（排行榜展示用）
function dashboardParseAttrs(raw) {
  if (!raw) return []
  let obj = raw
  if (typeof obj === 'string') {
    try { obj = JSON.parse(obj) } catch { return [] }
  }
  if (typeof obj !== 'object' || obj === null) return []
  return Object.entries(obj).map(([key, val]) => ({ key, val: String(val) }))
}

// 近30天趋势数据
const trendData = reactive({
  labels: [],
  data: []
})

// ==================== 数据加载 ====================
async function loadData() {
  try {
    // 1. 大屏统计数据（总库存、总资产、本月入库出库）
    const dashRes = await getDashboardStats()
    if (dashRes.success) {
      const d = dashRes.data
      dashboardStats.totalStock = d.totalStock
      dashboardStats.totalAsset = d.totalAsset
      dashboardStats.monthIn = d.monthIn
      dashboardStats.monthOut = d.monthOut
    }

    // 2. 核心统计（今日/本月发货）
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

    // 3. 缺货预警
    const lowStockRes = await getLowStockProducts()
    if (lowStockRes.success) {
      lowStockItems.value = lowStockRes.data
    }

    // 4. Top 10 产品
    const topRes = await getTopProducts()
    if (topRes.success) {
      topProducts.value = topRes.data
    }

    // 5. 近30天趋势
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
    // 获取出入库流水数据
    const logsRes = await exportLogs({ pageSize: 10000 })
    const logsData = logsRes.data || []

    // 创建工作簿
    const wb = XLSX.utils.book_new()

    // Sheet 1: 核心统计
    const statsData = [
      ['指标', '数值', '趋势'],
      ['今日发货总量', `${stats.todayQuantity} 件`, `↑${stats.todayQuantityTrend}%`],
      ['今日发货成本', `¥${formatMoney(stats.todayCost)}`, `↑${stats.todayCostTrend}%`],
      ['本月发货总量', `${stats.monthQuantity} 件`, ''],
      ['本月发货成本', `¥${formatMoney(stats.monthCost)}`, `${stats.monthCostTrend >= 0 ? '↑' : '↓'}${Math.abs(stats.monthCostTrend)}%`]
    ]
    const ws1 = XLSX.utils.aoa_to_sheet(statsData)
    XLSX.utils.book_append_sheet(wb, ws1, '核心统计')

    // Sheet 2: 缺货预警
    const lowStockData = [
      ['SKU条码', '产品名称', '当前库存', '安全库存', '状态']
    ]
    lowStockItems.value.forEach(item => {
      lowStockData.push([
        item.sku_code,
        item.name,
        item.current_stock,
        item.safe_stock,
        '缺货'
      ])
    })
    const ws2 = XLSX.utils.aoa_to_sheet(lowStockData)
    XLSX.utils.book_append_sheet(wb, ws2, '缺货预警')

    // Sheet 3: 发货排行
    const topData = [
      ['排名', 'SKU条码', '产品名称', '发货量', '总成本']
    ]
    topProducts.value.forEach((item, index) => {
      topData.push([
        index + 1,
        item.sku_code,
        item.name,
        item.quantity,
        `¥${formatMoney(item.totalCost)}`
      ])
    })
    const ws3 = XLSX.utils.aoa_to_sheet(topData)
    XLSX.utils.book_append_sheet(wb, ws3, '发货排行')

    // Sheet 4: 出入库流水
    if (logsData.length > 0) {
      const logsHeaders = Object.keys(logsData[0])
      const logsTable = [logsHeaders]
      logsData.forEach(item => {
        logsTable.push(logsHeaders.map(h => item[h]))
      })
      const ws4 = XLSX.utils.aoa_to_sheet(logsTable)
      XLSX.utils.book_append_sheet(wb, ws4, '出入库流水')
    }

    // 下载文件
    const date = new Date().toISOString().split('T')[0]
    XLSX.writeFile(wb, `库存数据报表_${date}.xlsx`)

    toast.success('导出成功！文件已保存到本地')
  } catch (error) {
    console.error('导出失败:', error)
    toast.error('导出失败，请重试')
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
  // 从 localStorage 读取主题（HTML 已预加载 dark class）
  const saved = localStorage.getItem('theme')
  const preferDark = saved ? saved === 'dark' : true
  applyTheme(preferDark)
  
  // 显示骨架屏
  isLoading.value = true
  
  // 加载数据
  await loadData()
  
  // 隐藏骨架屏
  isLoading.value = false
  
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
