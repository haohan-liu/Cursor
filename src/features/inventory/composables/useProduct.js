import { ref, computed } from 'vue'
import {
  getProductList,
  getProductById,
  getProductBySku,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts
} from '@/apis'
import { toast } from '@/composables/useToast'
import { useProductVersion } from '@/composables/useProductVersion'

const { productVersions, syncVersionsFromList, setVersion, getVersion, handleConflictError } = useProductVersion()

export function useProduct() {
  const products = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  const availableCategories = computed(() => {
    const cats = new Set()
    products.value.forEach(p => { if (p.name) cats.add(p.name) })
    return [...cats].sort()
  })

  function parseAttrsToTags(raw) {
    if (raw === null || raw === undefined || raw === '') return []
    let obj = raw
    if (typeof obj === 'string') {
      const trimmed = obj.trim()
      if (!trimmed || trimmed === 'null' || trimmed === '{}' || trimmed === '[]') return []
      try { obj = JSON.parse(trimmed) } catch { return [] }
    }
    if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) return []
    return Object.entries(obj)
      .filter(([key]) => key.trim())
      .map(([key, val]) => ({ key: String(key), val: String(val) }))
  }

  function parseAttrsToSpecPairs(rawAttrs) {
    if (!rawAttrs) return []
    let obj = rawAttrs
    if (typeof obj === 'string') {
      try { obj = JSON.parse(obj) } catch { return [] }
    }
    if (typeof obj !== 'object' || obj === null) return []
    return Object.entries(obj).map(([key, val]) => ({ key, val: String(val) }))
  }

  function buildAttributesPayload(specPairs) {
    const obj = {}
    specPairs.forEach(({ key, val }) => {
      if (key.trim()) obj[key.trim()] = val.trim()
    })
    return obj
  }

  function formatAttributes(attr) {
    if (!attr) return '-'
    if (typeof attr === 'string') {
      try {
        const obj = JSON.parse(attr)
        return Object.values(obj).join(' / ')
      } catch {
        return attr
      }
    }
    return Object.values(attr).join(' / ')
  }

  async function fetchProducts(params = {}) {
    isLoading.value = true
    error.value = null
    try {
      const res = await getProductList(params)
      const data = res.data || []

      for (const p of data) {
        if (!p.location_code && p.locations && p.locations[0]) {
          p.location_code = p.locations[0].location_code
        }
        if (p.attributes && typeof p.attributes === 'string') {
          try {
            const attrs = JSON.parse(p.attributes)
            if (!p.logo_type) p.logo_type = attrs['LOGO'] || attrs['logo_type'] || ''
            if (!p.color_style) p.color_style = attrs['颜色'] || attrs['color_style'] || ''
            if (!p.thread_size) p.thread_size = attrs['螺纹型号'] || attrs['thread_size'] || ''
            if (!p.light_status) p.light_status = attrs['发光状态'] || attrs['light_status'] || ''
          } catch {}
        } else if (!p.attributes) {
          const legacy = {}
          if (p.logo_type)    legacy['LOGO']   = p.logo_type
          if (p.color_style) legacy['颜色']   = p.color_style
          if (p.thread_size) legacy['螺纹']   = p.thread_size
          if (p.light_status) legacy['发光状态'] = p.light_status
          if (Object.keys(legacy).length) p.attributes = JSON.stringify(legacy)
        }
      }

      products.value = data
      syncVersionsFromList(data)
      return data
    } catch (e) {
      error.value = e
      toast.error('获取产品列表失败')
      return []
    } finally {
      isLoading.value = false
    }
  }

  async function fetchProductBySku(skuCode) {
    try {
      const res = await getProductBySku(skuCode)
      if (res.success) {
        return res.data
      }
      return null
    } catch (e) {
      return null
    }
  }

  async function create(payload) {
    try {
      await createProduct(payload)
      toast.success('创建成功')
      await fetchProducts()
      return true
    } catch (e) {
      toast.error('创建失败: ' + e.message)
      return false
    }
  }

  async function update(id, payload) {
    try {
      const payloadWithVersion = {
        ...payload,
        expected_version: getVersion(id)
      }
      const res = await updateProduct(id, payloadWithVersion)

      if (res.code === 'CONCURRENT_CONFLICT') {
        toast.warning('数据已被其他操作修改，请刷新后重试')
        await fetchProducts()
        return { success: false, conflict: true }
      }

      toast.success('修改成功')

      if (res.data?.version) {
        setVersion(id, res.data.version)
      }

      await fetchProducts()
      return { success: true }
    } catch (e) {
      if (handleConflictError(e, '商品')) {
        await fetchProducts()
        return { success: false, conflict: true }
      }
      toast.error('修改失败: ' + e.message)
      return { success: false }
    }
  }

  async function remove(id) {
    try {
      await deleteProduct(id)
      toast.success('删除成功')
      await fetchProducts()
      return true
    } catch (e) {
      toast.error('删除失败: ' + e.message)
      return false
    }
  }

  return {
    products,
    isLoading,
    error,
    availableCategories,
    parseAttrsToTags,
    parseAttrsToSpecPairs,
    buildAttributesPayload,
    formatAttributes,
    fetchProducts,
    fetchProductBySku,
    create,
    update,
    remove
  }
}
