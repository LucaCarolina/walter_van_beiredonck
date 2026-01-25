// Lightweight debug logger for scroll/interaction tracing.
// Usage:
//   import { makeLogger } from './logger.js'
//   const log = makeLogger('WLT')
//   log('event-name', { any: 'data' })
//
// Control:
//   window.walterSetDebug(true/false)
//   window.walterClearLogs()
//   window.walterExportLogs() -> JSON string
//
// Note: We intentionally keep this dependency-free.

const DEFAULT_ENABLED = true
const MAX_LOGS = 2000

function ensureGlobals() {
  if (typeof window === 'undefined') return

  if (window.__WALTER_DEBUG__ === undefined) window.__WALTER_DEBUG__ = DEFAULT_ENABLED
  if (!Array.isArray(window.__WALTER_LOGS__)) window.__WALTER_LOGS__ = []

  if (typeof window.walterSetDebug !== 'function') {
    window.walterSetDebug = (enabled) => {
      window.__WALTER_DEBUG__ = Boolean(enabled)
      console.log('[WALTER][LOGGER] debug =', window.__WALTER_DEBUG__)
    }
  }

  if (typeof window.walterClearLogs !== 'function') {
    window.walterClearLogs = () => {
      window.__WALTER_LOGS__ = []
      console.log('[WALTER][LOGGER] logs cleared')
    }
  }

  if (typeof window.walterExportLogs !== 'function') {
    window.walterExportLogs = () => JSON.stringify(window.__WALTER_LOGS__, null, 2)
  }

  if (typeof window.walterLog !== 'function') {
    window.walterLog = (scope, event, data) => {
      const enabled = Boolean(window.__WALTER_DEBUG__)
      const entry = {
        t: Date.now(),
        scope: String(scope || 'APP'),
        event: String(event || ''),
        data: data ?? null
      }

      // Store for sharing later.
      window.__WALTER_LOGS__.push(entry)
      if (window.__WALTER_LOGS__.length > MAX_LOGS) window.__WALTER_LOGS__.shift()

      if (!enabled) return

      // Console output (grouped so it stays readable).
      const label = `[${entry.scope}] ${entry.event}`
      if (data && typeof data === 'object') {
        console.groupCollapsed(label)
        console.log(entry)
        console.groupEnd()
      } else {
        console.log(label, data ?? '')
      }
    }
  }
}

export function isWalterDebugEnabled() {
  ensureGlobals()
  return Boolean(window.__WALTER_DEBUG__)
}

export function makeLogger(scope) {
  ensureGlobals()
  const s = String(scope || 'APP')
  return (event, data) => window.walterLog(s, event, data)
}

