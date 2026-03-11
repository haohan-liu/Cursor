<template>
  <div class="min-h-screen p-4 md:p-6 transition-colors duration-300">

    <div class="max-w-4xl mx-auto mb-6">
      <div class="bg-white/90 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-3 md:p-4 shadow-sm dark:shadow-xl border border-gray-200 dark:border-slate-700/50">
        <div class="flex flex-col gap-3">
          <div class="flex items-center justify-between gap-2 md:gap-4">
            <div class="flex items-center gap-2 md:gap-3">
              <div
                :class="[
                  'w-9 h-9 md:w-12 md:h-12 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br transition-all duration-300',
                  stationMode === 'out' ? 'from-amber-500 to-orange-600' : 'from-emerald-500 to-teal-600'
                ]"
              >
                <svg class="w-4 h-4 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              <div>
                <h1 class="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">扫码工作台</h1>
                <p class="text-gray-500 dark:text-slate-400 text-xs md:text-sm hidden sm:block">Scan Station</p>
              </div>
            </div>

            <div class="flex items-center bg-gray-100 dark:bg-slate-700/60 rounded-xl p-0.5 gap-0.5">
              <button
                @click="switchMode('out')"
                :class="[
                  'px-3 md:px-5 py-1.5 md:py-2 rounded-lg font-bold text-xs md:text-sm transition-all duration-200',
                  stationMode === 'out' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                ]"
              >📤 出库</button>
              <button
                @click="switchMode('in')"
                :class="[
                  'px-3 md:px-5 py-1.5 md:py-2 rounded-lg font-bold text-xs md:text-sm transition-all duration-200',
                  stationMode === 'in' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                ]"
              >📥 入库</button>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2 md:flex md:items-center md:gap-6">
            <div class="text-center bg-gray-50 dark:bg-slate-700/40 rounded-lg md:rounded-xl p-2 md:p-0">
              <div :class="['text-lg md:text-3xl font-bold', stationMode === 'out' ? 'text-amber-400' : 'text-emerald-400']">{{ todayStats.totalQuantity }}</div>
              <div class="text-xs text-gray-500 dark:text-slate-400">今日{{ stationMode === 'out' ? '出库' : '入库' }}</div>
            </div>
            <div class="text-center bg-gray-50 dark:bg-slate-700/40 rounded-lg md:rounded-xl p-2 md:p-0">
              <div class="text-lg md:text-3xl font-bold text-blue-400">¥{{ todayStats.totalCost }}</div>
              <div class="text-xs text-gray-500 dark:text-slate-400">今日成本</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-4xl mx-auto grid gap-6">
      <div
        :class="[
          'bg-white/90 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-sm dark:shadow-xl border transition-colors duration-300',
          stationMode === 'out' ? 'border-amber-500/30' : 'border-emerald-500/30'
        ]"
      >
        <div
          :class="[
            'mb-4 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2',
            stationMode === 'out' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'
          ]"
        >
          <span>{{ stationMode === 'out' ? '📤 出库模式 — 扫码后自动极速扣减' : '📥 入库模式 — 扫码后弹窗确认数量和成本价' }}</span>
        </div>

        <div class="flex flex-row items-center justify-between gap-2 mb-4">
          <div class="flex gap-2 flex-shrink-0">
            <button
              v-if="!isMobileDevice"
              @click="scanMode = 'pc'"
              :class="[
                'px-4 py-2 rounded-lg font-medium transition-all duration-200 whitespace-nowrap',
                scanMode === 'pc' ? (stationMode === 'out' ? 'bg-amber-500 text-white shadow-lg' : 'bg-emerald-500 text-white shadow-lg') : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300'
              ]"
            >PC扫码枪</button>
            
            <button
              @click="scanMode = 'mobile'"
              :class="[
                'p-2 md:px-4 md:py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center',
                scanMode === 'mobile' ? (stationMode === 'out' ? 'bg-amber-500 text-white shadow-lg' : 'bg-emerald-500 text-white shadow-lg') : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300'
              ]"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>

          <div class="flex flex-row items-center gap-2 whitespace-nowrap flex-shrink-0">
            <div :class="['w-2 h-2 rounded-full transition-colors duration-500', scannerReady ? (stationMode === 'out' ? 'bg-amber-400' : 'bg-emerald-400') + ' animate-pulse' : 'bg-slate-500']"></div>
            <span :class="['text-sm', scannerReady ? (stationMode === 'out' ? 'text-amber-400' : 'text-emerald-400') : 'text-slate-400']">
              <template v-if="scanMode === 'mobile'">
                {{ cameraActive ? '扫码中...' : '等待扫码' }}
              </template>
              <template v-else>
                {{ scannerReady ? '扫码枪就绪' : '等待扫码' }}
              </template>
            </span>
          </div>
        </div>

        <div v-if="scanMode === 'pc'" class="relative">
          <input ref="scanInputRef" type="text" class="scan-input-hidden" @keydown="handleKeydown" @blur="handleInputBlur" autocomplete="off" />
          <div
            class="border-2 border-dashed rounded-xl p-8 md:p-12 text-center transition-all duration-300"
            :class="[isScanning ? (stationMode === 'out' ? 'border-amber-500 bg-amber-500/10' : 'border-emerald-500 bg-emerald-500/10') : 'border-gray-300 dark:border-slate-600']"
            @click="focusScanInput"
          >
            <div v-if="!lastScannedCode" class="text-gray-700 dark:text-slate-300">请使用扫码枪扫描商品条码</div>
            <div v-else class="text-2xl font-mono font-bold">{{ lastScannedCode }}</div>
          </div>
        </div>

        <div v-else class="space-y-4 relative">
          
          <div :class="[showCamera ? 'hidden' : 'block', 'text-center py-8']">
            <button
              @click="startCamera"
              :class="[
                'px-8 py-4 text-white rounded-xl font-medium text-lg shadow-lg',
                stationMode === 'out' ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-emerald-500 to-teal-500'
              ]"
            >开启摄像头扫码</button>
            <p class="mt-4 text-slate-400 text-sm">扫到条码后不要关闭摄像头，可连续扫码</p>
          </div>

          <div :class="[showCamera ? 'block' : 'hidden', 'relative w-full rounded-xl overflow-hidden bg-black min-h-[300px]']">
            <div id="qr-reader" class="w-full"></div>
            
            <button
              @click="stopCamera"
              class="absolute top-2 right-2 z-50 w-10 h-10 bg-slate-900/80 rounded-full flex items-center justify-center text-white"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div v-if="!cameraActive && showCamera" class="absolute inset-0 flex items-center justify-center bg-black">
              <span class="text-white text-sm">正在启动摄像头...</span>
            </div>

            <div v-if="isProcessing" class="absolute inset-0 flex items-center justify-center bg-black/60 z-40">
              <span class="text-amber-400 bg-slate-900 px-6 py-3 rounded-xl">处理中...</span>
            </div>
          </div>
        </div>

        <transition name="fade">
          <div v-if="showSuccessTip" class="fixed inset-0 flex items-center justify-center pointer-events-none z-[9999]">
            <div :class="['text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3', stationMode === 'out' ? 'bg-amber-500' : 'bg-emerald-500']">
              <span class="text-xl font-bold">{{ stationMode === 'out' ? '出库成功' : '入库成功' }}</span>
            </div>
          </div>
        </transition>

        <transition name="fade">
          <div v-if="errorMessage" class="mt-4 bg-red-500/20 text-red-400 px-4 py-3 rounded-xl flex items-center gap-3">
            <span>{{ errorMessage }}</span>
            <button @click="errorMessage = ''" class="ml-auto"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
        </transition>
      </div>

      <div class="bg-white/90 dark:bg-slate-800/80 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700/50 overflow-hidden">
        <div class="p-4 border-b border-gray-200 dark:border-slate-700/50 flex justify-between">
          <h2 class="text-lg font-bold text-gray-900 dark:text-white">今日{{ stationMode === 'out' ? '出库' : '入库' }}明细</h2>
          <span class="text-sm text-gray-500">{{ recentLogs.length }} 条记录</span>
        </div>

        <div v-if="recentLogs.length === 0" class="p-8 text-center text-gray-400">暂无记录</div>

        <div v-else class="divide-y divide-gray-100 dark:divide-slate-700/30 max-h-[500px] overflow-y-auto">
          <div v-for="log in recentLogs" :key="log._uid" class="p-4">
            <div class="flex items-start justify-between gap-3">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-gray-900 dark:text-white font-medium truncate">{{ log.product_name }}</span>
                </div>
                <div class="text-sm text-gray-500 dark:text-slate-400">{{ log.sku_code }} | 成本: ¥{{ log.unit_cost }}</div>
              </div>
              <div class="text-right flex-shrink-0">
                <div :class="['font-bold', log.type === 'OUT' ? 'text-amber-400' : 'text-emerald-400']">{{ log.type === 'OUT' ? '-' : '+' }}{{ log.quantity }}</div>
                <div class="text-xs text-gray-400">{{ formatTime(log.created_at) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <transition name="fade">
      <div v-if="showInboundDialog" class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm">
        <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-sm mx-4">
          <h3 class="text-gray-900 dark:text-white font-bold mb-4">确认入库</h3>
          <div class="bg-gray-100 dark:bg-slate-700/40 p-3 rounded-xl mb-4">
            <div class="text-gray-900 dark:text-white">{{ pendingProduct?.name || '未知商品' }}</div>
            <div class="text-gray-500 text-xs">{{ pendingBarcode }}</div>
          </div>
          <div class="grid grid-cols-2 gap-3 mb-5">
            <div>
              <label class="block text-xs text-gray-500 mb-1">入库数量</label>
              <input v-model.number="inboundQty" type="number" min="1" class="w-full bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white outline-none" />
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">成本价(元)</label>
              <input v-model.number="inboundCost" type="number" step="0.01" min="0" class="w-full bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white outline-none" />
            </div>
          </div>
          
          <div class="text-center text-gray-500 dark:text-slate-400 text-xs mb-5">
            入库总成本：<span class="text-emerald-500 font-bold text-sm">¥{{ (inboundQty * inboundCost).toFixed(2) }}</span>
          </div>

          <div class="flex gap-3">
            <button @click="cancelInbound" class="flex-1 py-2.5 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-xl">取消</button>
            <button @click="confirmInbound" :disabled="isProcessing" class="flex-1 py-2.5 bg-emerald-500 text-white rounded-xl">确认入库</button>
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

const isMobileDevice = ref(false)
const stationMode = ref('out')
const scanMode = ref('pc')
const isScanning = ref(false)
const isProcessing = ref(false)
const scanLock = ref(false)
const scannerReady = ref(false)
const lastScannedCode = ref('')
const showSuccessTip = ref(false)
const errorMessage = ref('')
const showCamera = ref(false)
const cameraActive = ref(false)
const scanInputRef = ref(null)

let scanBuffer = ''
let scanTimer = null
let scannerIdleTimer = null
let html5QrCode = null

const showInboundDialog = ref(false)
const pendingBarcode = ref('')
const pendingProduct = ref(null)
const inboundQty = ref(1)
const inboundCost = ref(0)
const todayStats = reactive({ totalQuantity: 0, totalCost: '0.00' })
const recentLogs = ref([])

onMounted(async () => {
  isMobileDevice.value = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test((navigator.userAgent || navigator.vendor || window.opera).toLowerCase())
  scanMode.value = isMobileDevice.value ? 'mobile' : 'pc'
  window.addEventListener('keydown', handleKeydown)
  if (!isMobileDevice.value) nextTick(() => focusScanInput())
  await loadTodayLogs()
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  forceClearCamera()
})

const playSuccessSound = () => { try { const c = new (window.AudioContext || window.webkitAudioContext)(); const o = c.createOscillator(); const g = c.createGain(); o.connect(g); g.connect(c.destination); o.frequency.setValueAtTime(880, c.currentTime); gain.gain.setValueAtTime(0.3, c.currentTime); o.start(c.currentTime); o.stop(c.currentTime + 0.3); } catch{} }
const playErrorSound = () => { try { const c = new (window.AudioContext || window.webkitAudioContext)(); const o = c.createOscillator(); const g = c.createGain(); o.connect(g); g.connect(c.destination); o.frequency.setValueAtTime(200, c.currentTime); gain.gain.setValueAtTime(0.3, c.currentTime); o.start(c.currentTime); o.stop(c.currentTime + 0.4); } catch{} }

async function switchMode(mode) {
  stationMode.value = mode
  lastScannedCode.value = ''
  await loadTodayLogs()
  if (scanMode.value === 'pc' && !isMobileDevice.value) nextTick(() => focusScanInput())
}

function handleKeydown(e) {
  if (scanMode.value !== 'pc' || showInboundDialog.value) return
  if (e.key === 'Enter') { e.preventDefault(); if (scanBuffer.trim()) { const b = scanBuffer.trim(); scanBuffer = ''; scannerReady.value = true; handleScan(b); } return }
  if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) { scanBuffer += e.key; clearTimeout(scanTimer); scanTimer = setTimeout(() => scanBuffer = '', 100) }
}
function handleInputBlur() { setTimeout(() => focusScanInput(), 100) }
function focusScanInput() { if (scanMode.value === 'pc' && !isMobileDevice.value && scanInputRef.value) { scanInputRef.value.focus(); isScanning.value = true } }

// 核心扫码控制逻辑（加入 2.5 秒防连扫冷却）
async function handleScan(barcode) {
  // 如果系统繁忙、弹窗开启中，或者扫码锁被锁住，直接忽略
  if (isProcessing.value || showInboundDialog.value || scanLock.value) return
  // 强力防连扫：如果在 2.5 秒内连续扫了一模一样的码，直接拒绝
  if (barcode === lastScannedCode.value) return

  scanLock.value = true
  lastScannedCode.value = barcode

  // 2.5 秒同码冷却计时器
  setTimeout(() => {
    if (lastScannedCode.value === barcode) {
      lastScannedCode.value = ''
    }
  }, 2500)

  if (stationMode.value === 'out') await doStockOut(barcode)
  else await openInboundDialog(barcode)
}

function forceClearCamera() {
  if (html5QrCode) {
    const instance = html5QrCode;
    html5QrCode = null;
    setTimeout(() => {
      try {
        if (instance.isScanning) {
          instance.stop().then(() => instance.clear()).catch(() => instance.clear())
        } else {
          instance.clear()
        }
      } catch(e) {}
    }, 50)
  }
}

async function startCamera() {
  showCamera.value = true
  cameraActive.value = false
  await nextTick()

  forceClearCamera()
  html5QrCode = new Html5Qrcode('qr-reader')

  try {
    await html5QrCode.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
      (decodedText) => { handleScan(decodedText) },
      () => {}
    )
    cameraActive.value = true
  } catch (error) {
    errorMessage.value = '无法启动摄像头'
    showCamera.value = false
  }
}

