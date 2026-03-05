<script setup>
import { BookOpen, HelpCircle, TrendingDown, XCircle } from 'lucide-vue-next'
</script>

<template>
  <div class="mt-12 bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
    <h3 class="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
      <BookOpen class="text-indigo-600" /> 為什麼需要關注重新導向鏈？
    </h3>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- What is a redirect chain -->
      <div class="space-y-3">
        <h4 class="font-semibold text-slate-700 flex items-center gap-2">
          <HelpCircle class="w-5 h-5 text-blue-500" /> 什麼是重新導向鏈？
        </h4>
        <p class="text-sm text-slate-600 leading-relaxed">
          當一個網頁沒有直接指向最終目的地，而是經過多次中轉（例如：
          <code class="text-pink-600 bg-pink-50 px-1 rounded">網頁 A → 網頁 B → 網頁 C</code>），
          就形成了重新導向鏈。最佳的 SEO 實踐應該是<strong>一步到位</strong>（將 A 直接轉址到 C）。
        </p>
      </div>

      <!-- SEO Impact -->
      <div class="space-y-3">
        <h4 class="font-semibold text-slate-700 flex items-center gap-2">
          <TrendingDown class="w-5 h-5 text-red-500" /> 對網站的負面影響
        </h4>
        <ul class="text-sm text-slate-600 space-y-2.5 list-none pl-0">
          <li class="flex items-start gap-2">
            <XCircle class="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
            <span><strong>拖慢載入速度：</strong>每次跳轉都需要額外的 DNS 解析與 HTTP 請求，嚴重影響 Core Web Vitals 指標與使用者體驗。</span>
          </li>
          <li class="flex items-start gap-2">
            <XCircle class="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
            <span><strong>浪費檢索預算：</strong>Google 爬蟲遇到連續 5 次以上的轉址通常會直接放棄，導致您的最終頁面無法被收錄 (Index)。</span>
          </li>
          <li class="flex items-start gap-2">
            <XCircle class="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
            <span><strong>稀釋連結權重：</strong>反向連結的權重 (Link Juice) 在經過多層級的跳轉後會大幅耗損。</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
