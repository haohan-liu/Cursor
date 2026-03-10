<template>
  <div class="min-h-screen p-4 md:p-6 transition-colors duration-300">

    <!-- 顶部状态栏 -->
    <div class="max-w-4xl mx-auto mb-6">
      <div class="bg-white/90 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm dark:shadow-xl border border-gray-200 dark:border-slate-700/50">
        <div class="flex items-center justify-between flex-wrap gap-4">

          <!-- 左侧标题 -->
          <div class="flex items-center gap-3">
            <div
              :class="[
                'w-12 h-12 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br transition-all duration-300',
                stationMode === 'out' ? 'from-amber-500 to-orange-600' : 'from-emerald-500 to-teal-600'
              ]"
            >
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <div>
            <h1 class="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">扫码工作台</h1>
            <p class="text-gray-500 dark:text-slate-400 text-sm">Scan Station</p>
            </div>
          </div>

          <!-- 中间：出库/入库 Toggle -->
          <div class="flex items-center bg-gray-100 dark:bg-slate-700/60 rounded-xl p-1 gap-1">
            <button
              @click="switchMode('out')"
              :class="[
                'px-5 py-2 rounded-lg font-bold text-sm transition-all duration-200',
                stationMode === 'out'
                  ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                  : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
              ]"
            >
              📤 出库
            </button>
            <button
              @click="switchMode('in')"
              :class="[
                'px-5 py-2 rounded-lg font-bold text-sm transition-all duration-200',
                stationMode === 'in'
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                  : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
              ]"
            >
              📥 入库
            </button>
          </div>

          <!-- 右侧今日统计 - 移动端改为 Grid 布局 -->
          <div class="grid grid-cols-2 gap-3 md:flex md:items-center md:gap-6">
            <div class="text-center bg-gray-50 dark:bg-slate-700/40 rounded-xl p-2 md:p-0">
              <div :class="['text-xl md:text-3xl font-bold', stationMode === 'out' ? 'text-amber-400' : 'text-emerald-400']">
                {{ todayStats.totalQuantity }}
              </div>
              <div class="text-xs text-gray-500 dark:text-slate-400">今日{{ stationMode === 'out' ? '出库' : '入库' }}</div>
            </div>
            <div class="text-center bg-gray-50 dark:bg-slate-700/40 rounded-xl p-2 md:p-0">
              <div class="text-xl md:text-3xl font-bold text-blue-400">¥{{ todayStats.totalCost }}</div>
              <div class="text-xs text-gray-500 dark:text-slate-400">今日成本</div>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- 主工作区 -->
    <div class="max-w-4xl mx-auto grid gap-6">

      <!-- 扫码控制区 -->
      <div
        :class="[
          'bg-white/90 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-sm dark:shadow-xl border transition-colors duration-300',
          stationMode === 'out' ? 'border-amber-500/30' : 'border-emerald-500/30'
        ]"
      >
        <!-- 当前模式提示条 -->
        <div
          :class="[
            'mb-4 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2',
            stationMode === 'out' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'
          ]"
        >
          <span>{{ stationMode === 'out' ? '📤 出库模式 — 扫码后自动极速扣减' : '📥 入库模式 — 扫码后弹窗确认数量和成本价' }}</span>
        </div>

        <!-- 扫码设备切换 + 就绪状态 -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <!-- 扫码模式按钮组 -->
          <div class="flex gap-2">
            <!-- PC扫码枪按钮 - 移动端隐藏 -->
            <button
              v-if="!isMobileDevice"
              @click="scanMode = 'pc'"
              :class="[
                'px-4 py-2 rounded-lg font-medium transition-all duration-200',
                scanMode === 'pc'
                  ? (stationMode === 'out' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30')
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
              ]"
            >
              <span class="flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span class="hidden sm:inline">PC扫码枪</span>
              </span>
            </button>
            <!-- 手机扫码按钮 - 始终显示 -->
            <button
              @click="scanMode = 'mobile'"
              :class="[
                'px-4 py-2 rounded-lg font-medium transition-all duration-200',
                scanMode === 'mobile'
                  ? (stationMode === 'out' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30')
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
              ]"
            >
              <span class="flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span class="hidden sm:inline">手机扫码</span>
              </span>
            </button>
          </div>

          <!-- 就绪状态指示 -->
          <div class="flex items-center gap-2">
            <div :class="['w-2 h-2 rounded-full transition-colors duration-500', scannerReady ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500']"></div>
            <span :class="['text-sm', scannerReady ? 'text-emerald-400' : 'text-slate-400']">
              {{ scanMode === 'mobile' ? (cameraActive ? '扫码中...' : '等待扫码') : (scannerReady ? '扫码枪就绪' : '等待扫码') }}
            </span>
          </div>
        </div>

        <!-- PC端扫码区域 -->
        <div v-if="scanMode === 'pc'" class="relative">
          <input
            ref="scanInputRef"
            type="text"
            class="scan-input-hidden"
            @keydown="handleKeydown"
            @blur="handleInputBlur"
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            spellcheck="false"
          />

          <div
            class="border-2 border-dashed rounded-xl p-8 md:p-12 text-center transition-all duration-300"
            :class="[
              isScanning
                ? (stationMode === 'out' ? 'border-amber-500 bg-amber-500/10' : 'border-emerald-500 bg-emerald-500/10')
                : 'border-gray-300 dark:border-slate-600 hover:border-gray-400 dark:hover:border-slate-500'
            ]"
            @click="focusScanInput"
          >
            <div v-if="!lastScannedCode" class="space-y-3">
              <svg class="w-16 h-16 mx-auto text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              <p class="text-gray-700 dark:text-slate-300 text-lg font-medium">请使用扫码枪扫描商品条码</p>
              <p class="text-gray-400 dark:text-slate-500 text-sm">点击此处聚焦，或直接扫码</p>
            </div>

            <div v-else class="space-y-2">
              <div :class="['text-sm', stationMode === 'out' ? 'text-amber-400' : 'text-emerald-400']">刚刚扫描:</div>
              <div class="text-gray-900 dark:text-white text-2xl font-mono font-bold">{{ lastScannedCode }}</div>
            </div>
          </div>

          <div v-if="isProcessing" class="mt-4 flex items-center justify-center gap-2 text-amber-400">
            <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>处理中...</span>
          </div>
        </div>

        <!-- 移动端扫码区域 -->
        <div v-else class="space-y-4">
          <div v-if="!showCamera" class="text-center py-8">
            <button
              @click="startCamera"
              :class="[
                'px-8 py-4 text-white rounded-xl font-medium text-lg shadow-lg transition-all duration-200 hover:scale-105 active:scale-95',
                stationMode === 'out'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-amber-500/30 hover:shadow-amber-500/50'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-emerald-500/30 hover:shadow-emerald-500/50'
              ]"
            >
              <span class="flex items-center justify-center gap-3">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                开启摄像头扫码
              </span>
            </button>
            <p class="mt-4 text-slate-400 text-sm">扫到条码后不要关闭摄像头，可连续扫码</p>
          </div>

          <!-- 摄像头区域 - 使用 v-if 确保正确初始化 -->
          <div v-if="showCamera" class="relative">
            <!-- 确保容器有明确的高度 -->
            <div id="qr-reader" class="w-full min-h-[300px] rounded-xl overflow-hidden bg-black relative">
              <!-- 加载状态 -->
              <div v-if="!cameraActive" class="absolute inset-0 flex items-center justify-center bg-black">
                <div class="text-white text-center">
                  <svg class="w-10 h-10 mx-auto animate-spin mb-2" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p class="text-sm">正在启动摄像头...</p>
                </div>
              </div>
            </div>
            <!-- 关闭按钮 - 确保 z-index 足够高 -->
            <button
              @click="stopCamera"
              class="absolute top-3 right-3 z-50 w-10 h-10 bg-slate-900/80 rounded-full flex items-center justify-center text-white hover:bg-slate-700 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <!-- 处理中遮罩 -->
            <div v-if="isProcessing" class="absolute inset-0 flex items-center justify-center bg-black/50 z-40">
              <div class="flex items-center gap-2 text-amber-400 bg-slate-900 px-4 py-2 rounded-lg">
                <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                处理中...
              </div>
            </div>
          </div>
        </div>

        <!-- 扫码成功全屏提示 -->
        <transition name="fade">
          <div
            v-if="showSuccessTip"
            class="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
          >
            <div
              :class="[
                'scan-success-anim text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3',
                stationMode === 'out' ? 'bg-amber-500' : 'bg-emerald-500'
              ]"
            >
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span class="text-xl font-bold">{{ stationMode === 'out' ? '出库成功' : '入库成功' }}</span>
            </div>
          </div>
        </transition>

        <!-- 错误提示 -->
        <transition name="fade">
          <div
            v-if="errorMessage"
            class="mt-4 bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl flex items-center gap-3"
          >
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ errorMessage }}</span>
            <button @click="errorMessage = ''" class="ml-auto hover:text-red-300">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </transition>
      </div>

      <!-- 今日记录明细 -->
      <div class="bg-white/90 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-sm dark:shadow-xl border border-gray-200 dark:border-slate-700/50 overflow-hidden">
        <div class="p-4 border-b border-gray-200 dark:border-slate-700/50 flex items-center justify-between">
          <h2 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <svg :class="['w-5 h-5', stationMode === 'out' ? 'text-amber-400' : 'text-emerald-400']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            今日{{ stationMode === 'out' ? '出库' : '入库' }}明细
          </h2>
          <span class="text-sm text-gray-500 dark:text-slate-400">{{ recentLogs.length }} 条记录</span>
        </div>

        <div v-if="recentLogs.length === 0" class="p-8 text-center">
          <svg class="w-16 h-16 mx-auto text-slate-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p class="text-gray-400 dark:text-slate-500">暂无记录</p>
          <p class="text-gray-400 dark:text-slate-600 text-sm mt-1">扫码商品即可操作</p>
        </div>

        <div v-else class="divide-y divide-gray-100 dark:divide-slate-700/30 max-h-[500px] overflow-y-auto">
          <div
            v-for="(log, index) in recentLogs"
            :key="log.id"
            class="p-4 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-gray-900 dark:text-white font-medium truncate">{{ log.product_name }}</span>
                  <span
                    :class="[
                      'px-2 py-0.5 text-xs rounded-full',
                      log.type === 'OUT' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                    ]"
                  >
                    {{ log.type === 'OUT' ? '已出库' : '已入库' }}
                  </span>
                </div>
                <div class="flex items-center gap-4 text-sm text-gray-500 dark:text-slate-400">
                  <span>成本: ¥{{ log.unit_cost }}</span>
                  <span class="text-gray-400 dark:text-slate-500 text-xs">{{ log.sku_code }}</span>
                </div>
              </div>
              <div class="text-right flex-shrink-0">
                <div :class="['font-bold', log.type === 'OUT' ? 'text-amber-400' : 'text-emerald-400']">
                  {{ log.type === 'OUT' ? '-' : '+' }}{{ log.quantity }}
                </div>
                <div class="text-xs text-gray-400 dark:text-slate-500">{{ formatTime(log.created_at) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ====== 入库确认弹窗 ====== -->
    <transition name="fade">
      <div
        v-if="showInboundDialog"
        class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm"
        @click.self="cancelInbound"
      >
          <div class="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4">
          <!-- 标题 -->
          <div class="flex items-center gap-3 mb-5">
            <div class="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 class="text-gray-900 dark:text-white font-bold text-base">确认入库</h3>
              <p class="text-gray-500 dark:text-slate-400 text-xs">请核对数量与成本价</p>
            </div>
          </div>

          <!-- 商品信息 -->
          <div class="bg-gray-100 dark:bg-slate-700/40 rounded-xl p-3 mb-4 space-y-1">
            <div class="text-gray-900 dark:text-white font-medium">{{ pendingProduct?.name || '未知商品' }}</div>
            <div class="text-gray-500 dark:text-slate-400 text-xs font-mono">{{ pendingBarcode }}</div>
            <div v-if="pendingProduct?.logo_type" class="text-xs text-purple-400">
              {{ pendingProduct.logo_type }}
              <span v-if="pendingProduct?.color_style"> · {{ pendingProduct.color_style }}</span>
              <span v-if="pendingProduct?.location_code"> · 库位: {{ pendingProduct.location_code }}</span>
            </div>
          </div>

          <!-- 数量 + 成本价 -->
          <div class="grid grid-cols-2 gap-3 mb-5">
            <div>
              <label class="block text-xs text-gray-500 dark:text-slate-400 mb-1">入库数量</label>
              <input
                v-model.number="inboundQty"
                type="number"
                min="1"
                class="w-full bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label class="block text-xs text-gray-500 dark:text-slate-400 mb-1">成本价(元)</label>
              <input
                v-model.number="inboundCost"
                type="number"
                step="0.01"
                min="0"
                class="w-full bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          <!-- 预计成本 -->
          <div class="text-center text-gray-500 dark:text-slate-400 text-xs mb-5">
            入库成本预计：<span class="text-emerald-400 font-bold text-sm">¥{{ (inboundQty * inboundCost).toFixed(2) }}</span>
          </div>

          <!-- 按钮 -->
          <div class="flex gap-3">
            <button
              @click="cancelInbound"
              class="flex-1 px-4 py-2.5 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-300 rounded-xl font-medium transition-colors text-sm"
            >
              取消
            </button>
            <button
              @click="confirmInbound"
              :disabled="isProcessing"
              class="flex-1 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 dark:disabled:bg-slate-600 text-white rounded-xl font-bold transition-colors text-sm flex items-center justify-center gap-2"
            >
              <svg v-if="isProcessing" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isProcessing ? '处理中...' : '确认入库' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { Html5Qrcode } from 'html5-qrcode'
import { stockOut, stockIn, getTodayOutboundLogs, getInventoryLogs, getProductBySku } from '@/api'

// ==================== 设备检测 ====================
const isMobileDevice = ref(false)

function detectDevice() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i
  isMobileDevice.value = mobileRegex.test(userAgent.toLowerCase())
}

// ==================== 音效 ====================
const playSuccessSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.frequency.setValueAtTime(880, ctx.currentTime)
    osc.frequency.setValueAtTime(1108.73, ctx.currentTime + 0.1)
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.3)
  } catch {}
}

const playErrorSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.frequency.setValueAtTime(200, ctx.currentTime)
    osc.frequency.setValueAtTime(150, ctx.currentTime + 0.2)
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4)
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.4)
  } catch {}
}

// ==================== 工作台模式 ====================
const stationMode = ref('out')   // 'out' | 'in'

function switchMode(mode) {
  stationMode.value = mode
  lastScannedCode.value = ''
  errorMessage.value = ''
  loadTodayLogs()
  // PC 模式才重新聚焦
  if (scanMode.value === 'pc' && !isMobileDevice.value) {
    nextTick(() => focusScanInput())
  }
}

// ==================== 扫码设备状态 ====================
const scanMode      = ref('pc')  // 默认 PC 模式，移动端会自动切换
const isScanning    = ref(false)
const isProcessing  = ref(false)
const scannerReady  = ref(false)
const lastScannedCode = ref('')
const showSuccessTip  = ref(false)
const errorMessage    = ref('')
const showCamera      = ref(false)
const cameraActive    = ref(false)  // 摄像头是否真正启动成功
const scanInputRef    = ref(null)

// 扫码枪缓冲
let scanBuffer = ''
let scanTimer = null
let scannerIdleTimer = null
const SCAN_TIMEOUT = 50
const SCANNER_IDLE_TIMEOUT = 5 * 60 * 1000

