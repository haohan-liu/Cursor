span<template>
  <div class="min-h-screen p-4 md:p-6 space-y-6 transition-colors duration-300 pb-24 md:pb-6">

    <!-- ===== 顶栏 ===== -->
    <div class="bg-white/90 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-4 md:p-5 shadow-sm dark:shadow-xl border border-gray-200 dark:border-slate-700/50">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 class="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
            <span class="md:hidden">库位</span>
            <span class="hidden md:inline">库位地图</span>
          </h1>
          <p class="text-gray-500 dark:text-slate-400 text-sm">Warehouse Map · 实时库存可视化</p>
        </div>
        <div class="flex items-center gap-2 md:gap-3 flex-1">
          <div class="relative flex-1 min-w-0">
            <input
              v-model="searchKeyword"
              @input="handleSearch"
              type="text"
              placeholder="输入 SKU 或商品名称..."
              class="pl-9 pr-4 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none w-full"
            />
            <svg class="w-4 h-4 text-gray-400 dark:text-slate-500 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button
            @click="addShelf"
            class="px-3 py-2 md:px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium text-sm transition-colors flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 whitespace-nowrap"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>新增</span>
          </button>
        </div>
      </div>
      <!-- 搜索结果 -->
      <div v-if="searchResult" class="mt-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between gap-3">
        <div class="flex flex-wrap gap-x-3 gap-y-1 text-sm">
          <span class="text-amber-400 font-medium">找到商品：</span>
          <span class="text-gray-900 dark:text-white">{{ searchResult.name }}</span>
          <span class="text-gray-400 dark:text-slate-400 font-mono text-xs self-center">{{ searchResult.sku_code }}</span>
          <span class="text-gray-500 dark:text-slate-400">库位：<span class="text-blue-400 font-mono">{{ searchResult.location_code || '未分配' }}</span></span>
          <span class="text-gray-500 dark:text-slate-400">库存：<span class="text-emerald-400 font-bold">{{ searchResult.current_stock }} 件</span></span>
        </div>
        <button @click="clearSearch" class="text-gray-400 hover:text-gray-700 dark:hover:text-white flex-shrink-0">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- ===== 空态 ===== -->
    <div v-if="shelves.length === 0 && !isLoadingShelves" class="bg-white/50 dark:bg-slate-800/50 rounded-2xl p-12 text-center border border-dashed border-gray-300 dark:border-slate-700">
      <svg class="w-16 h-16 mx-auto text-gray-300 dark:text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
      <p class="text-gray-500 dark:text-slate-400 text-lg font-medium">还没有货架</p>
      <p class="text-gray-400 dark:text-slate-600 text-sm mt-1">点击右上角「新增货架」开始配置</p>
    </div>

    <!-- ===== 加载状态 ===== -->
    <div v-if="isLoadingShelves" class="bg-white/50 dark:bg-slate-800/50 rounded-2xl p-12 text-center border border-dashed border-gray-300 dark:border-slate-700">
      <div class="flex flex-col items-center gap-3">
        <div class="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p class="text-gray-500 dark:text-slate-400 text-sm">加载货架配置中...</p>
      </div>
    </div>

    <!-- ===== 货架列表 ===== -->
    <div
      v-for="(shelf, idx) in shelves"
      :key="shelf.id"
      v-show="!isLoadingShelves"
      class="bg-white/90 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-4 md:p-5 shadow-sm dark:shadow-xl border border-gray-200 dark:border-slate-700/50"
    >
      <!-- 货架标题：左侧徽章+名称，右侧图标操作组 -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-3">
          <div :class="shelfBadgeClass(idx)" class="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
            <span class="text-white font-bold text-sm">{{ shelf.id }}</span>
          </div>
          <div>
            <h2 class="text-base font-bold text-gray-900 dark:text-white leading-tight">货架 {{ shelf.id }}</h2>
            <p class="text-gray-400 dark:text-slate-500 text-xs">{{ shelf.rows.length }} 层，每层独立列数</p>
          </div>
        </div>

        <!-- 紧凑图标操作按钮组 -->
        <div class="flex items-center gap-1.5">
          <!-- 增加层 -->
          <button
            @click="addRowToShelf(shelf)"
            title="增加一层（从底部添加）"
            class="w-8 h-8 rounded-lg border flex items-center justify-center transition-all duration-150 active:scale-90
                   bg-emerald-500/10 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/25 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-400 dark:hover:bg-emerald-500/25"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <!-- 减少层（移除顶层） -->
          <button
            @click="removeTopRow(shelf)"
            :disabled="shelf.rows.length <= 1"
            title="减少一层（移除顶层）"
            class="w-8 h-8 rounded-lg border flex items-center justify-center transition-all duration-150 active:scale-90
                   bg-amber-500/10 border-amber-500/30 text-amber-500 hover:bg-amber-500/25 dark:text-amber-400
                   disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M20 12H4" />
            </svg>
          </button>
          <!-- 分隔线 -->
          <div class="w-px h-5 bg-gray-300 dark:bg-slate-600 mx-0.5"></div>
          <!-- 删除货架 -->
          <button
            @click="deleteShelf(shelf)"
            title="删除此货架"
            class="w-8 h-8 rounded-lg border flex items-center justify-center transition-all duration-150 active:scale-90
                   bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/25"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <!-- 物理货架视图：高层在上，低层在下；每行 flex 等宽填满 -->
      <div class="w-full">
        <div class="flex flex-col gap-1.5">

          <div
            v-for="rowDesc in descRowsForShelf(shelf)"
            :key="rowDesc.rowIndex"
            class="flex items-stretch gap-1"
          >
            <!-- 层标签 -->
            <div class="w-9 flex-shrink-0 flex items-center justify-end text-[10px] text-gray-400 dark:text-slate-500 font-medium pr-1 leading-none self-center">
              {{ rowDesc.rowNum }}层
            </div>

            <!-- 货位格子：flex-1 平分行宽 -->
            <div
              v-for="col in rowDesc.cols"
              :key="col"
              :ref="el => setLocationRef(cellCode(shelf.id, rowDesc.rowNum, col), el)"
              @mouseenter="handleHover(cellCode(shelf.id, rowDesc.rowNum, col), $event)"
              @mouseleave="hideTooltip"
              @click="handleCellClick(cellCode(shelf.id, rowDesc.rowNum, col))"
              :class="getCellClass(cellCode(shelf.id, rowDesc.rowNum, col))"
              class="flex-1 min-w-0 h-12 md:h-14 rounded-lg cursor-pointer transition-all duration-200 flex flex-col items-center justify-center overflow-hidden select-none border"
            >
              <!-- 库位编码：强制单行不换行 -->
              <div class="flex flex-row flex-nowrap items-center gap-0">
                <span class="text-[7px] md:text-[9px] font-mono font-semibold leading-tight tracking-tighter">
                  {{ shelf.id }}-{{ String(rowDesc.rowNum).padStart(2,'0') }}-{{ String(col).padStart(2,'0') }}
                </span>
              </div>
              <span v-if="hasStock(cellCode(shelf.id, rowDesc.rowNum, col))" class="text-[7px] md:text-[8px] mt-0.5 font-bold leading-tight tracking-tight text-blue-400">
                ×{{ getLocationData(cellCode(shelf.id, rowDesc.rowNum, col))?.stock }}
              </span>
            </div>

            <!-- 行末 + 按钮（增加此行一列） -->
            <div
              @click="addColToRow(shelf, rowDesc.rowIndex)"
              title="给这一层增加一个格子"
              class="w-8 flex-shrink-0 h-14 rounded-lg cursor-pointer border flex flex-col items-center justify-center transition-all duration-200 active:scale-90 select-none
                     bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30 text-emerald-500 dark:text-emerald-400
                     hover:bg-emerald-100 dark:hover:bg-emerald-500/20 hover:border-emerald-400 dark:hover:border-emerald-400"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
              </svg>
            </div>

            <!-- 行末 - 按钮（减少此行一列） -->
            <div
              v-if="rowDesc.cols > 1"
              @click="removeColFromRow(shelf, rowDesc.rowIndex)"
              title="移除这一层最后一个格子"
              class="w-8 flex-shrink-0 h-14 rounded-lg cursor-pointer border flex flex-col items-center justify-center transition-all duration-200 active:scale-90 select-none
                     bg-red-50 dark:bg-red-500/10 border-red-300 dark:border-red-500/30 text-red-400 dark:text-red-400
                     hover:bg-red-100 dark:hover:bg-red-500/20 hover:border-red-400"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M20 12H4" />
              </svg>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- ===== Tooltip ===== -->
    <Teleport to="body">
      <div
        v-if="tooltip.visible"
        :style="tooltipStyle"
        class="fixed z-50 bg-slate-900/95 backdrop-blur-sm border border-slate-600 rounded-xl p-4 shadow-2xl pointer-events-none"
      >
        <div class="space-y-2 min-w-[180px]">
          <div class="flex items-center gap-2 pb-2 border-b border-slate-700">
            <span class="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs font-medium rounded font-mono">
              {{ tooltip.locationCode }}
            </span>
          </div>
          <div v-if="tooltip.productName">
            <div class="text-white font-medium text-sm">{{ tooltip.productName }}</div>
            <div class="text-slate-400 text-xs mt-0.5">{{ tooltip.skuCode }}</div>
            <div v-if="tooltip.attributes" class="text-slate-400 text-xs mt-0.5">{{ tooltip.attributes }}</div>
            <div class="flex items-center justify-between mt-2 pt-2 border-t border-slate-700">
              <span class="text-slate-400 text-xs">库存</span>
              <span class="text-amber-400 font-bold">{{ tooltip.stock }} 件</span>
            </div>
          </div>
          <div v-else class="text-slate-500 text-sm">空货位</div>
        </div>
        <div class="absolute w-3 h-3 bg-slate-900 border-l border-b border-slate-600 transform rotate-45 -left-1.5 top-1/2 -translate-y-1/2"></div>
      </div>
    </Teleport>

    <!-- ===== 图例 ===== -->
    <div class="bg-white/50 dark:bg-slate-800/50 rounded-xl p-3 border border-gray-200 dark:border-slate-700/30">
      <div class="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs">
        <div class="flex items-center gap-2">
          <div class="w-5 h-5 bg-gray-100 dark:bg-slate-700/80 border border-gray-300 dark:border-slate-600 rounded"></div>
          <span class="text-gray-500 dark:text-slate-400">空货位</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-5 h-5 bg-blue-500/25 border border-blue-400/50 rounded"></div>
          <span class="text-gray-500 dark:text-slate-400">有货</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-5 h-5 bg-red-500 border-2 border-red-400 rounded animate-pulse"></div>
          <span class="text-gray-500 dark:text-slate-400">搜索目标</span>
        </div>
        <div class="flex items-center gap-1.5 text-gray-500 dark:text-slate-400">
          <svg class="w-3.5 h-3.5 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="4" stroke-width="2.5"/>
            <path stroke-width="2" d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
          </svg>
          <span>总库存: {{ totalStock }} 件</span>
        </div>
        <div class="flex items-center gap-1.5 text-gray-400 dark:text-slate-500">
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {{ lastUpdateTime || '获取中...' }}
        </div>
      </div>
    </div>

    <!-- ===== 红色警告弹窗 ===== -->
    <Teleport to="body">
      <transition name="fade">
        <div
          v-if="warningDialog.visible"
          class="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center backdrop-blur-sm"
          @click.self="warningDialog.visible = false"
        >
          <div class="bg-white dark:bg-slate-800 border border-red-500/50 rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4">
            <div class="flex items-start gap-4 mb-4">
              <div class="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              </div>
              <div>
                <h3 class="text-red-400 font-bold text-base mb-1">操作失败</h3>
                <p class="text-gray-600 dark:text-slate-300 text-sm leading-relaxed">{{ warningDialog.message }}</p>
                <div v-if="warningDialog.conflictCodes.length" class="mt-2 flex flex-wrap gap-1.5">
                  <span
                    v-for="code in warningDialog.conflictCodes"
                    :key="code"
                    class="px-2 py-0.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded font-mono text-xs"
                  >{{ code }}</span>
                </div>
              </div>
            </div>
            <button
              @click="warningDialog.visible = false"
              class="w-full py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-colors text-sm"
            >
              我知道了
            </button>
          </div>
        </div>
      </transition>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { getLocations, getProductList } from '@/apis'

