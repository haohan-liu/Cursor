/**
 * Axios 实例配置
 * 使用环境变量配置 API 地址
 */
import axios from 'axios'

const api = axios.create({
  // 使用 Vite 环境变量，支持不同环境不同配置
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: import.meta.env.VITE_API_TIMEOUT || 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器：给所有 GET 请求加上时间戳，强制击穿手机浏览器缓存
api.interceptors.request.use(config => {
  if (config.method === 'get') {
    config.params = {
      ...config.params,
      _t: new Date().getTime()
    }
  }
  return config
})

// 响应拦截器
api.interceptors.response.use(
  response => response.data,
  error => {
    const message = error.response?.data?.message || error.message || '请求失败'
    console.error('API Error:', message)
    return Promise.reject(new Error(message))
  }
)

export default api

// ==================== 统计相关 ====================
export function getDashboardStats() {
  return api.get('/dashboard/stats')
}

export function getStats() {
  return api.get('/stats')
}

export function getTrendStats() {
  return api.get('/stats/trend')
}

export function getTopProducts() {
  return api.get('/stats/top-products')
}

export function getLowStockProducts() {
  return api.get('/products/low-stock')
}

// ==================== 商品相关 ====================
export function getProductList(params) {
  return api.get('/products', { params })
}

export function getProductById(id) {
  return api.get(`/products/${id}`)
}

export function getProductBySku(skuCode) {
  return api.get(`/products/sku/${skuCode}`)
}

export function createProduct(data) {
  return api.post('/products', data)
}

export function updateProduct(id, data) {
  return api.put(`/products/${id}`, data)
}

export function deleteProduct(id) {
  return api.delete(`/products/${id}`)
}

// ==================== 库存相关 ====================
export function stockOut(data) {
  return api.post('/inventory/out', data)
}

export function stockIn(data) {
  return api.post('/inventory/in', data)
}

export function getTodayOutboundLogs() {
  return api.get('/inventory/today-logs')
}

export function getInventoryLogs(params) {
  return api.get('/inventory/logs', { params })
}

export function exportInventory() {
  return api.get('/export/inventory')
}

export function exportLogs(params) {
  return api.get('/export/logs', { params })
}

// ==================== 库位相关 ====================
export function getLocations() {
  return api.get('/locations')
}
