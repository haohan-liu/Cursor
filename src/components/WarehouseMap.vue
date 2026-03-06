<template>
  <div class="space-y-8">
    <!-- 货架 A -->
    <div class="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-xl border border-slate-700/50">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
          <span class="text-white font-bold text-lg">A</span>
        </div>
        <div>
          <h2 class="text-xl font-bold text-white">货架 A</h2>
          <p class="text-slate-400 text-sm">A Shelf - 4层 × 5格</p>
        </div>
      </div>
      
      <!-- 货架网格 -->
      <div class="grid grid-cols-5 gap-2 md:gap-3">
        <!-- 层标签 -->
        <div class="contents">
          <div
            v-for="row in 4"
            :key="'label-' + row"
            class="hidden md:flex items-center justify-center text-slate-500 text-sm font-medium"
          >
            {{ 5 - row }}层
          </div>
        </div>
        
        <!-- 货位格子 -->
        <div
          v-for="row in 4"
          :key="'row-' + row"
          class="col-span-4 md:col-span-4 grid grid-cols-5 gap-2 md:gap-3"
        >
          <div
            v-for="col in 5"
            :key="`A-${row}-${col}`"
            class="aspect-square relative"
          >
            <!-- 货位格子 -->
            <div
              :ref="el => setLocationRef(`A-${String(row).padStart(2, '0')}-${String(col).padStart(2, '0')}`, el)"
              @mouseenter="handleHover(`A-${String(row).padStart(2, '0')}-${String(col).padStart(2, '0')}`, $event)"
              @mouseleave="hideTooltip"
              :class="getCellClass(`A-${String(row).padStart(2, '0')}-${String(col).padStart(2, '0')}`)"
              class="w-full h-full rounded-lg cursor-pointer transition-all duration-300 flex items-center justify-center"
            >
              <!-- 库位编码 -->
              <span class="text-xs md:text-sm font-mono font-medium">
                {{ `A${row}${col}` }}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 层标签（移动端横向） -->
      <div class="flex md:hidden justify-around mt-3 pt-3 border-t border-slate-700/50">
        <span v-for="row in 4" :key="row" class="text-xs text-slate-500">{{ 5 - row }}层</span>
      </div>
    </div>

    <!-- 货架 B -->
    <div class="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-xl border border-slate-700/50">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
          <span class="text-white font-bold text-lg">B</span>
        </div>
        <div>
          <h2 class="text-xl font-bold text-white">货架 B</h2>
          <p class="text-slate-400 text-sm">B Shelf - 4层 × 5格</p>
        </div>
      </div>
      
      <!-- 货架网格 -->
      <div class="grid grid-cols-5 gap-2 md:gap-3">
        <!-- 层标签 -->
        <div class="contents">
          <div
            v-for="row in 4"
            :key="'label-' + row"
            class="hidden md:flex items-center justify-center text-slate-500 text-sm font-medium"
          >
            {{ 5 - row }}层
          </div>
        </div>
        
        <!-- 货位格子 -->
        <div
          v-for="row in 4"
          :key="'row-' + row"
          class="col-span-4 md:col-span-4 grid grid-cols-5 gap-2 md:gap-3"
        >
          <div
            v-for="col in 5"
            :key="`B-${row}-${col}`"
            class="aspect-square relative"
          >
            <!-- 货位格子 -->
            <div
              :ref="el => setLocationRef(`B-${String(row).padStart(2, '0')}-${String(col).padStart(2, '0')}`, el)"
              @mouseenter="handleHover(`B-${String(row).padStart(2, '0')}-${String(col).padStart(2, '0')}`, $event)"
              @mouseleave="hideTooltip"
              :class="getCellClass(`B-${String(row).padStart(2, '0')}-${String(col).padStart(2, '0')}`)"
              class="w-full h-full rounded-lg cursor-pointer transition-all duration-300 flex items-center justify-center"
            >
              <!-- 库位编码 -->
              <span class="text-xs md:text-sm font-mono font-medium">
                {{ `B${row}${col}` }}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 层标签（移动端横向） -->
      <div class="flex md:hidden justify-around mt-3 pt-3 border-t border-slate-700/50">
        <span v-for="row in 4" :key="row" class="text-xs text-slate-500">{{ 5 - row }}层</span>
      </div>
    </div>

    <!-- 悬浮提示 Tooltip -->
    <Teleport to="body">
      <div
        v-if="tooltip.visible"
        :style="tooltipStyle"
        class="fixed z-50 bg-slate-900/95 backdrop-blur-sm border border-slate-600 rounded-xl p-4 shadow-2xl pointer-events-none transform transition-all duration-150"
        :class="tooltip.visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'"
      >
        <div class="space-y-2 min-w-[180px]">
          <div class="flex items-center gap-2 pb-2 border-b border-slate-700">
            <span class="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs font-medium rounded">
              {{ tooltip.locationCode }}
            </span>
          </div>
          
          <div v-if="tooltip.productName">
            <div class="text-white font-medium">{{ tooltip.productName }}</div>
            <div v-if="tooltip.attributes" class="text-slate-400 text-sm mt-1">
              {{ tooltip.attributes }}
            </div>
            <div class="flex items-center justify-between mt-2 pt-2 border-t border-slate-700">
              <span class="text-slate-400 text-sm">库存</span>
              <span class="text-amber-400 font-bold">{{ tooltip.stock }} 件</span>
            </div>
          </div>
          
          <div v-else class="text-slate-500 text-sm">
            空货位
          </div>
        </div>
        
        <!-- 箭头 -->
        <div class="absolute w-3 h-3 bg-slate-900 border-l border-b border-slate-600 transform rotate-45 -left-1.5 top-1/2 -translate-y-1/2"></div>
      </div>
    </Teleport>

    <!-- 图例说明 -->
    <div class="bg-slate-800/50 rounded-xl p-4 border border-slate-700/30">
      <div class="flex flex-wrap items-center justify-center gap-6 text-sm">
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 bg-slate-700 rounded"></div>
          <span class="text-slate-400">空货位</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 bg-blue-500/30 border border-blue-500/50 rounded"></div>
          <span class="text-slate-400">有货</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 bg-red-500 border-2 border-red-400 rounded animate-pulse"></div>
          <span class="text-slate-400">目标货位</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, nextTick } from 'vue'
