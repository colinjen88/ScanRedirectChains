<script setup>
import { File, Globe, Link, Loader2, Settings2 } from 'lucide-vue-next'

const props = defineProps({
  url: String,
  scanType: String,
  showAdvanced: Boolean,
  userAgent: String,
  maxRedirects: Number,
  isScanning: Boolean,
})

const emit = defineEmits([
  'update:url',
  'update:scanType',
  'update:showAdvanced',
  'update:userAgent',
  'update:maxRedirects',
  'scan',
])

const handleSubmit = () => {
  emit('scan')
}
</script>

<template>
  <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8 transition-all relative overflow-hidden">
    <!-- Decorative background -->
    <div class="absolute -right-20 -top-20 w-64 h-64 bg-purple-50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
    <div class="absolute -left-16 -bottom-16 w-48 h-48 bg-indigo-50 rounded-full blur-3xl opacity-40 pointer-events-none"></div>

    <!-- Scan mode toggle -->
    <div class="flex flex-col md:flex-row gap-4 mb-6 relative z-10">
      <div class="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto">
        <button
          @click="emit('update:scanType', 'single')"
          :class="{'bg-white shadow-sm text-indigo-700': scanType === 'single', 'text-slate-500 hover:text-slate-700': scanType !== 'single'}"
          class="flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <File class="w-4 h-4" /> 單一網址
        </button>
        <button
          @click="emit('update:scanType', 'site')"
          :class="{'bg-white shadow-sm text-indigo-700': scanType === 'site', 'text-slate-500 hover:text-slate-700': scanType !== 'site'}"
          class="flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Globe class="w-4 h-4" /> 全站掃描
        </button>
      </div>
    </div>

    <!-- URL input & button -->
    <form @submit.prevent="handleSubmit" class="flex flex-col md:flex-row gap-3 relative z-10">
      <div class="relative flex-1">
        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
          <Link class="w-5 h-5" />
        </div>
        <input
          :value="url"
          @input="emit('update:url', $event.target.value)"
          type="url"
          required
          placeholder="請輸入要掃描的網址，例如：https://example.com"
          class="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all text-slate-700 placeholder-slate-400 font-mono text-sm"
          :disabled="isScanning"
        />
      </div>
      <button
        type="submit"
        :disabled="isScanning || !url"
        class="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-semibold rounded-xl transition-all shadow-lg shadow-slate-900/10 hover:shadow-slate-900/20 flex items-center justify-center gap-2 min-w-[160px] cursor-pointer disabled:cursor-not-allowed"
      >
        <span v-if="!isScanning">開始掃描</span>
        <span v-else class="flex items-center gap-2">
          <Loader2 class="w-5 h-5 animate-spin" /> 掃描中...
        </span>
      </button>
    </form>

    <!-- Advanced settings -->
    <div class="mt-4 relative z-10">
      <button
        @click="emit('update:showAdvanced', !showAdvanced)"
        type="button"
        class="text-sm text-slate-500 hover:text-indigo-600 flex items-center gap-1.5 transition-colors cursor-pointer"
      >
        <Settings2 class="w-4 h-4" /> {{ showAdvanced ? '隱藏進階設定' : '顯示進階設定' }}
      </button>
      <Transition name="fade">
        <div v-if="showAdvanced" class="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-500 mb-1.5">模擬 User-Agent</label>
            <select
              :value="userAgent"
              @change="emit('update:userAgent', $event.target.value)"
              class="w-full p-2.5 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="default">預設瀏覽器 (Chrome)</option>
              <option value="googlebot">Googlebot (Desktop)</option>
              <option value="googlebot-mobile">Googlebot (Smartphone)</option>
              <option value="bingbot">Bingbot</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 mb-1.5">最大跳轉追蹤次數上限</label>
            <input
              :value="maxRedirects"
              @input="emit('update:maxRedirects', Number($event.target.value))"
              type="number" min="1" max="20"
              class="w-full p-2.5 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>
