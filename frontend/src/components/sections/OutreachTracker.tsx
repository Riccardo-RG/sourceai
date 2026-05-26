'use client'

import { useState, useEffect } from 'react'
import { InfoTooltip } from '@/components/ui/info-tooltip'
import { useOutreachStore, OutreachStatus } from '@/store/outreachStore'
import { useAuthStore } from '@/store/authStore'
import { useT } from '@/hooks/useT'

export default function OutreachTracker() {
  const { entries, hydrate, reset, updateStatus, addNote, removeEntry } = useOutreachStore()
  const { user, initialized } = useAuthStore()
  const t = useT()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [noteInput, setNoteInput] = useState<Record<string, string>>({})
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!initialized) return
    if (user) hydrate()
    else reset()
  }, [user, initialized, hydrate, reset])

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(Date.now()), 60000)
    return () => window.clearInterval(intervalId)
  }, [])

  const statusConfig: Record<OutreachStatus, { label: string; color: string }> = {
    inviato:    { label: t.ot_status_sent,        color: 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800' },
    in_attesa:  { label: t.ot_status_waiting,     color: 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800' },
    risposto:   { label: t.ot_status_replied,     color: 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' },
    trattativa: { label: t.ot_status_negotiation, color: 'bg-violet-50 text-violet-700 border border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800' },
    chiuso:     { label: t.ot_status_closed,      color: 'bg-muted text-muted-foreground border border-border' },
  }

  const STATUS_ORDER: OutreachStatus[] = ['inviato', 'in_attesa', 'risposto', 'trattativa', 'chiuso']

  function timeAgo(date: Date): string {
    const diff = Math.max(0, now - date.getTime())
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (mins < 1) return t.ot_just_now
    if (mins < 60) return t.ot_mins_ago.replace('{n}', String(mins))
    if (hours < 24) return t.ot_hours_ago.replace('{n}', String(hours))
    return t.ot_days_ago.replace('{n}', String(days))
  }

  if (entries.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card shadow-card p-8 text-center space-y-3">
        <p className="text-2xl">📬</p>
        <div className="space-y-1">
          <p className="text-base font-semibold text-foreground">{t.ot_title}</p>
          <p className="text-base text-muted-foreground max-w-xs mx-auto">
            Trova un fornitore nella sezione Supplier trovati e clicca <span className="font-medium text-foreground">+ Outreach</span> per iniziare a tracciare i contatti.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border bg-card shadow-card overflow-hidden">
      <div className="px-6 py-5 border-b border-border/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">{t.ot_title}</h3>
            <InfoTooltip text={t.ot_title_tooltip} />
          </div>
          <span className="text-base text-muted-foreground">
            {t.ot_contacts.replace('{n}', String(entries.length))}
          </span>
        </div>
      </div>

      <div className="divide-y divide-border/60">
        {entries.map((entry) => {
          const cfg = statusConfig[entry.status]
          const expanded = expandedId === entry.id

          return (
            <div key={entry.id}>
              <button className="w-full text-left px-6 py-5 hover:bg-muted/30 transition"
                onClick={() => setExpandedId(expanded ? null : entry.id)}>
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <p className="text-base font-semibold truncate">{entry.supplier_name}</p>
                    <p className="text-base text-muted-foreground truncate">{entry.product_query}</p>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className={`text-sm font-semibold px-3 py-1.5 rounded-full ${cfg.color}`}>{cfg.label}</span>
                    <span className="text-base text-muted-foreground">{timeAgo(entry.last_update)}</span>
                    <span className="text-base text-muted-foreground">{expanded ? '▲' : '▼'}</span>
                  </div>
                </div>
                {entry.note && !expanded && (
                  <p className="text-base text-muted-foreground mt-2 truncate italic">&ldquo;{entry.note}&rdquo;</p>
                )}
              </button>

              {expanded && (
                <div className="px-6 pb-5 pt-3 space-y-4 bg-muted/20 border-t border-border/60">
                  <div className="flex items-center gap-2 flex-wrap">
                    <InfoTooltip text={t.ot_status_tooltip} />
                    {STATUS_ORDER.map((s) => (
                      <button key={s} onClick={() => updateStatus(entry.id, s)}
                        className={`text-sm font-semibold px-3 py-1.5 rounded-full border transition ${entry.status === s ? cfg.color : 'text-muted-foreground hover:text-foreground border-border'}`}>
                        {statusConfig[s].label}
                      </button>
                    ))}
                  </div>

                  {entry.note && (
                    <p className="text-base text-muted-foreground italic">&ldquo;{entry.note}&rdquo;</p>
                  )}

                  <div className="flex gap-2">
                    <input type="text" placeholder={t.ot_add_note}
                      value={noteInput[entry.id] ?? ''}
                      onChange={(e) => setNoteInput((p) => ({ ...p, [entry.id]: e.target.value }))}
                      className="flex-1 h-11 text-base px-3 border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-foreground/10" />
                    <button onClick={() => { const n = noteInput[entry.id]?.trim(); if (n) { addNote(entry.id, n); setNoteInput((p) => ({ ...p, [entry.id]: '' })) } }}
                      className="h-11 px-4 text-base font-semibold bg-foreground text-background rounded-lg hover:opacity-85 transition">
                      {t.ot_save}
                    </button>
                    <button onClick={() => removeEntry(entry.id)}
                      className="h-11 px-3 text-base text-red-400 hover:text-red-600 transition rounded-lg">
                      {t.ot_remove}
                    </button>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {t.ot_sent_prefix} {timeAgo(entry.sent_at)} · {t.ot_updated_prefix} {timeAgo(entry.last_update)}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