// ==================== 货架配置持久化（使用 localStorage） ====================
const SHELF_CONFIG_KEY = 'warehouse_shelf_config'

function loadShelfConfigFromStorage() {
  try {
    const saved = localStorage.getItem(SHELF_CONFIG_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length > 0) {
        console.log('[货架配置] 从本地存储加载')
        return parsed
      }
    }
  } catch (error) {
    console.error('[货架配置] 读取本地存储失败:', error)
  }
  return null
}

function saveShelfConfigToStorage(data) {
  try {
    localStorage.setItem(SHELF_CONFIG_KEY, JSON.stringify(data))
    console.log('[货架配置] 已保存到本地存储')
  } catch (error) {
    console.error('[货架配置] 保存到本地存储失败:', error)
  }
}

// ==================== 货架数据结构 ====================
// rows 是数组，rows[i] = { cols: N }，每层可独立调整列数
// rows[0] = 第1层（物理最底层），rows[n-1] = 最顶层
// 默认配置
const DEFAULT_SHELVES = [
  { id: 'A', rows: [{ cols: 5 }, { cols: 5 }, { cols: 5 }, { cols: 5 }] },
  { id: 'B', rows: [{ cols: 5 }, { cols: 5 }, { cols: 5 }, { cols: 5 }] }
]

