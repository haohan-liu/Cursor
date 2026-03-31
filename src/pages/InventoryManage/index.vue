<template>
  <!-- 骨架屏加载状态 -->
  <div v-if="isLoading" class="min-h-screen w-full h-full block p-4 md:p-6 space-y-6">
    <div class="max-w-7xl mx-auto">
      <!-- 标题栏骨架 -->
      <div class="bg-white dark:bg-slate-800/80 rounded-2xl p-4 flex justify-between items-center">
        <div class="flex items-center gap-3">
          <div class="skeleton w-12 h-12 rounded-xl"></div>
          <div>
            <div class="skeleton h-6 w-40 mb-2"></div>
            <div class="skeleton h-4 w-24"></div>
          </div>
        </div>
        <div class="flex gap-2">
          <div class="skeleton h-10 w-20 rounded-lg"></div>
          <div class="skeleton h-10 w-24 rounded-lg"></div>
        </div>
      </div>

      <!-- 表格骨架 -->
      <div class="bg-white dark:bg-slate-800/80 rounded-2xl mt-6 overflow-hidden">
        <div class="p-4 border-b border-gray-200 dark:border-slate-700">
          <div class="skeleton h-6 w-32 mb-3"></div>
          <div class="flex gap-3">
            <div class="skeleton h-9 w-32 rounded-lg"></div>
            <div class="skeleton h-9 w-48 rounded-lg"></div>
          </div>
        </div>
        <div class="p-4 space-y-3">
          <div v-for="i in 5" :key="i" class="skeleton h-12 w-full rounded"></div>
        </div>
      </div>
    </div>
  </div>

  <!-- 正常内容 -->
  <div v-else class="min-h-screen w-full h-full block p-4 md:p-6 space-y-6 transition-colors duration-300 pb-24 md:pb-6">
    <div class="max-w-7xl mx-auto bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm dark:shadow-xl border border-gray-200 dark:border-slate-700/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <div>
          <h1 class="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">入库与库存管理</h1>
          <p class="text-gray-500 dark:text-slate-400 text-sm">Inventory Management</p>
        </div>
      </div>
      <div class="flex gap-2 items-center">
        <button 
          @click="handleExport" 
          :disabled="isExporting"
          class="px-3 py-2 md:px-4 md:py-2 bg-green-500 hover:bg-green-600 disabled:bg-green-400 text-white rounded-lg font-medium transition-all flex items-center gap-2 whitespace-nowrap active:scale-95 disabled:active:scale-100"
        >
          <svg v-if="!isExporting" class="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          <svg v-else class="w-4 h-4 md:w-5 md:h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <span class="hidden sm:inline">{{ isExporting ? '导出中...' : '导出库存' }}</span>
          <span class="sm:hidden">{{ isExporting ? '导出中' : '导出' }}</span>
        </button>
        <button @click="openAddDialog" class="px-3 py-2 md:px-4 md:py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2 whitespace-nowrap">
          <svg class="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
          <span class="hidden sm:inline">手动新增产品</span>
          <span class="sm:hidden">新增</span>
        </button>
      </div>
    </div>

    <div class="max-w-7xl mx-auto">
      <div class="bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-sm dark:shadow-xl border border-gray-200 dark:border-slate-700/50 overflow-hidden flex flex-col">
        <div class="p-4 border-b border-gray-200 dark:border-slate-700/50 flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-2 flex-wrap">
            <h2 class="text-lg font-bold text-gray-900 dark:text-white">当前库存明细</h2>
            <span class="text-xs text-gray-400 dark:text-slate-500">{{ filteredList.length }} 条</span>
          </div>
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <!-- 大类筛选（自定义下拉） -->
            <div ref="categoryDropdownRef" class="relative w-full sm:w-auto">
              <div
                @click="toggleCategoryDropdown"
                class="flex items-center gap-2 border border-gray-300 dark:border-slate-700 rounded-lg py-2 pl-3 pr-8 cursor-pointer bg-white dark:bg-slate-800 hover:border-gray-400 dark:hover:border-slate-600 transition-colors min-w-[120px]"
              >
                <span :class="filterCategory ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-slate-500'" class="text-sm truncate">
                  {{ filterCategory || '全部大类' }}
                </span>
              </div>
              <!-- 自定义下拉箭头 -->
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 dark:text-slate-400">
                <svg class="w-4 h-4 transition-transform" :class="{ 'rotate-180': showCategoryDropdown }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <!-- 下拉选项列表 -->
              <ul
                v-if="showCategoryDropdown"
                class="absolute z-20 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg max-h-60 overflow-y-auto"
              >
                <li
                  :class="[
                    'px-3 py-2 cursor-pointer text-sm',
                    filterCategory === ''
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                  ]"
                  @click="selectCategory('')"
                >
                  全部大类
                </li>
                <li
                  v-for="cat in availableCategories"
                  :key="cat"
                  :class="[
                    'px-3 py-2 cursor-pointer text-sm',
                    filterCategory === cat
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                  ]"
                  @click="selectCategory(cat)"
                >
                  {{ cat }}
                </li>
              </ul>
            </div>
            <!-- 关键词搜索 -->
            <div class="relative flex-1 sm:flex-none">
              <input v-model="searchKeyword" type="text" placeholder="搜索产品名称或条码..." class="pl-9 pr-4 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white text-sm focus:ring-1 focus:ring-blue-500 outline-none w-full sm:w-52">
              <svg class="w-4 h-4 text-gray-400 dark:text-slate-500 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
          </div>
        </div>

        <div class="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 flex-1">
          <div class="min-w-[700px] sm:min-w-0">
            <table class="w-full text-left border-collapse">
              <thead class="bg-gray-50 dark:bg-slate-900/50 text-gray-500 dark:text-slate-400 text-sm">
                <tr>
                  <th class="p-3 font-medium whitespace-nowrap">SKU条码</th>
                  <th class="p-3 font-medium whitespace-nowrap">商品名称</th>
                  <th class="p-3 font-medium whitespace-nowrap">规格属性</th>
                  <th class="p-3 font-medium whitespace-nowrap">库位号</th>
                  <th class="p-3 font-medium whitespace-nowrap text-right">成本价</th>
                  <th class="p-3 font-medium whitespace-nowrap text-center">当前库存</th>
                  <th class="p-3 font-medium whitespace-nowrap text-center">安全库存</th>
                  <th class="p-3 font-medium whitespace-nowrap">备注</th>
                  <th class="p-3 font-medium whitespace-nowrap text-center">操作</th>
                </tr>
              </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-slate-700/50 text-sm">
              <tr v-for="item in filteredList" :key="item.id" class="hover:bg-gray-50 dark:hover:bg-slate-700/20 transition-colors">
                <!-- SKU -->
                <td class="p-3 whitespace-nowrap">
                  <span class="text-blue-400 font-mono text-xs">{{ item.sku_code }}</span>
                </td>
                <!-- 商品名称 -->
                <td class="p-3 whitespace-nowrap">
                  <div class="text-gray-900 dark:text-white font-medium text-sm">{{ item.name }}</div>
                </td>
                <!-- 规格属性标签 -->
                <td class="p-3">
                  <div class="flex flex-wrap gap-1 max-w-[220px]">
                    <template v-if="parseAttrsToTags(item.attributes).length">
                      <span
                        v-for="(tag, ti) in parseAttrsToTags(item.attributes)"
                        :key="ti"
                        class="inline-flex items-center px-1.5 py-0.5 bg-gray-100 dark:bg-slate-700/60 text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-slate-600/60 rounded text-[10px] whitespace-nowrap"
                      >{{ tag.key }}: {{ tag.val }}</span>
                    </template>
                    <span v-else class="text-gray-400 dark:text-slate-600 text-xs">—</span>
                  </div>
                </td>
                <!-- 库位号 -->
                <td class="p-3 whitespace-nowrap">
                  <span class="px-2 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded font-mono text-xs">{{ item.location_code || '-' }}</span>
                </td>
                <!-- 成本价 -->
                <td class="p-3 whitespace-nowrap text-right text-gray-600 dark:text-slate-300">¥{{ item.cost_price }}</td>
                <!-- 当前库存 -->
                <td class="p-3 whitespace-nowrap text-center">
                  <span :class="item.current_stock <= item.safe_stock ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'">{{ item.current_stock }}</span>
                </td>
                <!-- 安全库存 -->
                <td class="p-3 whitespace-nowrap text-center text-gray-400 dark:text-slate-500 text-xs">{{ item.safe_stock ?? '—' }}</td>
                <!-- 备注 -->
                <td class="p-3">
                  <div class="max-w-xs truncate text-gray-500 dark:text-slate-400 text-xs" :title="item.remark || ''">{{ item.remark || '—' }}</div>
                </td>
                <!-- 操作 -->
                <td class="p-3 whitespace-nowrap text-center">
                  <button @click="openPrintDialog(item)" class="text-amber-400 hover:text-amber-300 mr-2 text-xs transition-colors">打印标签</button>
                  <button @click="openEditDialog(item)" class="text-blue-400 hover:text-blue-300 mr-2 text-xs transition-colors">编辑</button>
                  <button @click="handleDelete(item)" class="text-red-400 hover:text-red-300 text-xs transition-colors btn-ripple">删除</button>
                </td>
              </tr>
            </tbody>
          </table>
          </div>
          <div v-if="filteredList.length === 0" class="text-center py-12 text-gray-400 dark:text-slate-500">
            {{ inventoryList.length === 0 ? '暂无库存数据' : '没有符合条件的商品' }}
          </div>
        </div>
      </div>
    </div>


    <!-- 打印标签弹窗 -->
    <Teleport to="body">
      <transition name="fade">
        <div v-if="showPrintDialog" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" @click.self="closePrintDialog">
          <div class="bg-white dark:bg-slate-800 rounded-2xl p-5 w-full max-w-md mx-4 border border-gray-200 dark:border-slate-600 shadow-2xl">

            <!-- 标题栏 -->
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="text-base font-bold text-gray-900 dark:text-white">打印库位标签</h3>
                <p class="text-gray-400 dark:text-slate-500 text-xs mt-0.5">{{ printItem?.name }}</p>
              </div>
              <button @click="closePrintDialog" class="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <!-- 尺寸模板切换 -->
            <div class="flex gap-2 mb-4">
              <button
                @click="switchLabelSize('40x30')"
                :class="printLabelSize === '40x30'
                  ? 'bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/25'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-600 hover:bg-gray-200 dark:hover:bg-slate-600'"
                class="flex-1 py-2.5 text-xs font-semibold border rounded-xl transition-all"
              >
                <div>40mm × 30mm</div>
                <div class="text-[10px] opacity-70 font-normal mt-0.5">正方形标签</div>
              </button>
              <button
                @click="switchLabelSize('70x20')"
                :class="printLabelSize === '70x20'
                  ? 'bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/25'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-600 hover:bg-gray-200 dark:hover:bg-slate-600'"
                class="flex-1 py-2.5 text-xs font-semibold border rounded-xl transition-all"
              >
                <div>70mm × 20mm</div>
                <div class="text-[10px] opacity-70 font-normal mt-0.5">宽扁型标签</div>
              </button>
            </div>

            <!-- 预览区（Canvas 等比绘制） -->
            <div class="bg-gray-100 dark:bg-slate-900 rounded-xl p-4 mb-3 flex flex-col items-center gap-2">
              <span class="text-[10px] text-gray-400 dark:text-slate-500">实际比例预览</span>
              <!-- 40×30 预览 canvas：200×150px，对应 40×30mm（1mm=5px） -->
              <canvas
                v-if="printLabelSize === '40x30'"
                ref="canvas40Ref"
                width="200"
                height="150"
                style="width:200px;height:150px;border:2px solid #9ca3af;border-radius:6px;"
              />
              <!-- 70×20 预览 canvas：350×100px，对应 70×20mm（1mm=5px） -->
              <canvas
                v-else
                ref="canvas70Ref"
                width="350"
                height="100"
                style="width:350px;height:100px;border:2px solid #9ca3af;border-radius:6px;"
              />
            </div>

            <!-- 操作按钮 -->
            <div class="flex gap-3">
              <button @click="closePrintDialog" class="flex-1 py-2.5 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-300 rounded-xl font-medium text-sm transition-colors">
                取消
              </button>
              <button @click="generatePrintPdf(printItem, printLabelSize)" class="flex-1 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-1.5">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                </svg>
                打印标签
              </button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- 删除确认弹窗 - 增强防误触 -->
    <Teleport to="body">
      <transition name="fade">
        <div
          v-if="showDeleteConfirm"
          class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          @click.self="cancelDelete"
        >
          <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md mx-4 border border-red-500/30 shadow-2xl">
            <div class="flex items-center gap-4 mb-5">
              <div class="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg class="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-bold text-gray-900 dark:text-white">确认删除</h3>
                <p class="text-gray-500 dark:text-slate-400 text-sm mt-1">此操作不可恢复</p>
              </div>
            </div>

            <div class="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl p-3 mb-4">
              <div class="flex items-center gap-2 text-sm">
                <span class="text-gray-600 dark:text-slate-300">商品：</span>
                <span class="text-red-500 font-medium">{{ pendingDeleteItem?.name }}</span>
              </div>
              <div class="flex items-center gap-2 text-sm mt-1">
                <span class="text-gray-600 dark:text-slate-300">SKU：</span>
                <span class="text-gray-500 dark:text-slate-400 font-mono text-xs">{{ pendingDeleteItem?.sku_code }}</span>
              </div>
            </div>

            <div class="mb-5">
              <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                请输入 <span class="text-red-500 font-bold">{{ pendingDeleteItem?.name }}</span> 确认删除
              </label>
              <input
                v-model="deleteConfirmInput"
                type="text"
                class="w-full border border-red-300 dark:border-red-500/50 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white dark:bg-slate-700 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                placeholder="请输入商品名称"
                @keyup.enter="confirmDelete"
              />
            </div>

            <div class="flex gap-3">
              <button
                @click="cancelDelete"
                class="flex-1 px-4 py-2.5 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-300 rounded-xl font-medium transition-colors"
              >
                取消
              </button>
              <button
                @click="confirmDelete"
                :disabled="deleteConfirmInput.trim() !== pendingDeleteItem?.name"
                class="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 dark:disabled:bg-slate-600 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- 新增/编辑产品弹窗 -->
    <Teleport to="body">
      <transition name="fade">
        <div v-if="showProductDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 md:p-4" @click.self="closeProductDialog">
          <div class="bg-white dark:bg-slate-800 rounded-xl p-4 md:p-6 w-full max-w-lg mx-2 max-h-[90vh] flex flex-col border border-gray-200 dark:border-slate-600 shadow-2xl">
            <div class="flex items-center justify-between mb-4 flex-shrink-0">
              <h3 class="text-lg font-bold text-gray-800 dark:text-white">{{ isEdit ? '编辑产品' : '新增产品' }}</h3>
              <button type="button" @click="closeProductDialog" class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <form @submit.prevent="submitProduct" class="space-y-4 overflow-y-auto flex-1 pr-1 pb-4 min-w-0 overflow-x-hidden">
          <!-- SKU条码 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">SKU条码 <span class="text-red-500">*</span></label>
            <input v-model="productForm.sku_code" type="text" required :disabled="isEdit"
              class="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-2 text-gray-800 dark:text-white dark:bg-slate-700 disabled:opacity-60"
              placeholder="例如：路虎-黑钻-M12-发光">
          </div>

          <!-- 产品名称 (大类) -->
          <div class="relative">
            <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">商品名称 (大类) <span class="text-red-500">*</span></label>
            <div class="relative">
              <input
                v-model="productForm.name"
                type="text"
                required
                @focus="showNameDropdown = true"
                @blur="handleNameBlur"
                @input="filterNameSuggestions"
                @keydown.enter="selectNameSuggestion"
                @keydown.escape="showNameDropdown = false"
                @keydown.down.prevent="navigateSuggestion(1)"
                @keydown.up.prevent="navigateSuggestion(-1)"
                class="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-2 text-gray-800 dark:text-white dark:bg-slate-700 pr-10"
                placeholder="例如：手动挡、路虎旋钮、蓝水晶"
              />
              <!-- 自定义下拉箭头 -->
              <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <!-- 自定义下拉建议列表 -->
            <ul
              v-if="showNameDropdown && filteredNameSuggestions.length > 0"
              class="absolute z-20 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg shadow-lg max-h-48 overflow-y-auto"
            >
              <li
                v-for="(suggestion, index) in filteredNameSuggestions"
                :key="suggestion"
                :class="[
                  'px-4 py-2 cursor-pointer text-sm',
                  selectedSuggestionIndex === index
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                ]"
                @mousedown.prevent="selectSuggestion(suggestion)"
              >
                {{ suggestion }}
              </li>
            </ul>
          </div>

          <!-- 规格与属性（动态键值对） -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="text-sm font-medium text-gray-700 dark:text-slate-300">规格与属性</label>
              <button
                type="button"
                @click="addSpecPair"
                class="flex items-center gap-1 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
                </svg>
                添加规格
              </button>
            </div>

            <!-- 键值对列表 -->
            <div class="space-y-2">
              <div
                v-for="(pair, idx) in specPairs"
                :key="idx"
                class="flex items-center gap-2"
              >
                <input
                  v-model="pair.key"
                  type="text"
                  placeholder="属性名"
                  class="flex-1 min-w-0 border border-gray-300 dark:border-slate-600 rounded-lg px-2 py-1.5 text-gray-800 dark:text-white dark:bg-slate-700 text-sm truncate"
                />
                <span class="text-gray-400 dark:text-slate-500 text-sm flex-shrink-0 select-none">:</span>
                <input
                  v-model="pair.val"
                  type="text"
                  placeholder="属性值"
                  class="flex-1 min-w-0 border border-gray-300 dark:border-slate-600 rounded-lg px-2 py-1.5 text-gray-800 dark:text-white dark:bg-slate-700 text-sm truncate"
                />
                <button
                  type="button"
                  @click="removeSpecPair(idx)"
                  class="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-lg text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                  title="删除此规格"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- 空态提示 -->
            <div
              v-if="specPairs.length === 0"
              class="text-center py-3 text-xs text-gray-400 dark:text-slate-500 border border-dashed border-gray-200 dark:border-slate-700 rounded-lg"
            >
              暂无规格，点击「添加规格」录入属性
            </div>

            <!-- 预览合并结果 -->
            <div
              v-if="specPairs.length > 0"
              class="mt-2 px-3 py-1.5 bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-lg text-xs text-gray-500 dark:text-slate-400 font-mono overflow-hidden"
            >
              <div class="break-words max-w-full">{{ specPairsPreview }}</div>
            </div>
          </div>

          <!-- 库位号 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">库位号</label>
            <input v-model="productForm.location_code" type="text"
              class="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-2 text-gray-800 dark:text-white dark:bg-slate-700"
              placeholder="例如：A货架-02层-05盒">
          </div>

          <!-- 价格和库存 -->
          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">成本价(元)</label>
              <input v-model="productForm.cost_price" type="number" step="0.01"
                class="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-2 text-gray-800 dark:text-white dark:bg-slate-700"
                placeholder="未填写默认 0">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">当前库存</label>
              <input v-model.number="productForm.current_stock" type="number"
                class="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-2 text-gray-800 dark:text-white dark:bg-slate-700">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">安全库存</label>
              <input v-model.number="productForm.safe_stock" type="number"
                class="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-2 text-gray-800 dark:text-white dark:bg-slate-700">
            </div>
          </div>

          <!-- 备注 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">备注</label>
            <textarea v-model="productForm.remark" rows="2"
              class="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-2 text-gray-800 dark:text-white dark:bg-slate-700"
              placeholder="可选备注信息"></textarea>
          </div>

          <!-- 按钮 -->
          <div class="flex gap-3 pt-2 flex-shrink-0">
            <button type="button" @click="closeProductDialog" class="flex-1 px-4 py-2.5 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-300 rounded-lg font-medium transition-colors">
              取消
            </button>
            <button type="submit" class="flex-1 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors">
              {{ isEdit ? '保存修改' : '创建商品' }}
            </button>
          </div>
        </form>
      </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import QRCode from 'qrcode'
