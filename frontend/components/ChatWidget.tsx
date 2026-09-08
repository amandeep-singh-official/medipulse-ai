'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Send, MessageCircle, AlertTriangle } from 'lucide-react'
import styles from './ChatWidget.module.css'
import { API_URL, getAuthHeader, getChatSuggestions } from '@/lib/api'

// ── Types ────────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

interface Biomarker {
  name: string
  value: number
  unit: string
  status: 'NORMAL' | 'BORDERLINE' | 'OUT_OF_RANGE'
}

interface ChatWidgetProps {
  biomarkers: Biomarker[]
}

// ── Lightweight streaming chat hook (no external dependency) ─────────────────
// Implements streamProtocol: 'text' — reads plain text chunks from FastAPI StreamingResponse

function useChatStream(apiUrl: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const sendMessage = useCallback(async (userText: string) => {
    if (!userText.trim() || isLoading) return

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: userText }
    const assistantId = crypto.randomUUID()

    setMessages(prev => [...prev, userMsg, { id: assistantId, role: 'assistant', content: '' }])
    setInput('')
    setIsLoading(true)
    setError(null)

    abortRef.current = new AbortController()

    try {
      const auth = await getAuthHeader()
      // Build messages array: previous history + new user message
      const history = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }))

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: auth },
        body: JSON.stringify({ messages: history }),
        signal: abortRef.current.signal,
      })

      if (!res.ok) {
        const errText = await res.text()
        throw new Error(res.status === 429 ? 'Rate limit reached. Please wait a moment.' : `Request failed: ${errText}`)
      }

      // Stream plain text chunks
      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      if (!reader) throw new Error('No response body')

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantId ? { ...m, content: m.content + chunk } : m
          )
        )
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      setError(msg)
      // Remove the empty assistant message on error
      setMessages(prev => prev.filter(m => m.id !== assistantId))
    } finally {
      setIsLoading(false)
    }
  }, [messages, isLoading, apiUrl])

  const stop = useCallback(() => {
    abortRef.current?.abort()
    setIsLoading(false)
  }, [])

  return { messages, input, setInput, isLoading, error, sendMessage, stop }
}

// ── Welcome message ───────────────────────────────────────────────────────────

const WELCOME = `👋 Hi! I'm **MediPulse AI**. I can see your recent lab results and I'm here to help you understand them.

Ask me about precautions, lifestyle changes, or what your biomarker values mean. I'll give you personalised, data-based guidance.`

// ── ChatWidget Component ──────────────────────────────────────────────────────