function markScannerReady() {
  scannerReady.value = true
  if (scannerIdleTimer) clearTimeout(scannerIdleTimer)
  scannerIdleTimer = setTimeout(() => { scannerReady.value = false }, SCANNER_IDLE_TIMEOUT)
}

// 摄像头实例
let html5QrCode = null

// ==================== 入库弹窗状态 ====================
const showInboundDialog = ref(false)
const pendingBarcode    = ref('')
const pendingProduct    = ref(null)
const inboundQty        = ref(1)
const inboundCost       = ref(0)

// ==================== 统计 & 记录 ====================
const todayStats = reactive({ totalQuantity: 0, totalCost: '0.00' })
const recentLogs = ref([])

// ==================== 生命周期 ====================
onMounted(() => {
  detectDevice()
  window.addEventListener('keydown', handleKeydown)

  // 根据设备类型设置默认扫码模式
  if (isMobileDevice.value) {
    scanMode.value = 'mobile'
  } else {
    // PC 端才自动聚焦输入框，避免弹出软键盘
    nextTick(() => focusScanInput())
  }

  loadTodayLogs()
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  stopCamera()
  if (scanTimer) clearTimeout(scanTimer)
  if (scannerIdleTimer) clearTimeout(scannerIdleTimer)
})

// ==================== PC 端扫码枪 ====================
function handleKeydown(e) {
  if (scanMode.value !== 'pc') return
  // 入库弹窗打开时，Enter 键交给弹窗按钮，不拦截
  if (showInboundDialog.value) return

  if (e.key === 'Enter') {
    e.preventDefault()
    if (scanBuffer.trim()) {
      const barcode = scanBuffer.trim()
      scanBuffer = ''
      markScannerReady()
      handleScan(barcode)
    }
    return
  }

  if (e.key.length === 1) {
    if (e.ctrlKey || e.altKey || e.metaKey) return
    scanBuffer += e.key
    if (scanTimer) clearTimeout(scanTimer)
    scanTimer = setTimeout(() => { scanBuffer = '' }, SCAN_TIMEOUT * 2)
  }
}

