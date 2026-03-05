<script setup>
import { CheckCircle, XCircle } from 'lucide-vue-next'

defineProps({
  toast: Object,
})
</script>

<template>
  <Transition name="fade">
    <div v-if="toast.show" class="toast">
      <div
        class="flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg border text-sm font-medium"
        :class="toast.type === 'success'
          ? 'bg-green-50 border-green-200 text-green-700'
          : 'bg-red-50 border-red-200 text-red-700'"
      >
        <CheckCircle v-if="toast.type === 'success'" class="w-5 h-5" />
        <XCircle v-else class="w-5 h-5" />
        {{ toast.message }}
      </div>
    </div>
  </Transition>
</template>
