import axios from 'axios'

const api = axios.create({
  // 👉 这里已经帮你写好了正确的完整的 HTTPS 接口地址
  baseURL: 'https://api.hc00.cn/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
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

export function getLowStockProducts() {
  return api.get('/products/low-stock')
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

// ==================== 库位相关 ====================

export function getLocations() {
  return api.get('/locations')
}

export function getLocationByCode(code) {
  return api.get(`/locations/code/${code}`)
}

export function createLocation(data) {
  return api.post('/locations', data)
}

// ==================== 健康检查 ====================

export function healthCheck() {
  return api.get('/health')
}

// ==================== 导出相关 ====================

export function exportInventory() {
  return api.get('/export/inventory')
}

export function exportLogs(params) {
  return api.get('/export/logs', { params })
}

export default api