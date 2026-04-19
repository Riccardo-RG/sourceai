# SourceAI — Principi guida per lo sviluppo

## Affidabilità dei dati (REGOLA FONDAMENTALE)

**Mai mostrare un dato stimato o allucinato come se fosse reale.**

Se un dato non è raggiungibile in modo affidabile, la UI deve dirlo esplicitamente oppure non mostrarlo affatto. Il seller prende decisioni di acquisto reali basandosi su questi numeri — dati falsi sono un problema commerciale grave.

Prima di implementare qualsiasi campo che mostra dati all'utente, chiedersi:
1. **Viene da un'API strutturata?** → mostralo con fonte (es. Google Trends via DataForSEO ✅)
2. **Viene da scraping web (Tavily)?** → mostralo con disclaimer "dato indicativo" 🟡
3. **Viene da Claude senza dati in input?** → etichettalo "stima AI" ⚪ o non mostrarlo

Il sistema è più credibile con 3 dati certi che con 10 dati di cui 7 inventati.

**Fonti attuali:**
- Google Trends (DataForSEO) → ✅ reale
- Prezzi Amazon (Tavily scraping) → 🟡 indicativo
- Score competition/margin/sourcing → ⚪ stima Claude
- Supplier links → ✅ URL costruiti deterministicamente

Riferimento completo: `DATA_SOURCES.md` alla root del progetto.

---

## Specificità della ricerca

Input vago (es. "scarpe", "roba bella") = pipeline sprecata + output inutile. Miriam esiste per guidare l'utente verso query specifiche prima di lanciare le API.

Il concetto di "miglior supplier" è relativo al posizionamento del seller:
- **Mass market / volume** → Alibaba, Made-in-China, DHgate
- **Dropshipping** → AliExpress, Spocket, DHgate
- **Artigianale / niche** → Europages, Ankorstore, Faire
- **Premium / OEM** → Europages, Alibaba verified, Ankorstore

---

## Stack tecnico

- **Frontend**: Next.js (App Router), Zustand, Tailwind, `'use client'`
- **Backend**: FastAPI con `redirect_slashes=False`, route path `""` non `"/"`
- **AI search**: Claude Sonnet 4.6 (analisi profonda)
- **AI chat**: Claude Haiku 4.5 (Miriam, veloce e leggero)
- **Dati**: DataForSEO (Google Trends), Tavily (web search), Supabase (auth + db)
- **i18n**: custom Zustand store + `useT()` hook, no librerie esterne (EN/IT/ES)

---

## Deploy

**Non fare mai push o deploy senza autorizzazione esplicita dell'utente.**
L'utente dirà "deployamo" o darà istruzioni specifiche quando è il momento.
