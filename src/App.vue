<script setup>
import { ref, provide } from 'vue'
import AppHeader from './components/AppHeader.vue'
import ScanInput from './components/ScanInput.vue'
import ScanProgress from './components/ScanProgress.vue'
import ResultsDashboard from './components/ResultsDashboard.vue'
import KnowledgeSection from './components/KnowledgeSection.vue'
import ToastNotification from './components/ToastNotification.vue'
import { useScan } from './composables/useScan'
import { useToast } from './composables/useToast'

const { toast, showToast } = useToast()
provide('showToast', showToast)

const {
  url,
  scanType,
  isScanning,
  progress,
  progressText,
  currentScanningUrl,
  progressTotal,
  progressCurrent,
  results,
  showAdvanced,
  userAgent,
  maxRedirects,
  timeoutMs,
  startScan,
} = useScan(showToast)
</script>

<template>
  <div class="bg-slate-50 text-slate-800 antialiased min-h-screen font-sans">
    <div class="max-w-6xl mx-auto px-4 py-8">
      <AppHeader />

      <main>
        <ScanInput
          v-model:url="url"
          v-model:scanType="scanType"
          v-model:showAdvanced="showAdvanced"
          v-model:userAgent="userAgent"
          v-model:maxRedirects="maxRedirects"
          v-model:timeoutMs="timeoutMs"
          :is-scanning="isScanning"
          @scan="startScan"
        />

        <Transition name="fade">
          <ScanProgress
            v-if="isScanning"
            :progress="progress"
            :progress-text="progressText"
            :current-url="currentScanningUrl"
            :progress-total="progressTotal"
            :progress-current="progressCurrent"
          />
        </Transition>

        <Transition name="fade">
          <ResultsDashboard
            v-if="results.length > 0 && !isScanning"
            :results="results"
          />
        </Transition>

        <KnowledgeSection />
      </main>
    </div>

    <ToastNotification :toast="toast" />
  </div>
</template>