function stopCamera() {
  showCamera.value = false
  cameraActive.value = false
  isProcessing.value = false
  scanLock.value = false
  forceClearCamera()
}

async function doStockOut(barcode) {
  isProcessing.value = true
  try {
    await stockOut({ sku_code: barcode, quantity: 1, operator: '操作员', remark: '扫码出库' })
    showSuccessTip.value = true
    setTimeout(() => { showSuccessTip.value = false }, 1000)

    recentLogs.value.unshift({
      _uid: 'temp_' + Date.now(),
      product_name: '刚刚扫码出库',
      sku_code: barcode,
      type: 'OUT',
      quantity: 1,
      unit_cost: 0,
      created_at: new Date().toISOString()
    })
    todayStats.totalQuantity += 1
    setTimeout(loadTodayLogs, 1000)
  } catch (error) {
    errorMessage.value = error.message || '出库失败'
    setTimeout(() => errorMessage.value = '', 5000)
  } finally {
    isProcessing.value = false
    setTimeout(() => scanLock.value = false, 500)
  }
}

async function openInboundDialog(barcode) {
  pendingBarcode.value = barcode
  inboundQty.value = 1
  try { const res = await getProductBySku(barcode); pendingProduct.value = res.data; inboundCost.value = res.data?.cost_price || 0 } catch {}
  showInboundDialog.value = true
}