import { jsPDF } from 'jspdf'
import * as XLSX from 'xlsx'
import { toast, showConfirm } from '@/composables/useToast'
import { useProduct } from '@/features/inventory/composables/useProduct'
import { useInventory } from '@/features/inventory/composables/useInventory'

// 使用产品 composable
const {
  products: inventoryList,
  availableCategories,
  parseAttrsToTags,
  parseAttrsToSpecPairs,
  buildAttributesPayload,
  fetchProducts,
  create: createProduct,
  update: updateProduct,
  remove: deleteProduct
} = useProduct()

// 使用库存 composable
const { exportInventoryData } = useInventory()

const searchKeyword  = ref('')
const filterCategory = ref('')
const isLoading = ref(false) // 骨架屏状态
const isExporting = ref(false) // 导出状态

// 经过关键词 + 大类双重过滤后的展示列表
const filteredList = computed(() => {
  let list = inventoryList.value
  if (filterCategory.value) {
    list = list.filter(p => p.name === filterCategory.value)
  }
  const kw = searchKeyword.value.trim().toLowerCase()
  if (kw) {
    list = list.filter(p =>
      p.name?.toLowerCase().includes(kw) ||
      p.sku_code?.toLowerCase().includes(kw)
    )
  }
  return list
})

// ==================== 打印相关 ====================
const showPrintDialog = ref(false)
const printItem       = ref(null)
const printLabelSize  = ref('40x30')   // '40x30' | '70x20'
const qrDataUrl       = ref('')
const canvas40Ref = ref(null)
const canvas70Ref = ref(null)