const shelves = ref([])
const isLoadingShelves = ref(true)

const SHELF_COLORS = [
  'bg-gradient-to-br from-blue-500 to-cyan-600',
  'bg-gradient-to-br from-purple-500 to-pink-600',
  'bg-gradient-to-br from-amber-500 to-orange-600',
  'bg-gradient-to-br from-emerald-500 to-teal-600',
  'bg-gradient-to-br from-rose-500 to-red-600',
  'bg-gradient-to-br from-indigo-500 to-violet-600',
]
function shelfBadgeClass(idx) {
  return SHELF_COLORS[idx % SHELF_COLORS.length]
}

function nextShelfId() {
  const used = new Set(shelves.value.map(s => s.id))
  for (let i = 0; i < 26; i++) {
    const letter = String.fromCharCode(65 + i)
    if (!used.has(letter)) return letter
  }
  return `S${shelves.value.length + 1}`
}

// 从高层到低层（视觉从上到下）返回行描述符数组
function descRowsForShelf(shelf) {
  return shelf.rows
    .map((row, i) => ({ rowNum: i + 1, cols: row.cols, rowIndex: i }))
    .reverse()
}

function cellCode(shelfId, rowNum, col) {
  return `${shelfId}-${String(rowNum).padStart(2, '0')}-${String(col).padStart(2, '0')}`
}

