<template>
  <header class="header">
    <div class="header-inner container">
      <router-link to="/" class="logo">
        <span class="logo-text">Insight<span class="logo-accent">AI</span></span>
      </router-link>
      <nav class="nav">
        <router-link to="/" class="nav-link" active-class="nav-link--active">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          首页
        </router-link>
        <button class="nav-link" @click="showSettings = true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          设置
        </button>
      </nav>
    </div>

    <Teleport to="body">
      <div v-if="showSettings" class="modal-overlay" @click.self="showSettings = false">
        <div class="modal">
          <div class="modal-header">
            <h3>设置</h3>
            <button class="modal-close" @click="showSettings = false">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">DeepSeek API Key</label>
              <input type="password" class="form-input" v-model="apiKey" placeholder="sk-..." />
            </div>
            <div class="form-group">
              <label class="form-label">API 代理地址</label>
              <input type="text" class="form-input" v-model="proxyUrl" placeholder="部署版无需配置" />
              <p class="form-hint" style="line-height:1.6">
                中国用户推荐：先在本地终端运行 <code style="background:#f1f5f9;padding:2px 6px;border-radius:4px;font-size:12px">npm run serve</code>，然后在框中填入 <code style="background:#f1f5f9;padding:2px 6px;border-radius:4px;font-size:12px">http://localhost:3001/api/chat</code>。<br/><br/>
                <strong>本地完整运行：</strong><code style="background:#f1f5f9;padding:2px 6px;border-radius:4px;font-size:12px">npm run start</code> 打开 http://localhost:5173
              </p>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary" @click="saveSettings">保存</button>
          </div>
        </div>
      </div>
    </Teleport>
  </header>
</template>

<script setup>
import { ref, onMounted } from 'vue'
const showSettings = ref(false)
const apiKey = ref('')
const proxyUrl = ref('')

onMounted(() => {
  apiKey.value = localStorage.getItem('openai_api_key') || ''
  proxyUrl.value = localStorage.getItem('proxy_url') || ''
})

function saveSettings() {
  localStorage.setItem('openai_api_key', apiKey.value)
  localStorage.setItem('proxy_url', proxyUrl.value)
  showSettings.value = false
}
</script>

<style scoped>
.header { position: fixed; top: 0; left: 0; right: 0; height: 64px; background: rgba(255,255,255,0.9); backdrop-filter: blur(12px); border-bottom: 1px solid var(--gray-200); z-index: 100; }
.header-inner { height: 100%; display: flex; align-items: center; justify-content: space-between; }
.logo-text { font-size: 20px; font-weight: 700; color: var(--gray-900); }
.logo-accent { color: var(--primary); }
.nav { display: flex; align-items: center; gap: 4px; }
.nav-link { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: var(--radius); font-size: 14px; font-weight: 500; color: var(--gray-600); transition: all var(--transition); text-decoration: none; cursor: pointer; }
.nav-link:hover { background: var(--gray-100); color: var(--gray-800); }
.nav-link--active { background: #eef2ff; color: var(--primary); }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 200; }
.modal { background: white; border-radius: var(--radius-lg); width: 440px; max-width: 90vw; box-shadow: var(--shadow-lg); }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px 0; }
.modal-header h3 { font-size: 18px; font-weight: 700; }
.modal-close { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: var(--radius); color: var(--gray-400); font-size: 22px; background: none; border: none; }
.modal-close:hover { background: var(--gray-100); color: var(--gray-600); }
.modal-body { padding: 20px 24px; }
.modal-footer { padding: 0 24px 20px; }
code { font-family: 'SF Mono', 'Fira Code', monospace; }
</style>