const printAttrs = computed(() => {
  const item = printItem.value
  if (!item) return ''
  if (item.attributes) {
    const tags = parseAttrsToTags(item.attributes)
    if (tags.length) return tags.map(t => `${t.key}: ${t.val}`).join(' · ')
  }
  return [item.color_style, item.thread_size, item.light_status].filter(Boolean).join(' · ')
})

function handleDocClick(e) {
  if (showCategoryDropdown.value && categoryDropdownRef.value && !categoryDropdownRef.value.contains(e.target)) {
    showCategoryDropdown.value = false
  }
}

function fitSingleLineText(ctx, text, maxWidth) {
  if (!text) return ''
  if (ctx.measureText(text).width <= maxWidth) return text
  const ellipsis = '...'
  let left = 0
  let right = text.length
  while (left < right) {
    const mid = Math.floor((left + right + 1) / 2)
    const candidate = text.slice(0, mid) + ellipsis
    if (ctx.measureText(candidate).width <= maxWidth) left = mid
    else right = mid - 1
  }
  return text.slice(0, left) + ellipsis
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

async function renderLabelToCanvas(canvas, item, size, qrSrc, pxPerMm) {
  const ctx = canvas.getContext('2d')
  const lw = size === '40x30' ? 40 : 70
  const lh = size === '40x30' ? 30 : 20
  const mm = (n) => n * pxPerMm
  const fontFamily = '"Microsoft YaHei","PingFang SC","Segoe UI",sans-serif'
  const attrs = (() => {
    if (item.attributes) {
      const tags = parseAttrsToTags(item.attributes)
      if (tags.length) return tags.map(t => `${t.key}:${t.val}`).join(' · ')
    }
    return [item.color_style, item.thread_size, item.light_status].filter(Boolean).join(' · ')
  })()

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.textBaseline = 'middle'

  const qrImg = await loadImage(qrSrc)

  if (size === '40x30') {
    const centerX = canvas.width / 2
    const textWidth = canvas.width - mm(4)

    // 商品名称（顶部，y=3.5mm）
    ctx.textAlign = 'center'
    ctx.fillStyle = '#111111'
    ctx.font = `700 ${mm(2.9)}px ${fontFamily}`
    const name = fitSingleLineText(ctx, item.name || '', textWidth)
    ctx.fillText(name, centerX, mm(3.5))

    // 二维码（y=5mm，大小16mm，底部到21mm）
    const qrSize = mm(16)
    const qrX = centerX - qrSize / 2
    const qrY = mm(5)
    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize)

    // 属性信息（二维码下方，y=23.5mm）
    if (attrs) {
      ctx.fillStyle = '#555555'
      const attrsFontSize = attrs.length > 20 ? mm(1.8) : mm(2.0)
      ctx.font = `${attrsFontSize}px ${fontFamily}`
      const attrsLine = fitSingleLineText(ctx, attrs, textWidth)
      ctx.fillText(attrsLine, centerX, mm(23.5))
    }

    // 库位信息（底部，y=27.5mm）
    ctx.fillStyle = '#222222'
    ctx.font = `700 ${mm(2.6)}px ${fontFamily}`
    const loc = fitSingleLineText(ctx, `库位: ${item.location_code || '未设置'}`, textWidth)
    ctx.fillText(loc, centerX, mm(27.5))
  } else {
    // 70x20mm 标签布局
    const padLeft = mm(2)
    const padRight = mm(2)
    const padTop = mm(1.5)
    const qrSize = mm(16)
    const qrX = padLeft
    const qrY = padTop

    // 二维码（左侧）
    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize)

    const textX = qrX + qrSize + mm(2)
    const textWidth = canvas.width - textX - padRight

    ctx.textAlign = 'left'

    // 商品名称（右上，与二维码顶部对齐）
    ctx.fillStyle = '#111111'
    ctx.font = `700 ${mm(3.2)}px ${fontFamily}`
    const name = fitSingleLineText(ctx, item.name || '', textWidth)
    ctx.fillText(name, textX, mm(4.5))

    // 库位信息（右侧中部）
    ctx.fillStyle = '#222222'
    ctx.font = `700 ${mm(2.6)}px ${fontFamily}`
    const loc = fitSingleLineText(ctx, `库位: ${item.location_code || '未设置'}`, textWidth)
    ctx.fillText(loc, textX, mm(8.5))

    // 属性信息（右下）
    if (attrs) {
      ctx.fillStyle = '#666666'
      const attrsFontSize = attrs.length > 24 ? mm(1.8) : mm(2.0)
      ctx.font = `${attrsFontSize}px ${fontFamily}`
      const attrsLine = fitSingleLineText(ctx, attrs, textWidth)
      ctx.fillText(attrsLine, textX, mm(12.5))
    }

    ctx.fillStyle = '#555555'
    ctx.font = `${mm(2.0)}px "Courier New",monospace`
    const sku = fitSingleLineText(ctx, item.sku_code || '', textWidth)
    ctx.fillText(sku, textX, mm(16))
  }
}

