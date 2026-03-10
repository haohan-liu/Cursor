import { ref, onMounted, onUnmounted, nextTick } from 'vue'

export function useScanner(options = {}) {
  const {
    scanTimeout = 50,
    scannerIdleTimeout = 5 * 60 * 1000,
    onScan = null,
    onError = null
  } = options

  // 状态
  const scanMode = ref('pc')  // 'pc' | 'mobile'
  const isScanning = ref(false)
  const isProcessing = ref(false)
  const scannerReady = ref(false)
  const lastScannedCode = ref('')
  const showSuccessTip = ref(false)
  const errorMessage = ref('')
  const showCamera = ref(false)
  const cameraActive = ref(false)
  const scanInputRef = ref(null)
  const isMobileDevice = ref(false)

  // 内部状态
  let scanBuffer = ''
  let scanTimer = null
  let scannerIdleTimer = null
  let html5QrCode = null

  // 设备检测
  function detectDevice() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera
    const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i
    isMobileDevice.value = mobileRegex.test(userAgent.toLowerCase())
    if (isMobileDevice.value) {
      scanMode.value = 'mobile'
    }
  }

  // 扫码枪就绪标记
  function markScannerReady() {
    scannerReady.value = true
    if (scannerIdleTimer) clearTimeout(scannerIdleTimer)
    scannerIdleTimer = setTimeout(() => { 
      scannerReady.value = false 
    }, scannerIdleTimeout)
  }

  // PC 端扫码枪处理
  function handleKeydown(e) {
    if (scanMode.value !== 'pc') return

    if (e.key === 'Enter') {
      e.preventDefault()
      if (scanBuffer.trim()) {
        const barcode = scanBuffer.trim()
        scanBuffer = ''
        markScannerReady()
        if (onScan) onScan(barcode)
      }
      return
    }

    if (e.key.length === 1) {
      if (e.ctrlKey || e.altKey || e.metaKey) return
      scanBuffer += e.key
      if (scanTimer) clearTimeout(scanTimer)
      scanTimer = setTimeout(() => { scanBuffer = '' }, scanTimeout * 2)
    }
  }

  // 聚焦扫码输入
  function focusScanInput() {
    if (scanMode.value !== 'pc' || isMobileDevice.value) return
    if (scanInputRef.value) {
      scanInputRef.value.focus()
      isScanning.value = true
    }
  }

  function handleInputBlur() {
    setTimeout(() => focusScanInput(), 100)
  }

  // 摄像头扫码
  async function startCamera(containerId = 'qr-reader') {
    try {
      showCamera.value = true
      cameraActive.value = false

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const { Html5Qrcode } = await import('html5-qrcode')
      html5QrCode = new Html5Qrcode(containerId)
      
      await html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
        (decodedText) => {
          if (onScan) onScan(decodedText)
        },
        (errorMsg) => {
          // 忽略扫描错误
        }
      )
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

  // 显示成功提示
  function showSuccess(message = '操作成功', duration = 1500) {
    showSuccessTip.value = true
    setTimeout(() => { showSuccessTip.value = false }, duration)
  }

  // 显示错误提示
  function showError(message, duration = 5000) {
    errorMessage.value = message
    setTimeout(() => { errorMessage.value = '' }, duration)
  }

  // 清除错误
  function clearError() {
    errorMessage.value = ''
  }

  // 初始化
  function init() {
    detectDevice()
    window.addEventListener('keydown', handleKeydown)
    
    if (!isMobileDevice.value) {
      nextTick(() => focusScanInput())
    }
  }

  // 清理
  function dispose() {
    window.removeEventListener('keydown', handleKeydown)
    stopCamera()
    if (scanTimer) clearTimeout(scanTimer)
    if (scannerIdleTimer) clearTimeout(scannerIdleTimer)
  }

  return {
    // 状态
    scanMode,
    isScanning,
    isProcessing,
    scannerReady,
    lastScannedCode,
    showSuccessTip,
    errorMessage,
    showCamera,
    cameraActive,
    scanInputRef,
    isMobileDevice,
    // 方法
    detectDevice,
    focusScanInput,
    handleInputBlur,
    handleKeydown,
    startCamera,
    stopCamera,
    markScannerReady,
    showSuccess,
    showError,
    clearError,
    // 生命周期
    init,
    dispose
  }
}
