import { reactive, ref } from 'vue'

// ==================== Toast ====================
export const toasts = reactive([])
let nextId = 0

/**
 * 显示一条 Toast 消息
 * @param {string} message
 * @param {'success'|'error'|'warning'|'info'} type
 * @param {number} duration 毫秒，0 = 不自动关闭
 */
export function showToast(message, type = 'info', duration = 3000) {
  const id = ++nextId
  toasts.push({ id, message, type })
  if (duration > 0) {
    setTimeout(() => remove(id), duration)
  }
  return id
}

export function remove(id) {
  const idx = toasts.findIndex(t => t.id === id)
  if (idx !== -1) toasts.splice(idx, 1)
}

// 便捷方法
export const toast = {
  success: (msg, duration) => showToast(msg, 'success', duration),
  error:   (msg, duration) => showToast(msg, 'error',   duration),
  warning: (msg, duration) => showToast(msg, 'warning', duration),
  info:    (msg, duration) => showToast(msg, 'info',    duration),
}

// ==================== Confirm ====================
export const confirmState = reactive({
  visible: false,
  title: '确认操作',
  message: '',
  okText: '确认',
  cancelText: '取消',
  resolve: null,
})

/**
 * 替代 window.confirm 的深色风格对话框
 * @returns {Promise<boolean>}
 */
export function showConfirm({ title = '确认操作', message = '', okText = '确认', cancelText = '取消' } = {}) {
  return new Promise(resolve => {
    Object.assign(confirmState, { visible: true, title, message, okText, cancelText, resolve })
  })
}

export function handleConfirmOk() {
  confirmState.visible = false
  confirmState.resolve?.(true)
}

export function handleConfirmCancel() {
  confirmState.visible = false
  confirmState.resolve?.(false)
}
