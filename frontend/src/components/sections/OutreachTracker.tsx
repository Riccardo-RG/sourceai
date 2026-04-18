'use client'

import { useState, useEffect } from 'react'
import { InfoTooltip } from '@/components/ui/info-tooltip'
import { useOutreachStore, OutreachStatus } from '@/store/outreachStore'

const STATUS_CONFIG: Record<OutreachStatus, { label: string; color: string }> = {
  inviato:    { label: 'Inviato',    color: 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800' },
  in_attesa:  { label: 'In attesa',  color: 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800' },
  risposto:   { label: 'Risposto',   color: 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' },
  trattativa: { label: 'Trattativa', color: 'bg-violet-50 text-violet-700 border border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800' },
  chiuso:     { label: 'Chiuso',     color: 'bg-muted text-muted-foreground border border-border' },
}

const STATUS_ORDER: OutreachStatus[] = ['inviato', 'in_attesa', 'risposto', 'trattativa', 'chiuso']

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return 'ora'
  if (mins < 60) return `${mins}m fa`
  if (hours < 24) return `${hours}h fa`
  return `${days}g fa`
}

export default function OutreachTracker() {
  const { entries, hydrate, updateStatus, addNote, removeEntry } = useOutreachStore()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [noteInput, setNoteInput] = useState<Record<string, string>>({})

  useEffect(() => { hydrate() }, [hydrate])

  if (entries.length === 0) return null

  return (
    <div className="rounded-2xl border bg-card shadow-card overflow-hidden">
      <div className="px-6 py-5 border-b border-border/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">Outreach tracker</h3>
            <InfoTooltip text="Tieni traccia dei supplier contattati. Aggiorna lo stato man mano che la trattativa avanza." />
          </div>
          <span className="text-base text-muted-foreground">{entries.length} contatti</span>
        </div>
      </div>

      <div className="divide-y divide-border/60">
        {entries.map((entry) => {
          const cfg = STATUS_CONFIG[entry.status]
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
                    <InfoTooltip text="Aggiorna lo stato: Inviato → In attesa → Risposto → Trattativa → Chiuso." />
                    {STATUS_ORDER.map((s) => (
                      <button key={s} onClick={() => updateStatus(entry.id, s)}
                        className={`text-sm font-semibold px-3 py-1.5 rounded-full border transition ${entry.status === s ? cfg.color : 'text-muted-foreground hover:text-foreground border-border'}`}>
                        {STATUS_CONFIG[s].label}
                      </button>
                    ))}
                  </div>

                  {entry.note && (
                    <p className="text-base text-muted-foreground italic">&ldquo;{entry.note}&rdquo;</p>
                  )}

                  <div className="flex gap-2">
                    <input type="text" placeholder="Aggiungi una nota…"
                      value={noteInput[entry.id] ?? ''}
                      onChange={(e) => setNoteInput((p) => ({ ...p, [entry.id]: e.target.value }))}
                      className="flex-1 h-11 text-base px-3 border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-foreground/10" />
                    <button onClick={() => { const n = noteInput[entry.id]?.trim(); if (n) { addNote(entry.id, n); setNoteInput((p) => ({ ...p, [entry.id]: '' })) } }}
                      className="h-11 px-4 text-base font-semibold bg-foreground text-background rounded-lg hover:opacity-85 transition">
                      Salva
                    </button>
                    <button onClick={() => removeEntry(entry.id)}
                      className="h-11 px-3 text-base text-red-400 hover:text-red-600 transition rounded-lg">
                      Rimuovi
                    </button>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    Inviato {timeAgo(entry.sent_at)} · aggiornato {timeAgo(entry.last_update)}
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