async function openPrintDialog(item) {
  printItem.value = item
  qrDataUrl.value = ''
  showPrintDialog.value = true
  await nextTick()
  try {
    qrDataUrl.value = await QRCode.toDataURL(item.sku_code || item.name || '', {
      width: 1024,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' }
    })
    await nextTick()
    await drawPreview()
  } catch (e) {
    console.error('生成二维码失败', e)
  }
}

function closePrintDialog() {
  showPrintDialog.value = false
  printItem.value = null
  qrDataUrl.value = ''
}

async function switchLabelSize(size) {
  printLabelSize.value = size
  await nextTick()
  await drawPreview()
}

async function drawPreview() {
  if (!printItem.value || !qrDataUrl.value) return
  const canvas = printLabelSize.value === '40x30' ? canvas40Ref.value : canvas70Ref.value
  if (!canvas) return
  const lw = printLabelSize.value === '40x30' ? 40 : 70
  const pxPerMm = canvas.width / lw
  await renderLabelToCanvas(canvas, printItem.value, printLabelSize.value, qrDataUrl.value, pxPerMm)
}

async function generatePrintPdf(item, size) {
  try {
    closePrintDialog()
    const lw = size === '40x30' ? 40 : 70
    const lh = size === '40x30' ? 30 : 20
    const pxPerMm = 300 / 25.4
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(lw * pxPerMm)
    canvas.height = Math.round(lh * pxPerMm)
    const qrHiRes = await QRCode.toDataURL(item.sku_code || item.name || '', {
      width: 2048,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' }
    })
    await renderLabelToCanvas(canvas, item, size, qrHiRes, pxPerMm)

    const imgData = canvas.toDataURL('image/png')
    // 强制页面方向与标签方向一致，避免浏览器 PDF 预览旋转 90°
    const orientation = lw >= lh ? 'landscape' : 'portrait'
    const doc = new jsPDF({ unit: 'mm', format: [lw, lh], orientation })
    const pageW = doc.internal.pageSize.getWidth()
    const pageH = doc.internal.pageSize.getHeight()
    doc.addImage(imgData, 'PNG', 0, 0, pageW, pageH)

    const pdfBlob = doc.output('blob')
    const pdfUrl = URL.createObjectURL(pdfBlob)
    const pdfName = `标签_${item.sku_code || item.name}_${size}.pdf`
    const win = window.open(pdfUrl, '_blank')
    if (!win) {
      URL.revokeObjectURL(pdfUrl)
      toast.warning('请允许弹出窗口以查看 PDF')
      return
    }
    win.addEventListener('load', () => {
      try { win.document.title = pdfName } catch (_) {}
    })
    toast.success('PDF 已生成，可在新窗口中打印')
  } catch (err) {
    toast.error('生成 PDF 失败：' + err.message)
  }
}


