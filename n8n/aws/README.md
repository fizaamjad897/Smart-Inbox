# Deploy n8n on AWS EC2 (free tier, 24/7)

Runs n8n + Caddy (auto-HTTPS) on one small VM. HTTPS comes from a free DuckDNS
subdomain, so Gmail OAuth works. n8n's data lives on the VM disk (persists).

## 1. Launch the EC2 instance
AWS Console → **EC2 → Launch instance**:
- **Name:** `smartinbox-n8n`
- **AMI:** Ubuntu Server 24.04 LTS
- **Type:** `t3.micro` (free-tier eligible; `t2.micro` in some regions)
- **Key pair:** create one, download the `.pem` (for SSH)
- **Storage:** 20–30 GB gp3 (free tier allows 30 GB)
- **Security group** — allow inbound:
  - SSH (22) from *My IP*
  - HTTP (80) from Anywhere
  - HTTPS (443) from Anywhere
- Launch, then copy the instance's **Public IPv4 address**.

## 2. Free HTTPS domain (DuckDNS)
1. Go to https://www.duckdns.org, sign in, create a subdomain, e.g. `smartinbox-fiza`.
2. Set its IP to your EC2 **Public IPv4**. You now have
   `smartinbox-fiza.duckdns.org`.

## 3. SSH in + prep the box
```bash
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@YOUR_EC2_IP

# swap — 1 GB RAM is tight for n8n, this keeps it stable
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile
sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# docker
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker ubuntu
newgrp docker
```

## 4. Deploy
```bash
git clone https://github.com/fizaamjad897/Smart-Inbox.git
cd Smart-Inbox/n8n/aws
cp .env.example .env
nano .env      # set N8N_HOST=your.duckdns.org  and  N8N_ENCRYPTION_KEY=$(openssl rand -hex 24)
docker compose up -d
```
Give Caddy ~30s to fetch the cert, then open `https://your.duckdns.org` — the
n8n setup screen should load over HTTPS.

## 5. Reconnect Google
Google Cloud Console → your OAuth client → add redirect URI:
```
https://your.duckdns.org/rest/oauth2-credential/callback
```

## 6. Load the workflow
In n8n: create the owner account → **import** `../smart-inbox.workflow.json` →
reconnect **Gmail + Sheets**, paste your real **Groq key** (3 nodes) + **Discord
webhooks** (4 nodes) → set the 3 **Dashboard** node URLs to your live backend:
```
https://smartinbox-backend.onrender.com/api/emails
```
→ **Activate**. Done — n8n now runs 24/7, independent of your Mac.

## Notes
- `t3.micro` free tier is **12 months**, then ~$8/mo. Set a billing alarm.
- Update later with: `git pull && docker compose up -d`.
