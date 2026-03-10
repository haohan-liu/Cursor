/**
 * 产品版本跟踪组合式函数
 * 用于跟踪产品的 version 字段，防范并发冲突
 */

import { ref } from 'vue'
import { getProductList, getProductById } from '@/api'
import { toast } from './useToast'

const productVersions = ref({})

export function useProductVersion() {
  
  /**
   * 获取产品的当前版本号
   */
  function getVersion(productId) {
    return productVersions.value[productId] || 0
  }
  
  /**
   * 设置产品的版本号
   */
  function setVersion(productId, version) {
    productVersions.value[productId] = version
  }
  
  /**
   * 从产品列表中提取版本信息
   */
  function syncVersionsFromList(products) {
    if (Array.isArray(products)) {
      products.forEach(p => {
        if (p.id && p.version !== undefined) {
          productVersions.value[p.id] = p.version
        }
      })
    }
  }
  
  /**
   * 获取产品并同步版本
   */
  async function fetchAndSyncVersion(productId) {
    try {
      const res = await getProductById(productId)
      if (res.success && res.data) {
        const version = res.data.version || 0
        productVersions.value[productId] = version
        return { product: res.data, version }
      }
      return null
    } catch (error) {
      return null
    }
  }
  
  /**
   * 生成带有版本号的请求 payload
   */
  function withVersion(productId, payload = {}) {
    const version = getVersion(productId)
    return {
      ...payload,
      expected_version: version
    }
  }
  
  /**
   * 处理并发冲突错误
   * 返回 true 表示已处理，false 表示需要用户重试
   */
  function handleConflictError(error, productName = '该商品') {
    const message = error?.message || ''
    const isConflict = message.includes('CONCURRENT_CONFLICT') || 
                       message.includes('操作过于频繁') ||
                       message.includes('已被其他操作修改')
    
    if (isConflict) {
      toast.warning(`${productName}已被其他操作修改，请刷新后重试`)
      return true
    }
    return false
  }
  
  /**
   * 清理版本缓存
   */
  function clearVersions() {
    productVersions.value = {}
  }
  
  return {
    productVersions,
    getVersion,
    setVersion,
    syncVersionsFromList,
    fetchAndSyncVersion,
    withVersion,
    handleConflictError,
    clearVersions
  }
}
