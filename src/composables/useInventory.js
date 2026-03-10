import { ref, reactive } from 'vue'
import { 
  stockOut, 
  stockIn, 
  getTodayOutboundLogs, 
  getInventoryLogs,
  exportInventory,
  exportLogs 
} from '@/api'
import { toast } from './useToast'

export function useInventory() {
  // 今日统计
  const todayStats = reactive({
    totalQuantity: 0,
    totalCost: '0.00'
  })
  
  const recentLogs = ref([])
  const isLoading = ref(false)

  // 出库
  async function outbound(skuCode, quantity = 1, operator = '操作员', remark = '扫码出库') {
    try {
      await stockOut({
        sku_code: skuCode,
        quantity,
        operator,
        remark
      })
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message || '出库失败' }
    }
  }

  // 入库
  async function inbound(skuCode, quantity, costPrice, operator = '操作员', remark = '扫码入库') {
    try {
      await stockIn({
        sku_code: skuCode,
        quantity,
        cost_price: costPrice,
        operator,
        remark
      })
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message || '入库失败' }
    }
  }

  // 加载今日出库记录
  async function loadTodayOutboundLogs() {
    try {
      const res = await getTodayOutboundLogs()
      recentLogs.value = res.data || []
      recalcTodayStats()
      return recentLogs.value
    } catch (error) {
      console.error('加载出库记录失败:', error)
      return []
    }
  }

  // 加载入库记录
  async function loadInboundLogs(startDate, endDate, pageSize = 100) {
    try {
      const res = await getInventoryLogs({
        type: 'IN',
        startDate,
        endDate,
        pageSize
      })
      recentLogs.value = res.data || []
      recalcTodayStats()
      return recentLogs.value
    } catch (error) {
      console.error('加载入库记录失败:', error)
      return []
    }
  }

  // 重新计算今日统计
  function recalcTodayStats() {
    todayStats.totalQuantity = recentLogs.value.reduce((s, l) => s + l.quantity, 0)
    todayStats.totalCost = recentLogs.value
      .reduce((s, l) => s + (l.quantity * (l.unit_cost || 0)), 0)
      .toFixed(2)
  }

  // 导出库存数据
  async function exportInventoryData() {
    try {
      const res = await exportInventory()
      return res.data || []
    } catch (error) {
      toast.error('导出失败: ' + error.message)
      return []
    }
  }

  // 导出流水记录
  async function exportLogData(params = {}) {
    try {
      const res = await exportLogs(params)
      return res.data || []
    } catch (error) {
      toast.error('导出失败: ' + error.message)
      return []
    }
  }

  return {
    todayStats,
    recentLogs,
    isLoading,
    outbound,
    inbound,
    loadTodayOutboundLogs,
    loadInboundLogs,
    exportInventoryData,
    exportLogData
  }
}