function handleInputBlur() {
  setTimeout(() => focusScanInput(), 100)
}

function focusScanInput() {
  // 移动端不聚焦输入框，避免弹出软键盘
  if (scanMode.value !== 'pc' || isMobileDevice.value) return
  if (scanInputRef.value) {
    scanInputRef.value.focus()
    isScanning.value = true
  }
}

// ==================== 核心扫码处理 ====================
async function handleScan(barcode) {
  if (lastScannedCode.value === barcode && showSuccessTip.value) return

  lastScannedCode.value = barcode
  errorMessage.value = ''

  if (stationMode.value === 'out') {
    // 出库：极速扣减
    await doStockOut(barcode)
  } else {
    // 入库：弹窗确认
    await openInboundDialog(barcode)
  }
}

// ----- 出库逻辑 -----
async function doStockOut(barcode) {
  isProcessing.value = true
  try {
    await stockOut({
      sku_code: barcode,
      quantity: 1,
      operator: '操作员',
      remark: '扫码出库'
    })
    playSuccessSound()
    showSuccessTip.value = true
    setTimeout(() => { showSuccessTip.value = false }, 1500)
    await loadTodayLogs()
    // 只有 PC 端才重新聚焦输入框
    if (scanMode.value === 'pc' && !isMobileDevice.value) {
      nextTick(() => focusScanInput())
    }
  } catch (error) {
    playErrorSound()
    errorMessage.value = error.message || '出库失败，请重试'
    setTimeout(() => { errorMessage.value = '' }, 5000)
    if (scanMode.value === 'pc' && !isMobileDevice.value) {
      nextTick(() => focusScanInput())
    }
  } finally {
    isProcessing.value = false
  }
}