// ==================== 货架配置加载与保存 ====================
function loadShelfConfig() {
  try {
    isLoadingShelves.value = true
    console.log('[货架配置] 正在加载...')
    const saved = loadShelfConfigFromStorage()
    if (saved) {
      shelves.value = saved
      console.log('[货架配置] 已加载:', JSON.stringify(shelves.value))
    } else {
      console.log('[货架配置] 本地存储无数据，使用默认配置')
      shelves.value = JSON.parse(JSON.stringify(DEFAULT_SHELVES))
      saveShelfConfigToStorage(shelves.value)
    }
  } catch (error) {
    console.error('[货架配置] 加载失败:', error)
    shelves.value = JSON.parse(JSON.stringify(DEFAULT_SHELVES))
  } finally {
    isLoadingShelves.value = false
  }
}

let saveDebounceTimer = null
function persistShelfConfig() {
  if (isLoadingShelves.value) {
    console.log('[货架配置] 正在加载中，跳过保存')
    return
  }
  saveShelfConfigToStorage(shelves.value)
}

function debouncedSave() {
  if (saveDebounceTimer) clearTimeout(saveDebounceTimer)
  saveDebounceTimer = setTimeout(() => {
    console.log('[货架配置] 防抖触发，开始保存')
    persistShelfConfig()
  }, 300)
}
const locationData        = ref({})
const productList         = ref([])

// 计算所有货架的总库存
const totalStock = computed(() => {
  return Object.values(locationData.value).reduce((sum, loc) => {
    return sum + (loc?.stock || 0)
  }, 0)
})
const searchKeyword       = ref('')
const searchResult        = ref(null)
const highlightedLocation = ref('')
const lastUpdateTime      = ref('')