async function confirmInbound() {
  if (isProcessing.value) return
  isProcessing.value = true
  try {
    await stockIn({ sku_code: pendingBarcode.value, quantity: inboundQty.value, cost_price: inboundCost.value, operator: '操作员', remark: '扫码入库' })
    showInboundDialog.value = false
    showSuccessTip.value = true
    setTimeout(() => { showSuccessTip.value = false }, 1000)

    recentLogs.value.unshift({
      _uid: 'temp_' + Date.now(),
      product_name: pendingProduct.value?.name || '刚刚扫码入库',
      sku_code: pendingBarcode.value,
      type: 'IN',
      quantity: inboundQty.value,
      unit_cost: inboundCost.value,
      created_at: new Date().toISOString()
    })
    todayStats.totalQuantity += inboundQty.value
    setTimeout(loadTodayLogs, 1000)
  } catch (error) {
    errorMessage.value = error.message || '入库失败'
    setTimeout(() => errorMessage.value = '', 5000)
  } finally {
    isProcessing.value = false
    setTimeout(() => scanLock.value = false, 1500)
  }
}

function cancelInbound() { 
  showInboundDialog.value = false; 
  setTimeout(() => scanLock.value = false, 1500)
}

async function loadTodayLogs() {
  try {
    const t = Date.now()
    const now = new Date()
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    
    let rawData = []
    if (stationMode.value === 'out') {
      const res = await getTodayOutboundLogs({ _t: t })
      rawData = res.data || []
    } else {
      const res = await getInventoryLogs({ type: 'IN', startDate: today + ' 00:00:00', endDate: today + ' 23:59:59', pageSize: 100, _t: t })
      rawData = res.data || []
    }

    recentLogs.value = rawData.map((x, i) => ({ ...x, _uid: x.id || `${t}_${i}` }))
    todayStats.totalQuantity = recentLogs.value.reduce((s, l) => s + l.quantity, 0)
    todayStats.totalCost = recentLogs.value.reduce((s, l) => s + l.quantity * l.unit_cost, 0).toFixed(2)
  } catch (error) {
    console.error('加载记录失败', error)
  }
}

function formatTime(timeStr) {
  if (!timeStr) return ''
  let isoStr = timeStr.replace(' ', 'T')
  if (!isoStr.includes('Z') && !isoStr.includes('+')) isoStr += 'Z'
  const d = new Date(isoStr)
  if (isNaN(d.getTime())) return timeStr
  const p = n => String(n).padStart(2, '0')
  return `${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.scan-input-hidden { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
:deep(#qr-reader), :deep(.qr-shaded-region) { border: none !important; background: transparent !important; }
:deep(#qr-reader__scan_region video) { border-radius: 12px; }
:deep(#qr-reader__dashboard), :deep(#qr-reader__status_span) { display: none !important; }
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: rgba(30, 41, 59, 0.5); }
::-webkit-scrollbar-thumb { background: rgba(71, 85, 105, 0.5); border-radius: 3px; }
</style>