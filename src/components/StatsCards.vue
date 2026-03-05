<script setup>
import { CheckCircle, GitMerge, AlertTriangle } from 'lucide-vue-next'

const props = defineProps({
  results: Array,
})

const totalScanned = () => props.results.length
const chainsFound = () => props.results.filter(r => r.total_redirects > 0).length
const errorsFound = () => props.results.filter(r => r.is_error || r.total_redirects >= 3).length
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
    <!-- Total Scanned -->
    <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div class="p-3 bg-blue-50 text-blue-600 rounded-xl">
        <CheckCircle class="w-6 h-6" />
      </div>
      <div>
        <p class="text-sm text-slate-500 font-medium">掃描總數</p>
        <p class="text-2xl font-bold text-slate-800">
          {{ totalScanned() }}
          <span class="text-sm font-normal text-slate-400">個網址</span>
        </p>
      </div>
    </div>

    <!-- Chains Found -->
    <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div class="p-3 bg-amber-50 text-amber-600 rounded-xl">
        <GitMerge class="w-6 h-6" />
      </div>
      <div>
        <p class="text-sm text-slate-500 font-medium">發現轉址鏈</p>
        <p class="text-2xl font-bold text-slate-800">
          {{ chainsFound() }}
          <span class="text-sm font-normal text-slate-400">條</span>
        </p>
      </div>
    </div>

    <!-- Errors -->
    <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div class="p-3 bg-red-50 text-red-600 rounded-xl">
        <AlertTriangle class="w-6 h-6" />
      </div>
      <div>
        <p class="text-sm text-slate-500 font-medium">錯誤或過長鏈 (>3次)</p>
        <p class="text-2xl font-bold text-slate-800">
          {{ errorsFound() }}
          <span class="text-sm font-normal text-slate-400">個項目</span>
        </p>
      </div>
    </div>
  </div>
</template>