// ----- 入库弹窗 -----
async function openInboundDialog(barcode) {
  pendingBarcode.value = barcode
  pendingProduct.value = null
  inboundQty.value = 1
  inboundCost.value = 0

  // 查询商品获取默认成本价
  try {
    const res = await getProductBySku(barcode)
    if (res.success) {
      pendingProduct.value = res.data
      inboundCost.value = res.data.cost_price || 0
    }
  } catch {
    // 商品不存在时成本价保持0，用户手填
  }

  showInboundDialog.value = true
  // 弹窗出现后聚焦数量输入框
  await nextTick()
  document.querySelector('.inbound-qty-input')?.focus?.()
}

async function confirmInbound() {
  if (isProcessing.value) return
  isProcessing.value = true
  try {
    await stockIn({
      sku_code: pendingBarcode.value,
      quantity: inboundQty.value,
      cost_price: inboundCost.value,
      operator: '操作员',
      remark: '扫码入库'
    })
    playSuccessSound()
    showInboundDialog.value = false
    showSuccessTip.value = true
    setTimeout(() => { showSuccessTip.value = false }, 1500)
    await loadTodayLogs()
    // 只有 PC 端才重新聚焦输入框
    if (scanMode.value === 'pc' && !isMobileDevice.value) {
      nextTick(() => focusScanInput())
    }
  } catch (error) {
    playErrorSound()
    errorMessage.value = error.message || '入库失败，请重试'
    setTimeout(() => { errorMessage.value = '' }, 5000)
  } finally {
    isProcessing.value = false
  }
}

