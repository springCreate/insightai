import { defineStore } from 'pinia'
import { ref } from 'vue'
import { makeId, trackEvent } from '../utils/report'

const STORAGE_KEY = 'insightai_reports_v1'

function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.slice(0, 50) : []
  } catch (err) {
    console.warn('[InsightAI] failed to load report history', err)
    return []
  }
}

function defaultInput() {
  return {
    productIdea: '',
    targetUsers: '',
    painPoints: '',
    industry: '',
    market: ''
  }
}

export const useAnalysisStore = defineStore('analysis', () => {
  const input = ref(defaultInput())
  const result = ref(null)
  const meta = ref({})
  const currentId = ref(null)
  const history = ref(loadHistory())
  const isLoading = ref(false)
  const error = ref(null)
  const feedback = ref(null)

  function setInput(data) {
    input.value = { ...defaultInput(), ...data }
  }

  function setLoading(val) {
    isLoading.value = val
  }

  function setError(msg) {
    error.value = msg
  }

  function setFeedback(val) {
    feedback.value = val
    trackEvent('report_feedback', { value: val, reportId: currentId.value })
  }

  function persistHistory() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.value.slice(0, 50)))
  }

  function saveReport({ input: inputData, result: report, meta: reportMeta = {} }) {
    const id = makeId()
    const entry = {
      id,
      input: { ...defaultInput(), ...inputData },
      result: report,
      meta: reportMeta,
      createdAt: reportMeta.createdAt || new Date().toISOString()
    }

    input.value = { ...entry.input }
    result.value = report
    meta.value = { ...reportMeta }
    currentId.value = id
    feedback.value = null
    error.value = null
    isLoading.value = false

    history.value = [entry, ...history.value.filter((item) => item.id !== id)].slice(0, 50)
    persistHistory()
    trackEvent('report_generated', {
      mode: reportMeta.mode || 'api',
      hasMarket: Boolean(inputData.market),
      fieldCount: Object.values(inputData).filter(Boolean).length,
      reportId: id
    })

    return entry
  }

  function openReport(entry) {
    if (!entry) return
    input.value = { ...defaultInput(), ...entry.input }
    result.value = entry.result
    meta.value = { ...entry.meta }
    currentId.value = entry.id
    error.value = null
    feedback.value = null
    isLoading.value = false
    trackEvent('report_opened', { reportId: entry.id, mode: entry.meta?.mode || 'api' })
  }

  function deleteReport(id) {
    history.value = history.value.filter((item) => item.id !== id)
    persistHistory()
    trackEvent('report_deleted', { reportId: id })
    if (currentId.value === id) {
      currentId.value = null
      result.value = null
      meta.value = {}
      feedback.value = null
    }
  }

  function clearAnalysis() {
    result.value = null
    meta.value = {}
    currentId.value = null
    error.value = null
    feedback.value = null
  }

  return {
    input,
    result,
    meta,
    currentId,
    history,
    isLoading,
    error,
    feedback,
    setInput,
    setLoading,
    setError,
    setFeedback,
    saveReport,
    openReport,
    deleteReport,
    clearAnalysis
  }
})
