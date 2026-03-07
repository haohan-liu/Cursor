<template>
  <div class="min-h-screen p-4 md:p-6 space-y-6 transition-colors duration-300">
    <div class="max-w-7xl mx-auto bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm dark:shadow-xl border border-gray-200 dark:border-slate-700/50 flex items-center justify-between">
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
      <div class="flex gap-2">
        <button @click="handleExport" class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          导出库存
        </button>
        <button @click="openAddDialog" class="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
          手动新增产品
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
          <div class="flex items-center gap-2 flex-wrap">
            <!-- 大类筛选 -->
            <select
              v-model="filterCategory"
              class="pl-3 pr-8 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-700 dark:text-slate-300 text-sm focus:ring-1 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
              style="background-image: url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 viewBox=%220 0 24 24%22 stroke=%22%236b7280%22><path stroke-linecap=%22round%22 stroke-linejoin=%22round%22 stroke-width=%222%22 d=%22M19 9l-7 7-7-7%22/></svg>'); background-repeat: no-repeat; background-position: right 8px center; background-size: 14px;"
            >
              <option value="">全部大类</option>
              <option v-for="cat in availableCategories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
            <!-- 关键词搜索 -->
            <div class="relative">
              <input v-model="searchKeyword" type="text" placeholder="搜索产品名称或条码..." class="pl-9 pr-4 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white text-sm focus:ring-1 focus:ring-blue-500 outline-none w-52">
              <svg class="w-4 h-4 text-gray-400 dark:text-slate-500 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
          </div>
        </div>

        <div class="overflow-x-auto flex-1">
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
                  <button @click="openPrintDialog(item)" class="text-amber-400 hover:text-amber-300 mr-2 text-xs">打印标签</button>
                  <button @click="openEditDialog(item)" class="text-blue-400 hover:text-blue-300 mr-2 text-xs">编辑</button>
                  <button @click="handleDelete(item)" class="text-red-400 hover:text-red-300 text-xs">删除</button>
                </td>
              </tr>
            </tbody>
          </table>
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
                @click="printLabelSize = '40x30'"
                :class="printLabelSize === '40x30'
                  ? 'bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/25'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-600 hover:bg-gray-200 dark:hover:bg-slate-600'"
                class="flex-1 py-2.5 text-xs font-semibold border rounded-xl transition-all"
              >
                <div>40mm × 30mm</div>
                <div class="text-[10px] opacity-70 font-normal mt-0.5">正方形标签</div>
              </button>
              <button
                @click="printLabelSize = '70x20'"
                :class="printLabelSize === '70x20'
                  ? 'bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/25'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-600 hover:bg-gray-200 dark:hover:bg-slate-600'"
                class="flex-1 py-2.5 text-xs font-semibold border rounded-xl transition-all"
              >
                <div>70mm × 20mm</div>
                <div class="text-[10px] opacity-70 font-normal mt-0.5">宽扁型标签</div>
              </button>
            </div>

            <!-- 预览区 -->
            <div class="bg-gray-100 dark:bg-slate-900 rounded-xl p-4 mb-3 flex flex-col items-center gap-2">
              <span class="text-[10px] text-gray-400 dark:text-slate-500">预览（等比缩放 / 非实际尺寸）</span>

              <!-- 40×30 预览 -->
              <div
                v-if="printLabelSize === '40x30'"
                class="bg-white border-2 border-gray-400 overflow-hidden rounded"
                style="width:200px;height:150px;padding:4px 6px;box-sizing:border-box;display:flex;flex-direction:column;align-items:center;overflow:hidden;font-family:sans-serif;gap:2px;"
              >
                <div style="text-align:center;width:100%;overflow:hidden;flex-shrink:0;">
                  <div style="font-size:9px;font-weight:bold;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">{{ printItem?.name }}</div>
                  <div v-if="printAttrs" style="font-size:7px;color:#555;margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">{{ printAttrs }}</div>
                </div>
                <img v-if="qrDataUrl" :src="qrDataUrl" style="width:85px;height:85px;display:block;flex-shrink:0;" />
                <div v-else style="width:85px;height:85px;background:#eee;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:10px;color:#999;flex-shrink:0;">生成中…</div>
                <div style="text-align:center;width:100%;font-size:7px;color:#444;font-weight:600;white-space:nowrap;">库位: {{ printItem?.location_code || '未设置' }}</div>
              </div>

              <!-- 70×20 预览 -->
              <div
                v-else
                class="bg-white border-2 border-gray-400 overflow-hidden rounded"
                style="width:350px;height:100px;padding:4px 6px;box-sizing:border-box;display:flex;align-items:center;gap:8px;font-family:sans-serif;"
              >
                <img v-if="qrDataUrl" :src="qrDataUrl" style="width:85px;height:85px;display:block;flex-shrink:0;" />
                <div v-else style="width:85px;height:85px;background:#eee;border-radius:4px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:10px;color:#999;">生成中…</div>
                <div style="flex:1;min-width:0;overflow:hidden;display:flex;flex-direction:column;justify-content:center;gap:3px;">
                  <div style="font-size:11px;font-weight:bold;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.2;">{{ printItem?.name }}</div>
                  <div style="font-size:8px;font-family:monospace;color:#555;white-space:nowrap;overflow:hidden;">{{ printItem?.sku_code }}</div>
                  <div v-if="printAttrs" style="font-size:8px;color:#777;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">{{ printAttrs }}</div>
                  <div style="font-size:10px;font-weight:bold;color:#333;">库位: {{ printItem?.location_code || '未设置' }}</div>
                </div>
              </div>
            </div>

            <!-- 提示 -->
            <div class="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl px-3 py-2 mb-4 flex items-start gap-2">
              <span class="text-amber-500 text-sm flex-shrink-0">💡</span>
              <p class="text-xs text-amber-600 dark:text-amber-400">请在接下来弹出的浏览器打印设置中，修改【打印份数】来控制打印数量。</p>
            </div>

            <!-- 操作按钮 -->
            <div class="flex gap-3">
              <button @click="closePrintDialog" class="flex-1 py-2.5 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-300 rounded-xl font-medium text-sm transition-colors">
                取消
              </button>
              <button @click="directPrint(printItem, printLabelSize)" class="flex-1 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-1.5">
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

    <!-- 新增/编辑产品弹窗 -->
    <div v-if="showProductDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-slate-600">
        <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-4">{{ isEdit ? '编辑产品' : '新增产品' }}</h3>

        <form @submit.prevent="submitProduct" class="space-y-4">
          <!-- SKU条码 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">SKU条码 <span class="text-red-500">*</span></label>
            <input v-model="productForm.sku_code" type="text" required :disabled="isEdit"
              class="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-2 text-gray-800 dark:text-white dark:bg-slate-700 disabled:opacity-60"
              placeholder="例如：路虎-黑钻-M12-发光">
          </div>

          <!-- 产品名称 (大类) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">商品名称 (大类) <span class="text-red-500">*</span></label>
            <input v-model="productForm.name" type="text" required
              list="name-presets"
              class="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-2 text-gray-800 dark:text-white dark:bg-slate-700"
              placeholder="例如：手动挡、路虎旋钮、蓝水晶">
            <datalist id="name-presets">
              <option value="手动挡" />
              <option value="路虎旋钮" />
              <option value="黑钛色" />
              <option value="雷克萨斯" />
              <option value="蓝水晶" />
              <option value="前按键" />
              <option value="碳纤维" />
              <option value="不锈钢" />
            </datalist>
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
                  placeholder="属性名（如：螺纹）"
                  class="flex-1 border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-1.5 text-gray-800 dark:text-white dark:bg-slate-700 text-sm"
                />
                <span class="text-gray-400 dark:text-slate-500 text-sm flex-shrink-0">:</span>
                <input
                  v-model="pair.val"
                  type="text"
                  placeholder="属性值（如：10mm）"
                  class="flex-1 border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-1.5 text-gray-800 dark:text-white dark:bg-slate-700 text-sm"
                />
                <button
                  type="button"
                  @click="removeSpecPair(idx)"
                  class="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
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
              class="mt-2 px-3 py-1.5 bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-lg text-xs text-gray-500 dark:text-slate-400 font-mono break-all"
            >
              {{ specPairsPreview }}
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
          <div class="flex gap-3 pt-2">
            <button type="button" @click="closeProductDialog" class="flex-1 px-4 py-2 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-300 rounded-lg font-medium transition-colors">
              取消
            </button>
            <button type="submit" class="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors">
              {{ isEdit ? '保存修改' : '创建商品' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import JsBarcode from 'jsbarcode'
import QRCode from 'qrcode'
import printJS from 'print-js'
import * as XLSX from 'xlsx'
import { getProductList, deleteProduct, exportInventory, createProduct, updateProduct } from '@/api'
import { toast, showConfirm } from '@/composables/useToast.js'

const inventoryList  = ref([])
const searchKeyword  = ref('')
const filterCategory = ref('')

// 从 inventoryList 动态去重大类列表（以 name 作为大类）
const availableCategories = computed(() => {
  const cats = new Set()
  inventoryList.value.forEach(p => { if (p.name) cats.add(p.name) })
  return [...cats].sort()
})

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

// 将 attributes 解析为 [{key, val}] 数组（用于表格 Tag 渲染）
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

// ==================== 打印相关 ====================
const showPrintDialog = ref(false)
const printItem       = ref(null)
const printLabelSize  = ref('40x30')   // '40x30' | '70x20'
const qrDataUrl       = ref('')

// 属性描述字符串（供预览用）
const printAttrs = computed(() => {
  const item = printItem.value
  if (!item) return ''
  if (item.attributes) {
    const tags = parseAttrsToTags(item.attributes)
    if (tags.length) return tags.map(t => `${t.key}: ${t.val}`).join(' · ')
  }
  return [item.color_style, item.thread_size, item.light_status].filter(Boolean).join(' · ')
})

// 打开打印弹窗
async function openPrintDialog(item) {
  printItem.value = item
  qrDataUrl.value = ''
  showPrintDialog.value = true
  await nextTick()
  // 生成二维码预览
  try {
    qrDataUrl.value = await QRCode.toDataURL(item.sku_code || item.name || '', {
      width: 256, margin: 0, color: { dark: '#000000', light: '#ffffff' }
    })
  } catch (e) { console.error('生成二维码失败', e) }
}

// 关闭打印弹窗
function closePrintDialog() {
  showPrintDialog.value = false
  printItem.value = null
  qrDataUrl.value = ''
}

// 点击页面其他地方（仅用于关闭可能残留的下拉，当前无下拉，保留不影响）
function handleDocClick() {}

// 打印（window.open 独立窗口）
async function directPrint(item, size) {
  closePrintDialog()
  try {
    const qr = await QRCode.toDataURL(item.sku_code || item.name, {
      width: 256, margin: 0, color: { dark: '#000000', light: '#ffffff' }
    })
    const attrsStr = parseAttrsToTags(item.attributes).map(t => `${t.key}: ${t.val}`).join(' · ')
      || [item.color_style, item.thread_size, item.light_status].filter(Boolean).join(' · ')

    const loc  = item.location_code || '未设置'
    const name = item.name || ''
    const sku  = item.sku_code || ''
    const is40 = size === '40x30'

    const labelHtml = is40
      ? /* 40×30 — 紧凑正方形 */
        `<div style="width:40mm;height:30mm;padding:1mm 1.5mm 1mm 1.5mm;box-sizing:border-box;
                     display:flex;flex-direction:column;align-items:center;
                     overflow:hidden;font-family:Arial,sans-serif;gap:0.5mm;">
           <div style="text-align:center;width:100%;overflow:hidden;flex-shrink:0;">
             <div style="font-size:5.5pt;font-weight:bold;line-height:1.2;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${name}</div>
             ${attrsStr ? `<div style="font-size:3.5pt;color:#555;margin-top:0.3mm;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${attrsStr}</div>` : ''}
           </div>
           <img src="${qr}" style="width:21mm;height:21mm;display:block;flex-shrink:0;" />
           <div style="text-align:center;width:100%;font-size:4pt;color:#444;font-weight:600;white-space:nowrap;">库位: ${loc}</div>
         </div>`
      : /* 70×20 — 宽扁横向 */
        `<div style="width:70mm;height:20mm;padding:0.8mm 1.5mm;box-sizing:border-box;
                     display:flex;align-items:center;gap:1.5mm;
                     overflow:hidden;font-family:Arial,sans-serif;">
           <img src="${qr}" style="width:18mm;height:18mm;display:block;flex-shrink:0;" />
           <div style="flex:1;min-width:0;overflow:hidden;display:flex;flex-direction:column;justify-content:center;gap:0.6mm;">
             <div style="font-size:6.5pt;font-weight:bold;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.2;">${name}</div>
             <div style="font-size:4pt;font-family:monospace;color:#444;white-space:nowrap;overflow:hidden;">${sku}</div>
             ${attrsStr ? `<div style="font-size:3.5pt;color:#666;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${attrsStr}</div>` : ''}
             <div style="font-size:5pt;font-weight:700;color:#111;">库位: ${loc}</div>
           </div>
         </div>`

    const pageSize = is40 ? '40mm 30mm' : '70mm 20mm'
    const win = window.open('', '_blank', 'width=500,height=400')
    if (!win) { toast.warning('请允许弹出窗口以完成打印'); return }
    win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"/>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  @page { size:${pageSize}; margin:0; }
  html, body { width:${is40 ? '40mm' : '70mm'}; height:${is40 ? '30mm' : '20mm'}; overflow:hidden; }
  body { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
</style>
</head><body>${labelHtml}</body></html>`)
    win.document.close()
    win.focus()
    setTimeout(() => { win.print(); win.close() }, 350)
  } catch (err) {
    toast.error('生成打印内容失败：' + err.message)
  }
}


// 产品弹窗相关
const showProductDialog = ref(false)
const isEdit = ref(false)

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
  try {
    const res = await getProductList({ pageSize: 1000 })
    const products = res.data || []
    // 兼容旧数据，将 attributes 解析到新字段
    for (const p of products) {
      if (!p.location_code && p.locations && p.locations[0]) {
        p.location_code = p.locations[0].location_code
      }
      // 解析旧属性：将旧固定字段合并进 attributes 供统一渲染
      if (p.attributes && typeof p.attributes === 'string') {
        try {
          const attrs = JSON.parse(p.attributes)
          if (!p.logo_type) p.logo_type = attrs['LOGO'] || attrs['logo_type'] || ''
          if (!p.color_style) p.color_style = attrs['颜色'] || attrs['color_style'] || ''
          if (!p.thread_size) p.thread_size = attrs['螺纹型号'] || attrs['thread_size'] || ''
          if (!p.light_status) p.light_status = attrs['发光状态'] || attrs['light_status'] || ''
        } catch {}
      } else if (!p.attributes) {
        // 旧产品没有 attributes 列时，用遗留字段合成临时属性对象供 Tag 渲染
        const legacy = {}
        if (p.logo_type)    legacy['LOGO']   = p.logo_type
        if (p.color_style)  legacy['颜色']   = p.color_style
        if (p.thread_size)  legacy['螺纹']   = p.thread_size
        if (p.light_status) legacy['发光状态'] = p.light_status
        if (Object.keys(legacy).length) p.attributes = JSON.stringify(legacy)
      }
    }
    inventoryList.value = products
  } catch (error) {
    console.error('获取库存列表失败:', error)
  }
}

