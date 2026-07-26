import crypto from 'crypto';
import { cols } from './db.js';
import { decrypt } from './crypto.js';

const N8N_URL = (process.env.N8N_API_URL || '').replace(/\/$/, '');
const N8N_KEY = process.env.N8N_API_KEY || '';
const BACKEND_URL = (process.env.BACKEND_URL || 'http://localhost:4000').replace(/\/$/, '');
const GROQ_KEY = process.env.GROQ_API_KEY || '';

function n8n(path, opts = {}) {
  return fetch(`${N8N_URL}/api/v1${path}`, {
    ...opts,
    headers: { 'X-N8N-API-KEY': N8N_KEY, 'Content-Type': 'application/json', ...(opts.headers || {}) }
  });
}

const uid = () => crypto.randomUUID();

// Builds a self-contained per-user workflow: Gmail -> normalize -> classify
// (Groq) -> extract category -> post to the dashboard (+ optional Discord).
function buildWorkflow({ userLabel, credId, credName, ingestUrl, groqKey, discord }) {
  const nGmail = 'Gmail Trigger';
  const nNorm = 'Normalize Fields';
  const nClassify = 'Classify Email';
  const nExtract = 'Extract Category';
  const nIngest = 'Dashboard Ingest';
  const nBuild = 'Build Discord';
  const nDiscord = 'Discord Alert';

  const nodes = [
    {
      id: uid(),
      name: nGmail,
      type: 'n8n-nodes-base.gmailTrigger',
      typeVersion: 1,
      position: [0, 0],
      parameters: { pollTimes: { item: [{ mode: 'everyMinute' }] }, filters: { labelIds: ['INBOX'], readStatus: 'unread' } },
      credentials: { gmailOAuth2: { id: credId, name: credName } }
    },
    {
      id: uid(),
      name: nNorm,
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [220, 0],
      parameters: {
        jsCode:
          "const item = $input.first().json;\nconst clean = (s) => String(s || '').replace(/[\\u0000-\\u001F]/g, ' ').trim();\nconst subject = clean(item.Subject || item.subject || '(No Subject)').substring(0,200);\nconst from = clean(item.From || item.from || 'Unknown').substring(0,200);\nconst snippet = clean(item.snippet || '').substring(0,500);\nreturn [{ json: { subject, from, snippet, messageId: item.id, threadId: item.threadId, timestamp: new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' }) } }];"
      }
    },
    {
      id: uid(),
      name: nClassify,
      type: 'n8n-nodes-base.httpRequest',
      typeVersion: 4,
      position: [440, 0],
      parameters: {
        method: 'POST',
        url: 'https://api.groq.com/openai/v1/chat/completions',
        sendHeaders: true,
        headerParameters: {
          parameters: [
            { name: 'Authorization', value: `Bearer ${groqKey}` },
            { name: 'Content-Type', value: 'application/json' }
          ]
        },
        sendBody: true,
        contentType: 'raw',
        rawContentType: 'application/json',
        body:
          "={{ JSON.stringify({model:'llama-3.3-70b-versatile',max_tokens:20,temperature:0,messages:[{role:'system',content:'Classify the email. Reply with ONE WORD only: URGENT LEAD SUPPORT NEWSLETTER OTHER'},{role:'user',content:'Subject: '+$json.subject+' Body: '+$json.snippet}]}) }}",
        options: {}
      }
    },
    {
      id: uid(),
      name: nExtract,
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [660, 0],
      parameters: {
        jsCode:
          "const r = $input.first().json;\nconst raw = (r.choices?.[0]?.message?.content || '').trim().toUpperCase();\nconst valid = ['URGENT','LEAD','SUPPORT','NEWSLETTER','OTHER'];\nconst category = valid.find(c => raw.includes(c)) || 'OTHER';\nconst prev = $('Normalize Fields').first().json;\nreturn [{ json: { ...prev, category } }];"
      }
    },
    {
      id: uid(),
      name: nIngest,
      type: 'n8n-nodes-base.httpRequest',
      typeVersion: 4,
      position: [880, -80],
      parameters: {
        method: 'POST',
        url: ingestUrl,
        sendHeaders: true,
        headerParameters: { parameters: [{ name: 'Content-Type', value: 'application/json' }] },
        sendBody: true,
        contentType: 'raw',
        rawContentType: 'application/json',
        body:
          "={{ JSON.stringify({ message_id: $json.messageId, timestamp: $json.timestamp, category: $json.category, from: $json.from, subject: $json.subject, snippet: $json.snippet, status: 'New' }) }}",
        options: {}
      }
    }
  ];

  const connections = {
    [nGmail]: { main: [[{ node: nNorm, type: 'main', index: 0 }]] },
    [nNorm]: { main: [[{ node: nClassify, type: 'main', index: 0 }]] },
    [nClassify]: { main: [[{ node: nExtract, type: 'main', index: 0 }]] },
    [nExtract]: { main: [[{ node: nIngest, type: 'main', index: 0 }]] }
  };

  if (discord) {
    nodes.push(
      {
        id: uid(),
        name: nBuild,
        type: 'n8n-nodes-base.code',
        typeVersion: 2,
        position: [880, 120],
        parameters: {
          jsCode:
            "const d = $input.first().json;\nconst payload = { embeds: [{ title: d.category + ' · ' + String(d.subject||'').substring(0,100), description: String(d.snippet||'').substring(0,300), footer: { text: 'Smart Inbox · ' + String(d.timestamp||'') } }] };\nreturn [{ json: { ...d, discordBody: JSON.stringify(payload) } }];"
        }
      },
      {
        id: uid(),
        name: nDiscord,
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4,
        position: [1100, 120],
        parameters: {
          method: 'POST',
          url: discord,
          sendHeaders: true,
          headerParameters: { parameters: [{ name: 'Content-Type', value: 'application/json' }] },
          sendBody: true,
          specifyBody: 'json',
          jsonBody: '={{ $json.discordBody }}',
          options: {}
        }
      }
    );
    connections[nExtract].main[0].push({ node: nBuild, type: 'main', index: 0 });
    connections[nBuild] = { main: [[{ node: nDiscord, type: 'main', index: 0 }]] };
  }

  return { name: `Smart Inbox · ${userLabel}`, nodes, connections, settings: { executionOrder: 'v1' } };
}