import { getLocations } from '@/api'

// ==================== Props ====================
const props = defineProps({
  targetLocationCode: {
    type: String,
    default: ''
  }
})

// ==================== 库位数据（从API加载）================
const locationData = ref({})

async function loadLocations() {
  try {
    const res = await getLocations()
    if (res.success) {
      // 转换为以 location_code 为 key 的对象
      const data = {}
      res.data.forEach(loc => {
        if (loc.product_name) {
          data[loc.location_code] = {
            productName: loc.product_name,
            attributes: loc.product_attributes ? JSON.parse(loc.product_attributes) : {},
            stock: loc.stock
          }
        }
      })
      locationData.value = data
    }
  } catch (error) {
    console.error('加载库位数据失败:', error)
  }
}

// ==================== 模拟数据（API加载失败时的备用）================
const mockInventoryData = {
  'A-01-01': { productName: '路虎旋钮-黑钻', attributes: '螺纹:M12x1.5', stock: 15 },
  'A-01-03': { productName: '手动挡-水晶标', attributes: 'LOGO:BMW', stock: 28 },
  'A-02-02': { productName: '路虎旋钮-银钻', attributes: '螺纹:M14x1.5', stock: 12 },
  'A-03-04': { productName: '奔驰旋钮-原厂', attributes: '颜色:黑', stock: 6 },
  'A-04-01': { productName: '手动挡-通用', attributes: '螺纹:M10x1.25', stock: 45 },
  'B-01-05': { productName: '奥迪RS旋钮', attributes: 'LOGO:RS', stock: 8 },
  'B-02-01': { productName: '路虎旋钮-白钻', attributes: '螺纹:M12x1.5', stock: 20 },
  'B-02-03': { productName: '手动挡-改装', attributes: 'LOGO:个性化', stock: 18 },
  'B-03-01': { productName: '保时捷旋钮', attributes: '型号:718', stock: 5 },
  'B-03-04': { productName: '奔驰AMG旋钮', attributes: 'LOGO:AMG', stock: 10 },
  'B-04-02': { productName: '通用档把套', attributes: '材质:水晶', stock: 32 }
}