// 搜索
function handleSearch() {
  // 前端过滤
}

// 删除商品
async function handleDelete(item) {
  const ok = await showConfirm({
    title: '确认删除',
    message: `确定要删除商品「${item.name}」吗？此操作不可恢复。`,
    okText: '删除',
    cancelText: '取消'
  })
  if (!ok) return
  try {
    await deleteProduct(item.id)
    toast.success('删除成功')
    fetchInventory()
  } catch (error) {
    toast.error('删除失败：' + error.message)
  }
}


// 将 attributes（字符串或对象）解析为 specPairs 数组
function parseAttrsToSpecPairs(rawAttrs) {
  if (!rawAttrs) return []
  let obj = rawAttrs
  if (typeof obj === 'string') {
    try { obj = JSON.parse(obj) } catch { return [] }
  }
  if (typeof obj !== 'object' || obj === null) return []
  return Object.entries(obj).map(([key, val]) => ({ key, val: String(val) }))
}

// 将 specPairs 转为 attributes JSON 对象（提交时使用）
function buildAttributesPayload() {
  const obj = {}
  specPairs.value.forEach(({ key, val }) => {
    if (key.trim()) obj[key.trim()] = val.trim()
  })
  return obj
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
    const attributesObj = buildAttributesPayload()
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
  try {
    const res = await exportInventory()
    const data = res.data || []
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '库存数据')
    const date = new Date().toISOString().split('T')[0]
    XLSX.writeFile(wb, `库存数据_${date}.xlsx`)
    toast.success('导出成功！文件已保存到本地')
  } catch (error) {
    toast.error('导出失败：' + error.message)
  }
}

onMounted(() => {
  fetchInventory()
  document.addEventListener('click', handleDocClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleDocClick)
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to       { opacity: 0; }
</style>