export async function provisionForUser(userId) {
  if (!N8N_URL || !N8N_KEY) throw new Error('n8n API is not configured on the backend');

  const integ = await cols.integrations.findOne({ userId });
  const g = integ?.google;
  if (!g?.clientId || !g?.clientSecretEnc || !g?.refreshTokenEnc) {
    throw new Error('Gmail is not connected yet');
  }
  const settings = await cols.settings.findOne({ userId });
  const discord = settings?.routing?.discordWebhook || '';

  // per-user ingest token so their emails land in their account
  let ingestToken = integ.ingestToken;
  if (!ingestToken) {
    ingestToken = crypto.randomBytes(16).toString('hex');
    await cols.integrations.updateOne({ userId }, { $set: { ingestToken } });
  }
  const ingestUrl = `${BACKEND_URL}/api/emails?ingest=${ingestToken}`;

  // tear down any previous provision (idempotent reconnect)
  if (integ.n8nWorkflowId) await n8n(`/workflows/${integ.n8nWorkflowId}`, { method: 'DELETE' }).catch(() => {});
  if (integ.n8nCredentialId) await n8n(`/credentials/${integ.n8nCredentialId}`, { method: 'DELETE' }).catch(() => {});

  // 1. credential (inject the refresh token; past expiry forces a refresh on first poll)
  const credName = `gmail-${userId.slice(-6)}`;
  const credRes = await n8n('/credentials', {
    method: 'POST',
    body: JSON.stringify({
      name: credName,
      type: 'gmailOAuth2',
      data: {
        clientId: g.clientId,
        clientSecret: decrypt(g.clientSecretEnc),
        oauthTokenData: {
          access_token: 'pending',
          refresh_token: decrypt(g.refreshTokenEnc),
          token_type: 'Bearer',
          scope: 'https://www.googleapis.com/auth/gmail.modify',
          expiry_date: Date.now() - 1000
        }
      }
    })
  });
  const cred = await credRes.json();
  if (!credRes.ok) throw new Error('n8n credential: ' + (cred.message || JSON.stringify(cred)));

  // 2. workflow
  const wfBody = buildWorkflow({
    userLabel: g.email || userId.slice(-6),
    credId: cred.id,
    credName,
    ingestUrl,
    groqKey: GROQ_KEY,
    discord
  });
  const wfRes = await n8n('/workflows', { method: 'POST', body: JSON.stringify(wfBody) });
  const wf = await wfRes.json();
  if (!wfRes.ok) {
    await n8n(`/credentials/${cred.id}`, { method: 'DELETE' }).catch(() => {});
    throw new Error('n8n workflow: ' + (wf.message || JSON.stringify(wf)));
  }

  // 3. activate
  const actRes = await n8n(`/workflows/${wf.id}/activate`, { method: 'POST' });
  const act = await actRes.json();
  const active = actRes.ok;

  await cols.integrations.updateOne(
    { userId },
    { $set: { n8nCredentialId: cred.id, n8nWorkflowId: wf.id, provisionedAt: new Date(), active } }
  );

  return { credentialId: cred.id, workflowId: wf.id, active, activateError: active ? null : act.message };
}
