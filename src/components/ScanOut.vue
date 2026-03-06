<template>
  <div class="min-h-screen p-4 md:p-6">
    <!-- 顶部状态栏 -->
    <div class="max-w-4xl mx-auto mb-6">
      <div class="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-slate-700/50">
        <div class="flex items-center justify-between flex-wrap gap-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <div>
              <h1 class="text-xl md:text-2xl font-bold text-white">扫码出库工作台</h1>
              <p class="text-slate-400 text-sm">Scan & Ship</p>
            </div>
          </div>
          
          <!-- 今日统计 -->
          <div class="flex items-center gap-6">
            <div class="text-center">
              <div class="text-2xl md:text-3xl font-bold text-amber-400">{{ todayStats.totalQuantity }}</div>
              <div class="text-xs text-slate-400">今日出库</div>
            </div>
            <div class="text-center">
              <div class="text-2xl md:text-3xl font-bold text-emerald-400">¥{{ todayStats.totalCost }}</div>
              <div class="text-xs text-slate-400">今日成本</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主工作区 -->
    <div class="max-w-4xl mx-auto grid gap-6">
      <!-- 扫码控制区 -->
      <div class="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-xl border border-slate-700/50">
        <!-- 扫码模式切换 -->
        <div class="flex items-center justify-between mb-4">
          <div class="flex gap-2">
            <button
              @click="scanMode = 'pc'"
              :class="[
                'px-4 py-2 rounded-lg font-medium transition-all duration-200',
                scanMode === 'pc' 
                  ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              ]"
            >
              <span class="flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span class="hidden sm:inline">PC扫码枪</span>
              </span>
            </button>
            <button
              @click="scanMode = 'mobile'"
              :class="[
                'px-4 py-2 rounded-lg font-medium transition-all duration-200',
                scanMode === 'mobile' 
                  ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
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
          
          <!-- 连接状态 -->
          <div class="flex items-center gap-2">
            <div :class="['w-2 h-2 rounded-full', isConnected ? 'bg-emerald-500' : 'bg-slate-500']"></div>
            <span :class="['text-sm', isConnected ? 'text-emerald-400' : 'text-slate-400']">
              {{ isConnected ? '已连接' : '未连接' }}
            </span>
          </div>
        </div>

        <!-- PC端扫码区域 -->
        <div v-if="scanMode === 'pc'" class="relative">
          <!-- 隐藏的输入框用于捕获扫码枪输入 -->
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
          
          <!-- 扫码提示区 -->
          <div 
            class="border-2 border-dashed rounded-xl p-8 md:p-12 text-center transition-all duration-300"
            :class="[
              isScanning 
                ? 'border-amber-500 bg-amber-500/10' 
                : 'border-slate-600 hover:border-slate-500'
            ]"
            @click="focusScanInput"
          >
            <div v-if="!lastScannedCode" class="space-y-3">
              <svg class="w-16 h-16 mx-auto text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              <p class="text-slate-300 text-lg font-medium">请使用扫码枪扫描商品条码</p>
              <p class="text-slate-500 text-sm">点击此处聚焦，或直接扫码</p>
            </div>
            
            <!-- 最后扫码结果 -->
            <div v-else class="space-y-2">
              <div class="text-emerald-400 text-sm">刚刚扫描:</div>
              <div class="text-white text-2xl font-mono font-bold">{{ lastScannedCode }}</div>
            </div>
          </div>
          
          <!-- 扫码状态提示 -->
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
          <!-- 摄像头扫码 -->
          <div v-if="!showCamera" class="text-center py-8">
            <button
              @click="startCamera"
              class="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium text-lg shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all duration-200 hover:scale-105 active:scale-95"
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
          
          <!-- 摄像头画面 -->
          <div v-show="showCamera" class="relative">
            <div id="qr-reader" class="w-full rounded-xl overflow-hidden bg-black"></div>
            
            <!-- 关闭摄像头按钮 -->
            <button
              @click="stopCamera"
              class="absolute top-3 right-3 w-10 h-10 bg-slate-900/80 rounded-full flex items-center justify-center text-white hover:bg-slate-700 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <!-- 扫码状态 -->
            <div v-if="isProcessing" class="absolute inset-0 flex items-center justify-center bg-black/50">
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

        <!-- 扫码成功提示 -->
        <transition name="fade">
          <div 
            v-if="showSuccessTip" 
            class="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
          >
            <div class="scan-success-anim bg-emerald-500 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span class="text-xl font-bold">扫码成功</span>
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

      <!-- 今日出库明细 -->
      <div class="bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-700/50 overflow-hidden">
        <div class="p-4 border-b border-slate-700/50 flex items-center justify-between">
          <h2 class="text-lg font-bold text-white flex items-center gap-2">
            <svg class="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            今日出库明细
          </h2>
          <span class="text-sm text-slate-400">{{ outboundLogs.length }} 条记录</span>
        </div>
        
        <div v-if="outboundLogs.length === 0" class="p-8 text-center">
          <svg class="w-16 h-16 mx-auto text-slate-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p class="text-slate-500">暂无出库记录</p>
          <p class="text-slate-600 text-sm mt-1">扫码商品即可出库</p>
        </div>
        
        <div v-else class="divide-y divide-slate-700/30 max-h-[500px] overflow-y-auto">
          <div
            v-for="(log, index) in outboundLogs"
            :key="log.id"
            class="slide-in-anim p-4 hover:bg-slate-700/30 transition-colors"
            :style="{ animationDelay: `${index * 50}ms` }"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-white font-medium truncate">{{ log.product_name }}</span>
                  <span class="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">已出库</span>
                </div>
                <div class="flex items-center gap-4 text-sm text-slate-400">
                  <span v-if="log.attributes" class="truncate">{{ formatAttributes(log.attributes) }}</span>
                  <span>成本: ¥{{ log.unit_cost }}</span>
                </div>
              </div>
              <div class="text-right flex-shrink-0">
                <div class="text-amber-400 font-bold">-{{ log.quantity }}</div>
                <div class="text-xs text-slate-500">{{ formatTime(log.created_at) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { Html5Qrcode } from 'html5-qrcode'
import { stockOut, getTodayOutboundLogs } from '@/api'

// ==================== 响应式状态 ====================
const scanMode = ref('pc')  // 'pc' | 'mobile'
const isScanning = ref(false)
const isProcessing = ref(false)
const isConnected = ref(true)
const lastScannedCode = ref('')
const showSuccessTip = ref(false)
const errorMessage = ref('')
const showCamera = ref(false)

// DOM 引用
const scanInputRef = ref(null)

// 扫码枪相关
let scanBuffer = ''
let scanTimer = null
const SCAN_TIMEOUT = 50  // 扫码枪输入间隔阈值(ms)

// 摄像头扫码
let html5QrCode = null

// 今日统计
const todayStats = reactive({
  totalQuantity: 0,
  totalCost: '0.00'
})

// 出库记录
const outboundLogs = ref([])

// ==================== 生命周期 ====================
onMounted(() => {
  // 添加全局键盘监听
  window.addEventListener('keydown', handleKeydown)
  
  // 自动聚焦扫码输入框
  nextTick(() => {
    focusScanInput()
  })
  
  // 加载今日出库记录
  loadTodayLogs()
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  stopCamera()
  if (scanTimer) clearTimeout(scanTimer)
})

// ==================== PC端扫码枪处理 ====================
function handleKeydown(e) {
  // 移动端不使用键盘扫码
  if (scanMode.value !== 'pc') return
  
  // 如果有输入框聚焦，先移除焦点
  if (document.activeElement && document.activeElement.tagName === 'INPUT') {
    // 继续处理，允许扫码枪输入
  }
  
  // 截获 Enter 键
  if (e.key === 'Enter') {
    e.preventDefault()
    
    if (scanBuffer.trim()) {
      const barcode = scanBuffer.trim()
      scanBuffer = ''  // 清空缓冲区
      
      // 触发扫码处理
      handleScan(barcode)
    }
    return
  }
  
  // 收集字符（过滤特殊键）
  if (e.key.length === 1) {
    // 检查是否是功能键
    if (e.ctrlKey || e.altKey || e.metaKey) return
    
    // 添加到缓冲区
    scanBuffer += e.key
    
    // 设置超时清空（防止扫码枪卡顿导致不完整）
    if (scanTimer) clearTimeout(scanTimer)
    scanTimer = setTimeout(() => {
      scanBuffer = ''
    }, SCAN_TIMEOUT * 2)
  }
}

function handleInputBlur() {
  // 失去焦点后重新聚焦（实现无感扫码）
  setTimeout(() => {
    focusScanInput()
  }, 100)
}

function focusScanInput() {
  if (scanMode.value !== 'pc') return
  if (scanInputRef.value) {
    scanInputRef.value.focus()
    isScanning.value = true
  }
}

// ==================== 扫码处理核心逻辑 ====================
async function handleScan(barcode) {
  // 防止重复扫码（1.5秒内相同条码不处理）
  if (lastScannedCode.value === barcode && showSuccessTip.value) {
    return
  }
  
  isProcessing.value = true
  errorMessage.value = ''
  lastScannedCode.value = barcode
  
  try {
    // 调用后端出库接口
    const result = await stockOut({
      sku_code: barcode,
      quantity: 1,
      operator: '操作员',  // TODO: 从登录信息获取
      remark: '扫码出库'
    })
    
    // 显示成功提示
    showSuccessTip.value = true
    
    // 1.5秒后隐藏成功提示
    setTimeout(() => {
      showSuccessTip.value = false
    }, 1500)
    
    // 刷新出库记录
    await loadTodayLogs()
    
    // 移动端：保持摄像头开启，准备下一次扫码
    // PC端：重新聚焦输入框
    if (scanMode.value === 'pc') {
      nextTick(() => {
        focusScanInput()
      })
    }
    
  } catch (error) {
    errorMessage.value = error.message || '出库失败，请重试'
    
    // 错误提示5秒后消失
    setTimeout(() => {
      errorMessage.value = ''
    }, 5000)
    
    // 出错后也重新聚焦
    if (scanMode.value === 'pc') {
      nextTick(() => {
        focusScanInput()
      })
    }
  } finally {
    isProcessing.value = false
  }
}

// ==================== 移动端摄像头扫码 ====================
async function startCamera() {
  try {
    html5QrCode = new Html5Qrcode('qr-reader')
    
    await html5QrCode.start(
      { facingMode: 'environment' },  // 使用后置摄像头
      {
        fps: 10,  // 每秒10帧
        qrbox: { width: 250, height: 250 },  // 扫码框大小
        aspectRatio: 1.0
      },
      (decodedText) => {
        // 扫码成功回调
        handleScan(decodedText)
      },
      (errorMessage) => {
        // 扫码失败（忽略，持续扫描）
      }
    )
    
    showCamera.value = true
    isConnected.value = true
  } catch (error) {
    console.error('启动摄像头失败:', error)
    errorMessage.value = '无法启动摄像头，请检查权限'
    isConnected.value = false
  }
}

async function stopCamera() {
  if (html5QrCode) {
    try {
      await html5QrCode.stop()
      html5QrCode = null
    } catch (error) {
      console.error('关闭摄像头失败:', error)
    }
  }
  showCamera.value = false
}

// ==================== 数据加载 ====================
async function loadTodayLogs() {
  try {
    const result = await getTodayOutboundLogs()
    outboundLogs.value = result.data || []
    
    // 更新统计
    todayStats.totalQuantity = outboundLogs.value.reduce((sum, log) => sum + log.quantity, 0)
    todayStats.totalCost = outboundLogs.value
      .reduce((sum, log) => sum + (log.quantity * log.unit_cost), 0)
      .toFixed(2)
  } catch (error) {
    console.error('加载出库记录失败:', error)
  }
}

// ==================== 工具函数 ====================
function formatAttributes(attributes) {
  if (!attributes) return ''
  try {
    const attrs = typeof attributes === 'string' ? JSON.parse(attributes) : attributes
    return Object.entries(attrs)
      .map(([key, value]) => `${key}: ${value}`)
      .join(' / ')
  } catch {
    return attributes
  }
}

function formatTime(timeStr) {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  return date.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  })
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 隐藏扫码输入框 */
.scan-input-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
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
</style>
