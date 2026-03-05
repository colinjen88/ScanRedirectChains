<script setup>
import { ref, inject, nextTick } from 'vue'
import { Sparkles, Loader2, AlertTriangle, RefreshCw } from 'lucide-vue-next'

const props = defineProps({
  result: Object,
  index: Number,
})

const showToast = inject('showToast')

const aiState = ref(null) // null | 'loading' | 'success' | 'error'
const aiResponse = ref('')

const callAI = async () => {
  aiState.value = 'loading'

  try {
    const chainText = props.result.chain.map(c => `[${c.status}] ${c.url}`).join(' -> ')

    const response = await fetch('/api/ai/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        original_url: props.result.original_url,
        final_url: props.result.final_url,
        chain: chainText,
      }),
    })

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      throw new Error(errData.error || `HTTP ${response.status}`)
    }

    const data = await response.json()
    if (data.html) {
      aiResponse.value = data.html
      aiState.value = 'success'
    } else {
      throw new Error('API 未回傳預期格式')
    }
  } catch (error) {
    aiState.value = 'error'
    aiResponse.value = `<strong>AI 分析失敗</strong>：${error.message}<br/><span class="text-xs mt-2 block opacity-70">請確認後端伺服器已啟動，且已設定有效的 GEMINI_API_KEY</span>`
    console.error('AI API Error:', error)
  }
}
</script>

<template>
  <div class="mt-8 pt-6 border-t border-slate-200">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
      <h4 class="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center gap-2">
        <Sparkles class="w-5 h-5 text-purple-600" /> AI 智慧 SEO 顧問 ✨
      </h4>

      <button
        v-if="aiState !== 'success'"
        @click="callAI"
        :disabled="aiState === 'loading'"
        class="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
      >
        <span v-if="aiState === 'loading'" class="flex items-center gap-2">
          <Loader2 class="w-4 h-4 animate-spin" /> AI 深度分析中...
        </span>
        <span v-else>✨ 一鍵產生深度分析與多環境修復代碼</span>
      </button>
    </div>

    <!-- AI Response -->
    <div
      v-if="aiState === 'success' || aiState === 'error'"
      class="bg-white rounded-xl p-6 border shadow-inner transition-all duration-500"
      :class="aiState === 'error' ? 'border-red-200 bg-red-50' : 'border-purple-200'"
    >
      <div v-if="aiState === 'error'" class="text-red-600 text-sm flex items-start gap-2">
        <AlertTriangle class="w-5 h-5 shrink-0 mt-0.5" />
        <div v-html="aiResponse"></div>
      </div>

      <div v-if="aiState === 'success'" class="markdown-body" v-html="aiResponse"></div>

      <div v-if="aiState === 'success'" class="mt-4 pt-4 border-t border-purple-100 flex justify-end">
        <button
          @click="callAI"
          class="text-xs text-purple-500 hover:text-purple-700 flex items-center gap-1 transition-colors cursor-pointer"
        >
          <RefreshCw class="w-3 h-3" /> 重新產生分析
        </button>
      </div>
    </div>
  </div>
</template>