function formatNow() {
  const d = new Date()
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

async function loadData() {
  try {
    const [locationsRes, productsRes] = await Promise.all([
      getLocations(),
      getProductList({ pageSize: 1000 })
    ])
    if (productsRes.success) productList.value = productsRes.data || []

    if (locationsRes.success) {
      const data = {}
      locationsRes.data.forEach(loc => {
        if (loc.product_id && loc.location_code) {
          const product = productList.value.find(p => p.id === loc.product_id)
          if (product) {
            data[loc.location_code] = {
              productId:   product.id,
              productName: product.name,
              skuCode:     product.sku_code,
              attributes:  product.attributes
                ? (typeof product.attributes === 'string' ? product.attributes : JSON.stringify(product.attributes))
                : '',
              stock: loc.stock ?? product.current_stock ?? 0
            }
          }
        }
      })
      locationData.value = data
    }
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    lastUpdateTime.value = formatNow()
  }
}

// ==================== 警告弹窗 ====================
const warningDialog = reactive({ visible: false, message: '', conflictCodes: [] })

function showWarning(message, conflictCodes = []) {
  warningDialog.message       = message
  warningDialog.conflictCodes = conflictCodes
  warningDialog.visible       = true
}

// ==================== 货架操作 ====================

function addShelf() {
  const id = nextShelfId()
  shelves.value.push({ id, rows: [{ cols: 5 }, { cols: 5 }, { cols: 5 }, { cols: 5 }] })
  debouncedSave()
}

function deleteShelf(shelf) {
  const occupied = getOccupiedInShelf(shelf)
  if (occupied.length > 0) {
    showWarning(`货架 ${shelf.id} 仍有商品库存，请先清空所有库位或调拨后再删除。`, occupied)
    return
  }
  shelves.value = shelves.value.filter(s => s.id !== shelf.id)
  debouncedSave()
}

/** 增加一层：在底部追加，cols 默认与底层相同 */
function addRowToShelf(shelf) {
  const defaultCols = shelf.rows.length > 0 ? shelf.rows[0].cols : 5
  shelf.rows.push({ cols: defaultCols })
  debouncedSave()
}

/** 减少顶层（rows 数组最后一项 = 物理最顶层） */
function removeTopRow(shelf) {
  if (shelf.rows.length <= 1) return
  const topRowIndex = shelf.rows.length - 1
  const occupied = getOccupiedInRow(shelf, topRowIndex)
  if (occupied.length > 0) {
    showWarning(`第 ${topRowIndex + 1} 层仍有商品库存，请先清空该层库位后再减少层数。`, occupied)
    return
  }
  shelf.rows.pop()
  debouncedSave()
}

/** 给某行增加一列 */
function addColToRow(shelf, rowIndex) {
  shelf.rows[rowIndex].cols++
  debouncedSave()
}

/** 给某行减少一列（检查最后一格是否有货） */
function removeColFromRow(shelf, rowIndex) {
  const row = shelf.rows[rowIndex]
  if (row.cols <= 1) return
  const rowNum   = rowIndex + 1
  const lastCol  = row.cols
  const code     = cellCode(shelf.id, rowNum, lastCol)
  if (hasStock(code)) {
    showWarning(`库位 ${code} 仍有商品库存，请先清空后再缩减格子。`, [code])
    return
  }
  row.cols--
  debouncedSave()
}

// ==================== 安全检查辅助 ====================
function getOccupiedInRow(shelf, rowIndex) {
  const rowNum = rowIndex + 1
  const cols   = shelf.rows[rowIndex].cols
  const codes  = []
  for (let col = 1; col <= cols; col++) {
    const code = cellCode(shelf.id, rowNum, col)
    if (hasStock(code)) codes.push(code)
  }
  return codes
}

function getOccupiedInShelf(shelf) {
  const codes = []
  for (let i = 0; i < shelf.rows.length; i++) {
    const rowNum = i + 1
    for (let col = 1; col <= shelf.rows[i].cols; col++) {
      const code = cellCode(shelf.id, rowNum, col)
      if (hasStock(code)) codes.push(code)
    }
  }
  return codes
}

// ==================== 搜索 ====================
function handleSearch() {
  const kw = searchKeyword.value.trim().toLowerCase()
  if (!kw) { clearSearch(); return }

  const found = productList.value.find(p =>
    p.sku_code?.toLowerCase().includes(kw) ||
    p.name?.toLowerCase().includes(kw)
  )

  if (found) {
    searchResult.value = found
    const entry = Object.entries(locationData.value).find(([, d]) => d.productId === found.id)
    if (entry) {
      highlightedLocation.value = entry[0]
      nextTick(() => {
        const el = locationRefs[highlightedLocation.value]
        el?.scrollIntoView?.({ behavior: 'smooth', block: 'center', inline: 'center' })
      })
    } else {
      highlightedLocation.value = ''
    }
  } else {
    searchResult.value = null
    highlightedLocation.value = ''
  }
}

function clearSearch() {
  searchKeyword.value       = ''
  searchResult.value        = null
  highlightedLocation.value = ''
}

function handleCellClick(code) {
  if (getLocationData(code)) console.log('库位:', code, getLocationData(code))
}

// ==================== 工具函数 ====================
const locationRefs = reactive({})

function setLocationRef(code, el) {
  if (el) locationRefs[code] = el
}

function getLocationData(code) { return locationData.value[code] || null }
function isOccupied(code)      { return !!locationData.value[code] }
function hasStock(code) {
  const d = locationData.value[code]
  return !!(d && (d.stock || 0) > 0)
}

// ==================== 格子样式 ====================
function getCellClass(code) {
  if (highlightedLocation.value && code === highlightedLocation.value) {
    return 'bg-red-500 border-red-400 shadow-lg shadow-red-500/40 animate-pulse text-white'
  }
  if (hasStock(code)) {
    return 'bg-blue-500/20 dark:bg-blue-500/25 border-blue-400 dark:border-blue-500/50 text-blue-600 dark:text-blue-300 hover:bg-blue-500/35 hover:scale-105'
  }
  if (isOccupied(code)) {
    return 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30 text-blue-400 hover:bg-blue-100 hover:scale-105'
  }
  return 'bg-gray-100 dark:bg-slate-700/50 border-gray-200 dark:border-slate-600 text-gray-400 dark:text-slate-500 hover:bg-gray-200 dark:hover:bg-slate-700 hover:scale-105'
}

// ==================== Tooltip ====================
const tooltip = reactive({
  visible: false, locationCode: '',
  productName: '', skuCode: '', attributes: '', stock: 0,
  x: 0, y: 0
})

function handleHover(code, event) {
  const data = getLocationData(code)
  tooltip.locationCode = code
  tooltip.productName  = data?.productName || ''
  tooltip.skuCode      = data?.skuCode || ''
  tooltip.attributes   = data?.attributes || ''
  tooltip.stock        = data?.stock || 0

  const rect = event.target.getBoundingClientRect()
  const TW = 220, TH = 160
  let x = rect.right + 12
  let y = rect.top + rect.height / 2 - TH / 2
  if (x + TW > window.innerWidth)       x = rect.left - TW - 12
  if (y < 8)                             y = 8
  else if (y + TH > window.innerHeight)  y = window.innerHeight - TH - 8

  tooltip.x = x; tooltip.y = y; tooltip.visible = true
}

function hideTooltip() { tooltip.visible = false }

const tooltipStyle = computed(() => ({ left: `${tooltip.x}px`, top: `${tooltip.y}px` }))

// ==================== 生命周期 ====================
onMounted(() => {
  loadShelfConfig()
  loadData()
})

// 组件销毁前确保保存数据
onBeforeUnmount(() => {
  if (saveDebounceTimer) {
    clearTimeout(saveDebounceTimer)
    saveDebounceTimer = null
  }
  console.log('[货架配置] 组件即将销毁，执行最终保存')
  saveShelfConfigToStorage(shelves.value)
  console.log('[货架配置] 最终保存完成')
})

// 监听 shelves 变化，确保每次修改都被保存
watch(shelves, (newVal, oldVal) => {
  if (isLoadingShelves.value) return
  console.log('[货架配置] 检测到变化，保存中...')
  saveShelfConfigToStorage(shelves.value)
}, { deep: true })
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to       { opacity: 0; }

::-webkit-scrollbar { height: 4px; width: 4px; }
::-webkit-scrollbar-track  { background: rgba(30, 41, 59, 0.2); }
::-webkit-scrollbar-thumb  { background: rgba(71, 85, 105, 0.4); border-radius: 2px; }
</style>