export default function ChatWidget({ biomarkers }: ChatWidgetProps) {
  const [open, setOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const hasData = biomarkers.length > 0
  const outOfRangeCount = biomarkers.filter(b => b.status === 'OUT_OF_RANGE').length

  const { messages, input, setInput, isLoading, error, sendMessage } = useChatStream(
    `${API_URL}/api/chat`
  )

  // ── Keyboard shortcut: Cmd+J / Ctrl+J ─────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'j') {
        e.preventDefault()
        if (hasData) setOpen(v => !v)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [hasData])

  // ── Fetch suggestions when panel opens ────────────────────────────────────
  useEffect(() => {
    if (!open || !hasData || suggestions.length > 0) return
    getChatSuggestions()
      .then(data => setSuggestions(data.suggestions))
      .catch(() => {
        const fallbacks = biomarkers
          .filter(b => b.status !== 'NORMAL')
          .slice(0, 3)
          .map(b => `What should I know about my ${b.name} level?`)
        setSuggestions(fallbacks.length > 0 ? fallbacks : ['Summarize my overall health'])
      })
  }, [open, hasData, biomarkers, suggestions.length])

  // ── Auto-scroll to latest message ─────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // ── Auto-resize textarea ───────────────────────────────────────────────────
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    const el = textareaRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = `${Math.min(el.scrollHeight, 120)}px`
    }
  }

  // ── Submit handlers ────────────────────────────────────────────────────────
  const handleSend = () => {
    if (input.trim().length < 2 || input.length > 500 || isLoading) return
    sendMessage(input)
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSuggestion = (q: string) => {
    setInput(q)
    textareaRef.current?.focus()
  }

  const charOver = input.length > 500

  // Don't render if no data
  if (!hasData) return null

  return (
    <>
      {/* ── Floating Action Button ── */}
      <button
        className={`${styles.fab} ${outOfRangeCount > 0 ? styles.fabPulse : ''}`}
        onClick={() => setOpen(v => !v)}
        aria-label={open ? 'Close health assistant' : 'Open health assistant'}
        id="chat-fab"
        title="MediPulse AI Chat (Cmd+J)"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X size={22} color="#fff" />
            </motion.span>
          ) : (
            <motion.span key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <MessageCircle size={22} color="#fff" />
            </motion.span>
          )}
        </AnimatePresence>
        {outOfRangeCount > 0 && !open && (
          <span className={styles.fabBadge} aria-label={`${outOfRangeCount} biomarkers out of range`}>
            {outOfRangeCount}
          </span>
        )}
      </button>

      {/* ── Chat Panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            className={styles.panel}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-label="MediPulse AI Health Assistant"
            id="chat-panel"
          >
            {/* Header */}
            <div className={styles.header}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--bio-emerald), var(--diagnostic-cobalt))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 16 }}>🤖</span>
              </div>
              <div className={styles.headerTitle}>
                <span className={styles.headerName}>MediPulse AI</span>
                <span className={styles.headerDisclaimer}>
                  <AlertTriangle size={9} />
                  Not a medical professional
                </span>
              </div>
              <button className={styles.closeBtn} onClick={() => setOpen(false)} aria-label="Close chat" id="chat-close">
                <X size={14} />
              </button>
            </div>

            {/* Messages */}
            <div className={styles.messages} id="chat-messages" role="log" aria-live="polite">

              {/* Welcome + suggestions */}
              <div className={styles.welcome}>
                <div className={styles.welcomeText}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{WELCOME}</ReactMarkdown>
                </div>
                {messages.length === 0 && suggestions.length > 0 && (
                  <div className={styles.suggestions} id="chat-suggestions">
                    {suggestions.map((q, i) => (
                      <button key={i} className={styles.suggestionChip} onClick={() => handleSuggestion(q)} id={`suggestion-${i}`}>
                        {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Conversation */}
              {messages
                .filter(msg => msg.role !== 'assistant' || msg.content || isLoading)
                .map(msg => (
                  <div key={msg.id} className={`${styles.msgRow} ${msg.role === 'user' ? styles.msgRowUser : ''}`}>
                    {msg.role === 'assistant' && <div className={styles.avatar}>🤖</div>}
                    <div className={`${styles.bubble} ${msg.role === 'user' ? styles.bubbleUser : styles.bubbleAi}`}>
                      {msg.role === 'assistant' ? (
                        <>
                          {msg.content ? (
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                          ) : isLoading && messages[messages.length - 1]?.id === msg.id ? (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Thinking</span>
                              <span className={styles.cursor} />
                            </div>
                          ) : null}
                          {/* Show blinking cursor on the last assistant message while streaming */}
                          {isLoading && messages[messages.length - 1]?.id === msg.id && msg.content && (
                            <span className={styles.cursor} />
                          )}
                        </>
                      ) : (
                        msg.content
                      )}
                    </div>
                    {msg.role === 'user' && (
                      <div className={styles.avatar} style={{ background: 'var(--bg-elevated, rgba(255,255,255,0.08))', border: '1px solid var(--border)' }}>
                        👤
                      </div>
                    )}
                  </div>
                ))}

              {/* Error */}
              {error && !isLoading && (
                <div className={styles.msgRow}>
                  <div className={styles.avatar}>🤖</div>
                  <div className={`${styles.bubble} ${styles.bubbleAi}`} style={{ borderColor: 'var(--diagnostic-crimson)', color: 'var(--diagnostic-crimson)' }}>
                    {error}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className={styles.inputArea}>
              <div className={styles.inputRow}>
                <textarea
                  ref={textareaRef}
                  className={styles.textarea}
                  value={input}
                  onChange={handleTextareaChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about your health data..."
                  rows={1}
                  disabled={isLoading}
                  aria-label="Chat message input"
                  id="chat-input"
                />
                <button
                  onClick={handleSend}
                  className={styles.sendBtn}
                  disabled={isLoading || charOver || input.trim().length < 2}
                  aria-label="Send message"
                  id="chat-send"
                >
                  <Send size={15} />
                </button>
              </div>
              <div className={`${styles.charCount} ${charOver ? styles.charCountOver : ''}`}>
                {input.length}/500{charOver && ' — too long'}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
