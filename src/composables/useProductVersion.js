import { ref } from 'vue'
import { getProductList, getProductById } from '@/apis'
import { toast } from './useToast'

const productVersions = ref({})

export function useProductVersion() {

  function getVersion(productId) {
    return productVersions.value[productId] || 0
  }

  function setVersion(productId, version) {
    productVersions.value[productId] = version
  }

  function syncVersionsFromList(products) {
    if (Array.isArray(products)) {
      products.forEach(p => {
        if (p.id && p.version !== undefined) {
          productVersions.value[p.id] = p.version
        }
      })
    }
  }

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

  function withVersion(productId, payload = {}) {
    const version = getVersion(productId)
    return {
      ...payload,
      expected_version: version
    }
  }

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
