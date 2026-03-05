<script setup>
import { ref, watch, nextTick, onMounted } from 'vue'
import { List, GitCommitHorizontal } from 'lucide-vue-next'
import { generateMermaidCode } from '../utils/mermaid'

const props = defineProps({
  result: Object,
})

const mermaidRef = ref(null)
const mermaidRendered = ref(false)
const mermaidHtml = ref('')

const renderMermaid = async () => {
  if (mermaidRendered.value) return
  try {
    const mermaid = (await import('mermaid')).default
    mermaid.initialize({
      startOnLoad: false,
      theme: 'base',
      themeVariables: {
        primaryColor: '#f1f5f9',
        primaryTextColor: '#334155',
        primaryBorderColor: '#cbd5e1',
        lineColor: '#6366f1',
      },
    })
    const code = generateMermaidCode(props.result)
    const { svg } = await mermaid.render(`mermaid-${Date.now()}`, code)
    mermaidHtml.value = svg
    mermaidRendered.value = true
  } catch (e) {
    console.error('Mermaid render error:', e)
    mermaidHtml.value = '<p class="text-red-500 text-sm">圖表渲染失敗</p>'
  }
}

onMounted(() => {
  renderMermaid()
})
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <!-- Left: Chain Timeline -->
    <div>
      <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
        <List class="w-4 h-4" /> 轉址路徑分析 (Chain Details)
      </h4>
      <div class="relative pl-4 border-l-2 border-slate-200 space-y-6">
        <div v-for="(step, sIndex) in result.chain" :key="sIndex" class="relative">
          <!-- Timeline dot -->
          <div
            class="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white ring-2 ring-white"
            :class="step.status >= 400 ? 'bg-red-500' : (step.status >= 300 ? 'bg-amber-400' : 'bg-green-500')"
          ></div>

          <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <span
              class="px-2 py-0.5 rounded text-xs font-mono font-bold w-fit"
              :class="step.status >= 400 ? 'bg-red-100 text-red-700' : (step.status >= 300 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700')"
            >
              {{ step.status }}
            </span>
            <span class="text-slate-700 font-mono text-sm break-all">{{ step.url }}</span>
            <span class="text-xs text-slate-400 ml-auto whitespace-nowrap">{{ step.time_ms }} ms</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Right: Mermaid Diagram -->
    <div class="space-y-6">
      <div>
        <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <GitCommitHorizontal class="w-4 h-4" /> 視覺化路徑圖
        </h4>
        <div class="bg-white p-4 rounded-xl border border-slate-200 flex justify-center mermaid-container">
          <div v-html="mermaidHtml"></div>
        </div>
      </div>
    </div>
  </div>
</template>
