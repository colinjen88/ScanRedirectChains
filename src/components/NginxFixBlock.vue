<script setup>
import { inject } from 'vue'
import { Copy } from 'lucide-vue-next'
import { generateNginxFix } from '../utils/mermaid'

const props = defineProps({
  result: Object,
})

const showToast = inject('showToast')

const copyCode = async (code) => {
  try {
    await navigator.clipboard.writeText(code)
    showToast('已複製到剪貼簿！', 'success')
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea')
    textarea.value = code
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    showToast('已複製到剪貼簿！', 'success')
  }
}

const nginxCode = generateNginxFix(props.result)
</script>

<template>
  <div v-if="!result.is_error && result.total_redirects > 1" class="bg-slate-100 rounded-xl overflow-hidden shadow-inner mt-4">
    <div class="flex items-center justify-between px-4 py-2.5 bg-slate-200/80 border-b border-slate-300">
      <span class="text-xs text-slate-600 font-mono font-semibold">基礎 Nginx 修復參考</span>
      <button
        @click="copyCode(nginxCode)"
        class="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition-colors cursor-pointer"
      >
        <Copy class="w-3 h-3" /> 複製
      </button>
    </div>
    <div class="p-4 overflow-x-auto">
      <code class="text-sm font-mono text-slate-800 whitespace-pre">{{ nginxCode }}</code>
    </div>
  </div>
</template>
