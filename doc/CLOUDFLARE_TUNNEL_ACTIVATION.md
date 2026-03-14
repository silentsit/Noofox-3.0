# Cloudflare Tunnel activation (noofox.com ↔ LocalWP)

Quick reference for when noofox.com needs to be “live” from your Local site.

---

## Quick “activate it now” one-liner

If the tunnel is down and you want to bring it back:

```powershell
sc.exe stop Cloudflared
sc.exe start Cloudflared
```

Then refresh **Cloudflare Zero Trust → Networks / Connectors** and confirm **localwp-noofox** shows **HEALTHY**.

---

## What a tunnel is (in your setup)

- A **Cloudflare Tunnel** is a secure **outbound** connection from your PC to Cloudflare.
- **LocalWP** runs your WordPress site on your PC.
- **cloudflared** (Windows service) dials out to Cloudflare and says:  
  *“If someone visits noofox.com, send that traffic to my local server.”*
- LocalWP does **not** use port 443. It uses **10003** (HTTP) and **10004** (HTTPS). The tunnel must point to one of these.

---

## Fix: Tunnel must use LocalWP’s real ports (not 443)

If noofox.com times out even when the tunnel is HEALTHY, the tunnel is probably still pointing at `127.0.0.1:443`. LocalWP uses different ports.

### Step 1 — Confirm which port serves the site

With **LocalWP site started**, run:

```powershell
curl.exe -I --max-time 5 http://127.0.0.1:10003
curl.exe -k -I --max-time 5 https://127.0.0.1:10004
```

One (or both) should respond with `200` or `301`. If 10003 responds, use HTTP below; if 10004 responds, use HTTPS.

### Step 2 — Update Cloudflare Tunnel routes

Cloudflare Zero Trust → **Tunnels** → **localwp-noofox** → **Public Hostname** (or **Published application routes**).

Edit the routes for **noofox.com** and **www.noofox.com**:

**Preferred (most stable): HTTP**

- **Type:** HTTP  
- **Service URL:** `http://127.0.0.1:10003`  
Do **not** use port 443.

**Alternative: HTTPS**

- **Type:** HTTPS  
- **Service URL:** `https://127.0.0.1:10004`  
- Enable **No TLS Verify** (LocalWP uses a local cert).

### Step 3 — Test

```powershell
curl.exe -I --max-time 15 https://noofox.com
```

You should get headers (200/301), not a timeout.

---

## What “activate the tunnel” actually means

In practice, these 3 things must be true:

### 1) Your site is running locally

- **LocalWP** → **Start site**
- **https://noofoxxx.local** loads in the browser

### 2) The cloudflared connector is running

In **Admin PowerShell**:

```powershell
sc.exe query Cloudflared
```

You want: **STATE : 4 RUNNING**

If not running:

```powershell
sc.exe start Cloudflared
```

### 3) Cloudflare sees the tunnel as HEALTHY

- **Cloudflare Zero Trust** → **Networks** / **Connectors**
- **localwp-noofox** = **HEALTHY**

If it’s **DOWN**, Cloudflare can’t reach your PC, so noofox.com will fail.

---

## Two types of tunnels

### A) Temporary / manual tunnel (old way)

You run a command in a terminal and keep it open:

```powershell
cloudflared tunnel run <tunnel-name>
```

That’s “activate it manually”.

### B) Always-on tunnel (what you have now)

Installed as a Windows service with:

```powershell
cloudflared.exe service install <token>
```

So it’s “activated” automatically whenever Windows is on and the service is running. No terminal window needed.

---

## Your “bring it online” routine

Whenever you want **https://noofox.com** to work:

1. **Start LocalWP site** (noofoxxx).
2. Make sure **cloudflared** service is running:  
   `sc.exe query Cloudflared` → **STATE : 4 RUNNING**
3. Confirm in **Cloudflare** that the connector **localwp-noofox** is **HEALTHY**.

Done — noofox.com is live.

---

## Why it sometimes goes down

Even with the service installed, the tunnel can drop if:

- PC sleeps
- Internet drops
- VPN / network changes
- cloudflared service stops
- WordPress redirects back to `.local` again

---

## When something’s wrong

If you share:

- Tunnel **HEALTHY** or **DOWN** in Cloudflare?
- What error on noofox.com (e.g. 1033 / 1016 / 502 / timeout)?

…you can narrow it to the exact step: start site, start service, or fix redirect/config.