function cancelInbound() {
  showInboundDialog.value = false
  pendingBarcode.value = ''
  pendingProduct.value = null
  // 只有 PC 端才重新聚焦输入框
  if (scanMode.value === 'pc' && !isMobileDevice.value) {
    nextTick(() => focusScanInput())
  }
}

// ==================== 摄像头 ====================
async function startCamera() {
  try {
    // 先显示加载状态
    showCamera.value = true
    cameraActive.value = false

    // 等待 DOM 更新
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    html5QrCode = new Html5Qrcode('qr-reader')
    await html5QrCode.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
      (decodedText) => { handleScan(decodedText) },
      (errorMessage) => { /* 忽略扫描错误 */ }
    )
    // 摄像头启动成功
    cameraActive.value = true
  } catch (error) {
    console.error('启动摄像头失败:', error)
    errorMessage.value = '无法启动摄像头，请检查权限或刷新页面重试'
    showCamera.value = false
    cameraActive.value = false
  }
}

async function stopCamera() {
  if (html5QrCode) {
    try { await html5QrCode.stop() } catch {}
    html5QrCode = null
  }
  showCamera.value = false
  cameraActive.value = false
}

// ==================== 数据加载 ====================
async function loadTodayLogs() {
  try {
    const today = new Date().toISOString().split('T')[0]

    if (stationMode.value === 'out') {
      const result = await getTodayOutboundLogs()
      recentLogs.value = result.data || []
    } else {
      const result = await getInventoryLogs({
        type: 'IN',
        startDate: today + ' 00:00:00',
        endDate:   today + ' 23:59:59',
        pageSize: 100
      })
      recentLogs.value = result.data || []
    }

    todayStats.totalQuantity = recentLogs.value.reduce((s, l) => s + l.quantity, 0)
    todayStats.totalCost     = recentLogs.value
      .reduce((s, l) => s + l.quantity * l.unit_cost, 0)
      .toFixed(2)
  } catch (error) {
    console.error('加载记录失败:', error)
  }
}

// ==================== 工具 ====================
function formatTime(timeStr) {
  if (!timeStr) return ''
  return new Date(timeStr).toLocaleTimeString('zh-CN', {
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  })
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to       { opacity: 0; }

.scan-input-hidden {
  position: absolute;
  width: 1px; height: 1px;
  padding: 0; margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track  { background: rgba(30, 41, 59, 0.5); }
::-webkit-scrollbar-thumb  { background: rgba(71, 85, 105, 0.5); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: rgba(100, 116, 139, 0.5); }
</style>
