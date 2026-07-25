# n8n — the automation workflow

This folder holds the **n8n workflow** that watches a real Gmail inbox and runs
the triage pipeline. It is the only part that touches Google; the rest of the
product (backend + frontend) runs fine without it.

## What the workflow does

```
Gmail Trigger (poll unread)
   → Normalize Fields
   → Classify Email (Groq / Llama 3.3)
   → Route by Category ── Urgent  → Discord alert  + Sheets log
                          Lead     → extract lead info + Discord + Sheets
                          Support  → draft reply    + Discord + Sheets
                          Other    → Sheets log
   → (every branch) POST to the Smart Inbox backend  → shows on the dashboard
```

The three **Dashboard** nodes (`Dashboard Ingest`, `Dashboard Enrich Lead`,
`Dashboard Enrich Support`) are what feed our dashboard — they send the
classified data to the backend's `POST /api/emails`.

## Importing it

1. Open n8n → **Workflows ▸ Import from File** → pick `smart-inbox.workflow.json`.
2. Reconnect credentials (they don't travel inside the file):
   - **Gmail** (OAuth2) — the inbox to watch
   - **Google Sheets** (OAuth2) — the log sheet
   - Groq + Discord are plain HTTP nodes; keys/webhooks live in the node config.
3. **Activate** the workflow.

## The one setting to get right: the Dashboard node URL

The 3 Dashboard nodes POST to the backend. The correct URL depends on **where
n8n runs relative to the backend**:

| n8n runs… | backend runs… | URL to use |
| --- | --- | --- |
| locally (npx) | locally | `http://localhost:4000/api/emails` |
| in Docker (Desktop) | on your Mac | `http://host.docker.internal:4000/api/emails` |
| on Render/cloud | on Render/cloud | `https://<your-backend>.onrender.com/api/emails` |

> ⚠️ Don't use an `{{ $env.* }}` expression here — n8n blocks env access inside
> expressions by default (`access to env vars denied`). Set the URL as a plain
> **Fixed** value.

## Notes
- The Gmail Trigger **polls** (reaches out to Google every minute); it does not
  need any inbound/public URL.
- Google OAuth in "Testing" mode expires the token every 7 days — reconnect, or
  publish + verify the OAuth app to make it permanent.
