<script setup>
import { Route, Github } from 'lucide-vue-next'
</script>

<template>
  <header class="flex items-center justify-between mb-10">
    <div class="flex items-center gap-3">
      <div class="bg-gradient-to-br from-indigo-600 to-purple-600 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-500/20">
        <Route class="w-6 h-6" />
      </div>
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900 flex items-center gap-2 tracking-tight">
          Redirect Scanner Pro
          <span class="text-xs bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 px-2.5 py-1 rounded-full font-bold border border-purple-200/50">
            ✨ AI Powered
          </span>
        </h1>
        <p class="text-sm text-slate-500">SEO 重新導向鏈檢測與 AI 智慧修復工具</p>
      </div>
    </div>
    <a href="#" class="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1.5 hover:gap-2">
      <Github class="w-4 h-4" /> 開源專案
    </a>
  </header>
</template>
