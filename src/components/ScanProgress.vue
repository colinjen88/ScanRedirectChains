<script setup>
defineProps({
  progress: Number,
  progressText: String,
  currentUrl: String,
  progressTotal: { type: Number, default: 0 },
  progressCurrent: { type: Number, default: 0 },
})
</script>

<template>
  <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8 text-center">
    <div class="max-w-md mx-auto">
      <div class="flex justify-between text-sm font-medium mb-2">
        <span class="text-indigo-600">{{ progressText }}</span>
        <span class="text-slate-500">
          <template v-if="progressTotal > 0">{{ progressCurrent }} / {{ progressTotal }}</template>
          <template v-else>{{ progress }}%</template>
        </span>
      </div>
      <div class="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
        <div
          class="bg-gradient-to-r from-indigo-600 to-purple-600 h-2.5 rounded-full transition-all duration-300 ease-out"
          :style="{ width: progress + '%' }"
        ></div>
      </div>
      <p class="mt-4 text-xs text-slate-400 font-mono truncate">{{ currentUrl }}</p>
    </div>
  </div>
</template>