// 弹窗滚动穿透控制
const showProductDialog = ref(false)
const showDeleteConfirm = ref(false)
const isEdit = ref(false)

// 统一处理所有弹窗的滚动穿透
watch([showProductDialog, showPrintDialog, showDeleteConfirm], ([prod, print, del]) => {
  if (prod || print || del) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

// 自定义商品名称下拉框
const showNameDropdown = ref(false)
const nameSuggestions = ref(['手动挡', '路虎旋钮', '黑钛色', '雷克萨斯', '蓝水晶', '前按键', '碳纤维', '不锈钢'])
const filteredNameSuggestions = ref([...nameSuggestions.value])
const selectedSuggestionIndex = ref(-1)

// 大类筛选下拉
const showCategoryDropdown = ref(false)
const categoryDropdownRef = ref(null)

function toggleCategoryDropdown() {
  showCategoryDropdown.value = !showCategoryDropdown.value
}

function selectCategory(cat) {
  filterCategory.value = cat
  showCategoryDropdown.value = false
}

function filterNameSuggestions() {
  const search = productForm.name.toLowerCase().trim()
  if (!search) {
    filteredNameSuggestions.value = [...nameSuggestions.value]
  } else {
    filteredNameSuggestions.value = nameSuggestions.value.filter(name => 
      name.toLowerCase().includes(search)
    )
  }
  showNameDropdown.value = true
  selectedSuggestionIndex.value = -1
}

function selectSuggestion(name) {
  productForm.name = name
  showNameDropdown.value = false
  filteredNameSuggestions.value = [...nameSuggestions.value]
}

function selectNameSuggestion() {
  if (selectedSuggestionIndex.value >= 0 && filteredNameSuggestions.value[selectedSuggestionIndex.value]) {
    productForm.name = filteredNameSuggestions.value[selectedSuggestionIndex.value]
    showNameDropdown.value = false
  }
}

function navigateSuggestion(direction) {
  const len = filteredNameSuggestions.value.length
  if (len === 0) return
  selectedSuggestionIndex.value += direction
  if (selectedSuggestionIndex.value < 0) selectedSuggestionIndex.value = len - 1
  if (selectedSuggestionIndex.value >= len) selectedSuggestionIndex.value = 0
}

function handleNameBlur() {
  // 延迟关闭以允许点击建议项
  setTimeout(() => {
    showNameDropdown.value = false
    selectedSuggestionIndex.value = -1
  }, 200)
}

const productForm = reactive({
  id: null,
  sku_code: '',
  name: '',
  location_code: '',
  cost_price: 0,
  current_stock: 0,
  safe_stock: 0,
  remark: ''
})

// 动态规格键值对（表单中独立维护，提交时转为 JSON 存入 attributes 字段）
const specPairs = ref([])   // [{ key: '螺纹', val: '10mm' }, ...]

// 实时预览 attributes JSON 字符串
const specPairsPreview = computed(() => {
  const obj = {}
  specPairs.value.forEach(({ key, val }) => {
    if (key.trim()) obj[key.trim()] = val.trim()
  })
  return JSON.stringify(obj)
})

function addSpecPair() {
  specPairs.value.push({ key: '', val: '' })
}

function removeSpecPair(idx) {
  specPairs.value.splice(idx, 1)
}

// 格式化属性（兼容旧数据）
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

// 获取库存列表
async function fetchInventory() {
  isLoading.value = true
  await fetchProducts({ pageSize: 1000 })
  isLoading.value = false
}

// 搜索
function handleSearch() {
  // 前端过滤
}

// 删除商品 - 增强防误触机制
const deleteConfirmInput = ref('')
const pendingDeleteItem = ref(null)

async function handleDelete(item) {
  // 存储待删除商品，进入二次确认流程
  pendingDeleteItem.value = item
  deleteConfirmInput.value = ''
  showDeleteConfirm.value = true
}

async function confirmDelete() {
  const item = pendingDeleteItem.value
  if (!item) return
  
  // 二次验证：输入产品名称确认
  if (deleteConfirmInput.value.trim() !== item.name) {
    toast.error('请输入正确的商品名称进行确认')
    return
  }
  
  try {
    await deleteProduct(item.id)
    toast.success('删除成功')
    fetchInventory()
  } catch (error) {
    toast.error('删除失败：' + error.message)
  } finally {
    showDeleteConfirm.value = false
    pendingDeleteItem.value = null
    deleteConfirmInput.value = ''
  }
}

function cancelDelete() {
  showDeleteConfirm.value = false
  pendingDeleteItem.value = null
  deleteConfirmInput.value = ''
}
// 打开新增弹窗
function openAddDialog() {
  isEdit.value = false
  Object.assign(productForm, {
    id: null, sku_code: '', name: '',
    location_code: '', cost_price: 0, current_stock: 0, safe_stock: 0, remark: ''
  })
  specPairs.value = []
  showProductDialog.value = true
}

// 打开编辑弹窗
function openEditDialog(item) {
  isEdit.value = true
  Object.assign(productForm, {
    id: item.id,
    sku_code: item.sku_code,
    name: item.name,
    location_code: item.location_code || '',
    cost_price: item.cost_price ?? 0,
    current_stock: item.current_stock ?? 0,
    safe_stock: item.safe_stock ?? 0,
    remark: item.remark || ''
  })
  // 优先从 attributes JSON 加载；若为空则尝试兼容旧固定字段
  if (item.attributes) {
    specPairs.value = parseAttrsToSpecPairs(item.attributes)
  } else {
    const legacy = []
    if (item.logo_type)    legacy.push({ key: 'LOGO',   val: item.logo_type })
    if (item.color_style)  legacy.push({ key: '颜色',   val: item.color_style })
    if (item.thread_size)  legacy.push({ key: '螺纹',   val: item.thread_size })
    if (item.light_status) legacy.push({ key: '发光状态', val: item.light_status })
    specPairs.value = legacy
  }
  showProductDialog.value = true
}

// 关闭产品弹窗
function closeProductDialog() {
  showProductDialog.value = false
  specPairs.value = []
}

// 提交产品
async function submitProduct() {
  try {
    // 组装 attributes JSON 字符串（空则传 null）
    const attributesObj = buildAttributesPayload(specPairs.value)
    const payload = {
      ...productForm,
      // attributes 以 JSON 字符串形式传给后端，避免存成 [object Object]
      attributes: Object.keys(attributesObj).length > 0 ? JSON.stringify(attributesObj) : null,
      // 未填写或清空时强制归 0，避免后端收到空字符串
      cost_price: productForm.cost_price === '' || productForm.cost_price === null || isNaN(Number(productForm.cost_price))
        ? 0
        : Number(productForm.cost_price)
    }

    const snapshot = { ...payload }

    if (isEdit.value) {
      await updateProduct(productForm.id, payload)
      toast.success('修改成功')
      closeProductDialog()
      fetchInventory()
    } else {
      await createProduct(payload)
      toast.success('创建成功')
      closeProductDialog()
      fetchInventory()
      const wantPrint = await showConfirm({
        title: '打印库位标签',
        message: `是否立即打印「${snapshot.name}」的库位标签？`,
        okText: '去打印',
        cancelText: '暂不'
      })
      if (wantPrint) openPrintDialog(snapshot)
    }
  } catch (error) {
    toast.error('操作失败：' + error.message)
  }
}

// 导出库存
async function handleExport() {
  isExporting.value = true
  try {
    const data = await exportInventoryData()
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '库存数据')
    const date = new Date().toISOString().split('T')[0]
    XLSX.writeFile(wb, `库存数据_${date}.xlsx`)
    toast.success('导出成功！文件已保存到本地')
  } catch (error) {
    toast.error('导出失败：' + error.message)
  } finally {
    isExporting.value = false
  }
}

onMounted(async () => {
  isLoading.value = true
  try {
    await fetchInventory()
  } finally {
    isLoading.value = false
  }
  document.addEventListener('click', handleDocClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleDocClick)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to       { opacity: 0; }

/* 列表项入场动画 */
@keyframes slide-up {
  from { transform: translateY(10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.slide-up-anim {
  animation: slide-up 0.3s ease-out;
}

/* 表格行 hover 动画 */
tbody tr {
  animation: slide-up 0.3s ease-out;
  animation-fill-mode: both;
}

tbody tr:nth-child(1) { animation-delay: 0.02s; }
tbody tr:nth-child(2) { animation-delay: 0.04s; }
tbody tr:nth-child(3) { animation-delay: 0.06s; }
tbody tr:nth-child(4) { animation-delay: 0.08s; }
tbody tr:nth-child(5) { animation-delay: 0.10s; }
tbody tr:nth-child(6) { animation-delay: 0.12s; }
tbody tr:nth-child(7) { animation-delay: 0.14s; }
tbody tr:nth-child(8) { animation-delay: 0.16s; }
tbody tr:nth-child(9) { animation-delay: 0.18s; }
tbody tr:nth-child(10) { animation-delay: 0.20s; }

/* 按钮点击波纹效果 */
.btn-ripple {
  position: relative;
  overflow: hidden;
}

.btn-ripple::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle, rgba(239,68,68,0.3) 0%, transparent 70%);
  transform: scale(0);
  opacity: 0;
  transition: transform 0.5s, opacity 0.3s;
}

.btn-ripple:active::after {
  transform: scale(2);
  opacity: 1;
}
</style>