// ==================== 响应式状态 ====================
const locationRefs = reactive({})
const tooltip = reactive({
  visible: false,
  locationCode: '',
  productName: '',
  attributes: '',
  stock: 0,
  x: 0,
  y: 0
})

// ==================== 工具函数 ====================
function setLocationRef(code, el) {
  if (el) {
    locationRefs[code] = el
  }
}

function getLocationData(code) {
  // 优先使用 API 加载的数据，其次使用模拟数据
  return locationData.value[code] || mockInventoryData[code] || null
}

function isTargetLocation(code) {
  return props.targetLocationCode && code === props.targetLocationCode
}

function isOccupied(code) {
  return !!(locationData.value[code] || mockInventoryData[code])
}

// ==================== 样式计算 ====================
function getCellClass(code) {
  const baseClass = 'border '
  
  if (isTargetLocation(code)) {
    // 目标货位 - 红色高亮闪烁
    return baseClass + 'bg-red-500 border-red-400 shadow-lg shadow-red-500/50 animate-pulse text-white'
  }
  
  if (isOccupied(code)) {
    // 有货 - 蓝色
    return baseClass + 'bg-blue-500/30 border-blue-500/50 text-blue-300 hover:bg-blue-500/50 hover:border-blue-400'
  }
  
  // 空货位 - 灰色
  return baseClass + 'bg-slate-700/50 border-slate-600 text-slate-500 hover:bg-slate-700 hover:border-slate-500'
}

// ==================== Tooltip 处理 ====================
function handleHover(code, event) {
  const data = getLocationData(code)
  
  tooltip.locationCode = code
  tooltip.productName = data?.productName || ''
  tooltip.attributes = data?.attributes || ''
  tooltip.stock = data?.stock || 0
  
  // 计算 tooltip 位置
  const rect = event.target.getBoundingClientRect()
  const tooltipWidth = 220
  const tooltipHeight = 150
  
  let x = rect.right + 15
  let y = rect.top + rect.height / 2 - tooltipHeight / 2
  
  // 边界检测
  if (x + tooltipWidth > window.innerWidth) {
    x = rect.left - tooltipWidth - 15
  }
  
  if (y < 10) {
    y = 10
  } else if (y + tooltipHeight > window.innerHeight) {
    y = window.innerHeight - tooltipHeight - 10
  }
  
  tooltip.x = x
  tooltip.y = y
  tooltip.visible = true
}

function hideTooltip() {
  tooltip.visible = false
}

const tooltipStyle = computed(() => ({
  left: `${tooltip.x}px`,
  top: `${tooltip.y}px`
}))

// ==================== Watch 目标库位变化 ====================
watch(() => props.targetLocationCode, (newCode) => {
  if (newCode) {
    // 滚动到目标货位（带动画）
    nextTick(() => {
      const targetEl = locationRefs[newCode]
      if (targetEl && targetEl.scrollIntoView) {
        targetEl.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center'
        })
      }
    })
  }
})

// ==================== 生命周期 ====================
onMounted(async () => {
  // 加载库位数据
  await loadLocations()
  
  // 初始聚焦到目标货位
  if (props.targetLocationCode) {
    nextTick(() => {
      const targetEl = locationRefs[props.targetLocationCode]
      if (targetEl && targetEl.scrollIntoView) {
        setTimeout(() => {
          targetEl.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'center'
          })
        }, 300)
      }
    })
  }
})
</script>

<style scoped>
/* 货位格子 hover 效果增强 */
div[class*="bg-blue-500"]:hover {
  transform: scale(1.05);
}

div[class*="bg-slate-700"]:hover {
  transform: scale(1.05);
}

/* 目标格子动画 */
@keyframes highlight-pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
  }
}

.animate-highlight {
  animation: highlight-pulse 1.5s ease-in-out infinite;
}
</style>
