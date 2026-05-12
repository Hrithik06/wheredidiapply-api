# NeatHunt Deployment Runbook

## Stack

- **Frontend**: Vercel → `neathunt.site` (www redirects to apex)
- **Backend**: Render → `api.neathunt.site` (custom domain via CNAME)
- **Database**: NeonDB (PostgreSQL)
- **DNS**: Cloudflare
- **Domain**: Namecheap → `neathunt.site`

---

## Environment Variables

### Render (Backend)

| Key                           | Value                                                        |
| ----------------------------- | ------------------------------------------------------------ |
| `DATABASE_URL`                | NeonDB pooled connection string                              |
| `GOOGLE_CLIENT_ID`            | Google Cloud Console                                         |
| `GOOGLE_CLIENT_SECRET`        | Google Cloud Console                                         |
| `GOOGLE_REDIRECT_URI`         | `https://api.neathunt.site/api/auth/google/callback`         |
| `GOOGLE_UPGRADE_REDIRECT_URI` | `https://api.neathunt.site/api/auth/google/callback/upgrade` |
| `CLIENT_URL`                  | `https://neathunt.site`                                      |
| `NODE_ENV`                    | `production`                                                 |

### Vercel (Frontend)

| Key            | Value                       |
| -------------- | --------------------------- |
| `VITE_API_URL` | `https://api.neathunt.site` |

---

## Cloudflare DNS Records

| Type  | Name  | Value                       | Proxy              |
| ----- | ----- | --------------------------- | ------------------ |
| CNAME | `api` | `neathunt-api.onrender.com` | DNS Only (grey) ⚠️ |
| CNAME | `www` | `neathunt.site` (Vercel)    | Auto               |

> ⚠️ Keep `api` CNAME as DNS Only — Cloudflare proxy breaks Render's SSL cert issuance.

### Nameservers (Namecheap → Cloudflare)

Set custom nameservers on Namecheap to Cloudflare's provided nameservers.

---

## Google Cloud Console

**OAuth Client → Authorised JavaScript Origins:**

```
http://localhost:4000
https://api.neathunt.site
```

**OAuth Client → Authorised Redirect URIs:**

```
http://localhost:4000/api/auth/google/callback
http://localhost:4000/api/auth/google/callback/upgrade
https://api.neathunt.site/api/auth/google/callback
https://api.neathunt.site/api/auth/google/callback/upgrade
```

---

## If Domain Expires / Not Renewed

### 1. Render

- Settings → Custom Domains → remove `api.neathunt.site`
- Update env vars:
  ```
  GOOGLE_REDIRECT_URI=https://neathunt-api.onrender.com/api/auth/google/callback
  GOOGLE_UPGRADE_REDIRECT_URI=https://neathunt-api.onrender.com/api/auth/google/callback/upgrade
  CLIENT_URL=https://neathunt.vercel.app
  ```

### 2. Vercel

- Domains → remove `neathunt.site` and `www.neathunt.site`
- Update env vars:
  ```
  VITE_API_URL=https://neathunt-api.onrender.com
  ```
- Redeploy

### 3. Google Cloud Console

- Remove `https://api.neathunt.site` from JavaScript origins
- Remove `https://api.neathunt.site/api/auth/google/callback` from redirect URIs
- Remove `https://api.neathunt.site/api/auth/google/callback/upgrade` from redirect URIs

### 4. Cloudflare

- Remove `neathunt.site` from Cloudflare entirely

### 5. Frontend code

- Update Google login button fallback:
  ```ts
  window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`;
  ```

---

## If Moving Backend (Render → elsewhere)

1. Update Cloudflare CNAME `api` target value to new host
2. Update `GOOGLE_REDIRECT_URI` and `GOOGLE_UPGRADE_REDIRECT_URI` in new host env vars
3. Update Google Cloud Console redirect URIs if domain changes
4. Update `VITE_API_URL` on Vercel if domain changes

---

## Cookie Config (why it's set this way)

```ts
res.cookie("session", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // requires HTTPS
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * ONE_DAY,
});
```

- `secure: true` + `sameSite: "none"` required for cross-domain cookies
- Frontend (`neathunt.site`) and backend (`api.neathunt.site`) share parent domain → cookies work
- Without custom domain, third-party cookie blocking in Chrome breaks auth

---

## CORS Config (why it's set this way)

```ts
app.use(
  cors({
    origin: ["https://neathunt.site", "https://www.neathunt.site"],
    credentials: true,
  }),
);
```

- `credentials: true` required for cookies to be sent cross-domain
- Both www and apex covered
- No trailing slash — CORS does exact string matching

---

## Local Dev

```
# .env (backend)
DATABASE_URL=direct NeonDB connection string
GOOGLE_REDIRECT_URI=http://localhost:4000/api/auth/google/callback
CLIENT_URL=http://localhost:5173

# .env.local (frontend) — VITE_API_URL not set, proxy handles it
```

Vite proxy forwards `/api/*` → `http://localhost:4000` in dev.
