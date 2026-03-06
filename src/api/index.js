import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
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

/**
 * GET /api/stats
 * 获取今日/本月数据看板统计
 */
export function getStats() {
  return api.get('/stats')
}

/**
 * GET /api/stats/trend
 * 获取近30天发货趋势
 */
export function getTrendStats() {
  return api.get('/stats/trend')
}

/**
 * GET /api/stats/top-products
 * 获取本月发货 Top 10
 */
export function getTopProducts() {
  return api.get('/stats/top-products')
}

// ==================== 商品相关 ====================

/**
 * GET /api/products
 * 获取商品列表
 */
export function getProductList(params) {
  return api.get('/products', { params })
}

/**
 * GET /api/products/:id
 * 获取商品详情
 */
export function getProductById(id) {
  return api.get(`/products/${id}`)
}

/**
 * GET /api/products/sku/:skuCode
 * 根据条码获取商品信息
 */
export function getProductBySku(skuCode) {
  return api.get(`/products/sku/${skuCode}`)
}

/**
 * POST /api/products
 * 创建商品
 */
export function createProduct(data) {
  return api.post('/products', data)
}

/**
 * PUT /api/products/:id
 * 更新商品信息
 */
export function updateProduct(id, data) {
  return api.put(`/products/${id}`, data)
}

/**
 * DELETE /api/products/:id
 * 删除商品
 */
export function deleteProduct(id) {
  return api.delete(`/products/${id}`)
}

/**
 * GET /api/products/low-stock
 * 获取缺货预警列表
 */
export function getLowStockProducts() {
  return api.get('/products/low-stock')
}

// ==================== 库存相关 ====================

/**
 * POST /api/inventory/out
 * 扫码出库接口
 */
export function stockOut(data) {
  return api.post('/inventory/out', data)
}

/**
 * POST /api/inventory/in
 * 扫码入库接口
 */
export function stockIn(data) {
  return api.post('/inventory/in', data)
}

/**
 * GET /api/inventory/today-logs
 * 获取今日出库明细
 */
export function getTodayOutboundLogs() {
  return api.get('/inventory/today-logs')
}

/**
 * GET /api/inventory/logs
 * 获取出入库流水记录
 */
export function getInventoryLogs(params) {
  return api.get('/inventory/logs', { params })
}

// ==================== 库位相关 ====================

/**
 * GET /api/locations
 * 获取库位列表
 */
export function getLocations() {
  return api.get('/locations')
}

/**
 * GET /api/locations/code/:code
 * 根据库位编码获取库位信息
 */
export function getLocationByCode(code) {
  return api.get(`/locations/code/${code}`)
}

/**
 * POST /api/locations
 * 创建库位
 */
export function createLocation(data) {
  return api.post('/locations', data)
}

// ==================== 健康检查 ====================

/**
 * GET /api/health
 * 健康检查
 */
export function healthCheck() {
  return api.get('/health')
}

export default api
