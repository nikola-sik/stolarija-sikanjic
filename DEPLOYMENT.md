# Deployment uputstvo

Production setup: **Cloudflare Pages** (frontend) + **Railway** (backend + Postgres) + **Cloudflare R2** (slike) + **stolarija-sikanjic.com** (domena).

## Pregled arhitekture

```
                    ┌─────────────────────────┐
   Browser ──HTTPS──│  Cloudflare Pages       │
                    │  (Angular SPA)          │
                    │  stolarija-sikanjic.com │
                    └────────────┬────────────┘
                                 │ API calls
                                 ▼
                    ┌─────────────────────────┐
                    │  Railway                │
                    │  Spring Boot backend    │
                    │  api.stolarija-...com   │
                    └──────┬──────────────┬───┘
                           │              │
              ┌────────────▼──┐  ┌────────▼─────────┐
              │ Railway       │  │ Cloudflare R2    │
              │ PostgreSQL    │  │ (slike galerije) │
              └───────────────┘  └──────────────────┘
```

## Cijene (mjesečno)

| Servis | Plan | Cijena |
|---|---|---|
| Cloudflare Pages | Free | $0 |
| Cloudflare R2 | 10GB free tier | $0 (kasnije ~$0.15/GB) |
| Railway (backend + Postgres) | Hobby plan | $5 |
| Domena `stolarija-sikanjic.com` | — | ~$10/godina |
| **Ukupno** | | **~$5/mj + $10/god** |

## Sekvenca koraka

1. **Cloudflare R2 bucket** — kreiraj `sikanjic-gallery`, dobij credentials
2. **GitHub repo** — push koda
3. **Railway** — deploy backend + PostgreSQL
4. **Cloudflare Pages** — deploy frontend
5. **Update environment.prod.ts** sa Railway URL-om → push → Pages rebuilduje
6. **CORS update** u Railway env vars
7. **Domena** — registruj `stolarija-sikanjic.com`, point DNS na Cloudflare

Detaljni walk-through je u README.md i u promptu kad krenemo sa deployom.

## Environment varijable

### Railway (backend)

```
SPRING_PROFILES_ACTIVE=prod
PORT=${PORT}                       # Railway auto-postavlja
DB_URL=jdbc:postgresql://${PGHOST}:${PGPORT}/${PGDATABASE}
DB_USERNAME=${PGUSER}
DB_PASSWORD=${PGPASSWORD}
JWT_SECRET=<openssl rand -base64 64>
JWT_ISSUER=stolarija-sikanjic
APP_ADMIN_USERNAME=admin
APP_ADMIN_PASSWORD=<jaka lozinka, NE admin123>
S3_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
S3_REGION=auto
S3_BUCKET=sikanjic-gallery
S3_ACCESS_KEY=<R2 access key>
S3_SECRET_KEY=<R2 secret key>
S3_PUBLIC_URL=https://pub-<HASH>.r2.dev
S3_PATH_STYLE=false
CORS_ALLOWED_ORIGINS=https://stolarija-sikanjic.com,https://www.stolarija-sikanjic.com,https://<your-project>.pages.dev
BUSINESS_NAME=Stolarska radnja Šikanjić
```

### Cloudflare Pages (frontend)

Frontend nema runtime env vars — sve se kompajlira u JS u build vremenu kroz `environment.prod.ts`. Build na Cloudflare Pages koristi taj fajl automatski jer angular.json ima `fileReplacements` za production konfiguraciju.
