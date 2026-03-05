<script setup>
import { ref } from 'vue'
import RedirectChainDetail from './RedirectChainDetail.vue'
import AIAdvisor from './AIAdvisor.vue'
import NginxFixBlock from './NginxFixBlock.vue'
import { getStatusClass, getStatusDotClass, getFinalStatus } from '../utils/statusHelpers'

const props = defineProps({
  result: Object,
  index: Number,
  isExpanded: Boolean,
})

const emit = defineEmits(['toggle'])
</script>

<template>
  <!-- Main row -->
  <tr class="hover:bg-slate-50/50 transition-colors group">
    <td class="p-4 max-w-xs truncate text-slate-600 font-mono text-sm" :title="result.original_url">
      {{ result.original_url }}
    </td>
    <td class="p-4">
      <span
        :class="getStatusClass(result)"
        class="px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 w-fit"
      >
        <span class="w-1.5 h-1.5 rounded-full" :class="getStatusDotClass(result)"></span>
        {{ getFinalStatus(result) }}
      </span>
    </td>
    <td class="p-4 text-center">
      <span v-if="result.total_redirects === 0" class="text-slate-400">-</span>
      <span v-else
        :class="{
          'text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded': result.total_redirects >= 3,
          'text-amber-600 font-bold': result.total_redirects > 0 && result.total_redirects < 3
        }"
      >
        {{ result.total_redirects }} 次
      </span>
    </td>
    <td class="p-4 max-w-xs truncate text-slate-600 font-mono text-sm" :title="result.final_url">
      {{ result.final_url }}
    </td>
    <td class="p-4 text-right">
      <button
        v-if="result.total_redirects > 0"
        @click="emit('toggle', index)"
        class="text-indigo-600 hover:text-indigo-800 text-sm font-medium p-2 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
      >
        {{ isExpanded ? '收合詳情' : '檢視詳情' }}
      </button>
    </td>
  </tr>

  <!-- Expanded detail -->
  <tr v-if="isExpanded" class="bg-slate-50 border-b border-slate-200">
    <td colspan="5" class="p-0">
      <div class="px-8 py-6">
        <RedirectChainDetail :result="result" />
        <AIAdvisor :result="result" :index="index" />
        <NginxFixBlock :result="result" />
      </div>
    </td>
  </tr>
</template>
