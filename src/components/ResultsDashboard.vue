<script setup>
import { ref, computed, inject } from 'vue'
import { Download } from 'lucide-vue-next'
import StatsCards from './StatsCards.vue'
import ResultRow from './ResultRow.vue'
import { exportCSV } from '../utils/export'

const props = defineProps({
  results: Array,
})

const showToast = inject('showToast')
const expandedRow = ref(null)
const currentFilter = ref('all')

const filteredResults = computed(() => {
  if (currentFilter.value === 'all') return props.results
  return props.results.filter(result => {
    if (currentFilter.value === 'error') return result.is_error
    if (currentFilter.value === 'warning') return result.total_redirects >= 3 && !result.is_error
    if (currentFilter.value === 'ok') return result.total_redirects < 3 && !result.is_error
    return true
  })
})

const toggleRow = (index) => {
  expandedRow.value = expandedRow.value === index ? null : index
}

const handleExport = () => {
  exportCSV(props.results)
  showToast('CSV 報告已下載！', 'success')
}

const filterButtons = [
  { key: 'all', label: '全部', activeClass: 'bg-white shadow-sm font-semibold text-indigo-700' },
  { key: 'error', label: '錯誤 (4xx/5xx)', activeClass: 'bg-white shadow-sm text-red-600 font-semibold' },
  { key: 'warning', label: '警告 (≥3次)', activeClass: 'bg-white shadow-sm text-amber-600 font-semibold' },
  { key: 'ok', label: '正常', activeClass: 'bg-white shadow-sm text-green-600 font-semibold' },
]
</script>

<template>
  <div class="space-y-6">
    <StatsCards :results="results" />

    <!-- Data Table -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <!-- Table Header with filters -->
      <div class="p-5 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
        <h2 class="text-lg font-bold text-slate-800">掃描詳細報告</h2>

        <div class="flex items-center gap-3">
          <div class="hidden md:flex bg-slate-200/50 p-1 rounded-lg">
            <button
              v-for="btn in filterButtons"
              :key="btn.key"
              @click="currentFilter = btn.key"
              :class="currentFilter === btn.key ? btn.activeClass : 'text-slate-500 hover:text-slate-700'"
              class="px-3 py-1.5 text-xs rounded-md transition-all cursor-pointer"
            >
              {{ btn.label }}
            </button>
          </div>
          <button
            @click="handleExport"
            class="text-sm flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg transition-colors font-medium cursor-pointer"
          >
            <Download class="w-4 h-4" /> 匯出 CSV
          </button>
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <th class="p-4 font-medium border-b border-slate-200">來源網址</th>
              <th class="p-4 font-medium border-b border-slate-200">最終狀態</th>
              <th class="p-4 font-medium border-b border-slate-200 text-center">跳轉次數</th>
              <th class="p-4 font-medium border-b border-slate-200">最終目標網址</th>
              <th class="p-4 font-medium border-b border-slate-200 text-right">操作</th>
            </tr>
          </thead>
          <tbody class="text-sm divide-y divide-slate-100">
            <template v-for="(result, index) in filteredResults" :key="index">
              <ResultRow
                :result="result"
                :index="index"
                :is-expanded="expandedRow === index"
                @toggle="toggleRow"
              />
            </template>

            <tr v-if="filteredResults.length === 0">
              <td colspan="5" class="p-8 text-center text-slate-400">
                沒有符合篩選條件的檢測結果。
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
