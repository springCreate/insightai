import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAnalysisStore = defineStore('analysis', () => {
  const input = ref({
    productIdea: '',
    targetUsers: '',
    painPoints: '',
    industry: '',
    market: ''
  })

  const result = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  function setInput(data) {
    input.value = { ...input.value, ...data }
  }

  function setResult(data) {
    result.value = data
  }

  function setLoading(val) {
    isLoading.value = val
  }

  function setError(msg) {
    error.value = msg
  }

  function clearAnalysis() {
    result.value = null
    error.value = null
  }

  return {
    input, result, isLoading, error,
    setInput, setResult, setLoading, setError, clearAnalysis
  }
})
