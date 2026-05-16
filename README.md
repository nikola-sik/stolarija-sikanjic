# Business Showcase — Stolarska radnja Šikanjić

Konfigurabilna marketing web aplikacija za biznise. Trenutno postavljena za stolarsku radnju, ali lako se prilagođava drugim djelatnostima kroz **jedan config fajl**.

## Tehnologije

**Backend:**
- Spring Boot 3.3 + Java 21
- Spring Data JPA + PostgreSQL 16
- Spring Security 6 + JWT (JJWT)
- Flyway migracije
- AWS SDK v2 (S3-compatible storage)
- Springdoc OpenAPI (Swagger UI)

**Frontend:**
- Angular 18 + TailwindCSS
- Reactive Forms + Signals
- HTTP Interceptors za JWT
- Standalone komponente

**Storage:**
- MinIO lokalno (S3-compatible)
- Cloudflare R2 / Backblaze B2 u produkciji

## Struktura projekta

```
carpentry_shop/
├── backend/                          Spring Boot REST API
│   ├── src/main/java/com/businessshowcase/
│   │   ├── auth/                     Login, JWT, AdminUser
│   │   ├── gallery/                  Galerija CRUD
│   │   ├── contact/                  Contact upiti
│   │   ├── storage/                  S3 abstrakcija
│   │   ├── security/                 SecurityConfig, JWT filter
│   │   └── common/                   Audit, exceptions, OpenAPI
│   └── src/main/resources/
│       ├── application.yml           Glavna konfiguracija
│       ├── application-test.yml      H2 za testove
│       └── db/migration/             Flyway SQL skripte
│
├── frontend/                         Angular SPA
│   └── src/
│       ├── app/
│       │   ├── core/                 Servisi, modeli, interceptori
│       │   ├── pages/                Home, About, Services, Gallery, Contact
│       │   └── shared/               Header, Footer, PageHero, ProcessSteps
│       ├── assets/config/site.config.json   ← Biznis konfiguracija
│       └── environments/             API URL po environment-u
│
└── docker-compose.yml                PostgreSQL + MinIO
```

## Preduslovi

- **Java 21** — `java -version`
- **Maven 3.9+** — `mvn -v`
- **Node.js 18+** i npm — `node -v`
- **Docker Desktop** (za Postgres + MinIO lokalno)

## Pokretanje — kompletna stack

### 1. Pokreni Postgres i MinIO

```cmd
cd C:\Development\claude\carpentry_shop
docker compose up -d
```

Provjeri da rade:
- Postgres: `localhost:5432` (showcase/showcase/showcase_dev_password)
- MinIO Console: `http://localhost:9001` (minioadmin/minioadmin_dev)

### 2. Pokreni backend

```cmd
cd backend
mvn spring-boot:run
```

Backend slušaj na `http://localhost:8080`. Pri prvom pokretanju:
- Flyway kreira schemu (admin_user, gallery_item, contact_submission)
- Kreira se default admin korisnik (vidi logove: **admin / admin123**)
- MinIO bucket "gallery" se kreira automatski

**Provjeri:**
- Health: `http://localhost:8080/api/health`
- Swagger UI: `http://localhost:8080/api/v1/swagger-ui`
- Test login (PowerShell):
  ```powershell
  $body = '{"username":"admin","password":"admin123"}'
  Invoke-RestMethod -Method POST -Uri "http://localhost:8080/api/v1/auth/login" -ContentType "application/json" -Body $body
  ```

### 3. Pokreni frontend

```cmd
cd frontend
npm start
```

Otvori `http://localhost:4200`.

## Konfiguracija za drugi biznis

**Sav vizuelni sadržaj** → `frontend/src/assets/config/site.config.json`:
- Naziv, telefon, email, adresa, Instagram
- Boje, fontovi
- Hero, About, Services, Process, Gallery placeholders
- SEO meta-tagovi
- Navigacija

**Backend konfiguracija** → env varijable (vidi `application.yml`):
- `DB_*` — baza
- `JWT_SECRET` — generišite sa `openssl rand -base64 64`
- `APP_ADMIN_USERNAME` / `APP_ADMIN_PASSWORD` — initial admin
- `S3_*` — storage
- `CORS_ALLOWED_ORIGINS` — frontend URL

## API endpoint-i

### Public
- `GET /api/v1/gallery` — lista (opciono `?category=` ili `?featured=true`)
- `GET /api/v1/gallery/{id}` — pojedinačna
- `POST /api/v1/contact` — pošalji upit
- `POST /api/v1/auth/login` — login

### Admin (zahtjeva JWT u `Authorization: Bearer ...`)
- `GET /api/v1/auth/me` — info o sebi
- `POST /api/v1/admin/gallery` — kreiraj sa upload-om slike (multipart)
- `PUT /api/v1/admin/gallery/{id}` — ažuriraj
- `DELETE /api/v1/admin/gallery/{id}` — briši
- `GET /api/v1/admin/contact-submissions` — lista upita (paginated)
- `PATCH /api/v1/admin/contact-submissions/{id}/status` — update status
- `DELETE /api/v1/admin/contact-submissions/{id}` — briši

Kompletna interaktivna dokumentacija: `http://localhost:8080/api/v1/swagger-ui`

## Best practices primijenjene

✅ **Layered architecture** — Controller → Service → Repository  
✅ **DTOs (Java records)** sa Bean Validation — input se nikad ne propušta direktno u entitete  
✅ **JPA auditing** — createdAt/updatedAt automatski  
✅ **Flyway migracije** — schema je verzionisana, ne auto-DDL  
✅ **Global exception handler** — konzistentan ApiError format  
✅ **Stateless JWT** sa BCrypt password hash-om  
✅ **CORS izolovan** u SecurityConfig sa whitelist origins  
✅ **Storage abstraction** — interface, lako mijenjati provider  
✅ **OpenAPI spec** — autogenerirana iz koda  
✅ **Integration testovi** sa H2 in-memory DB i mocked storage  
✅ **Functional HTTP interceptor** (Angular 17+ style) za JWT  
✅ **Signals** za reaktivno stanje  
✅ **Environment files** za API URL po deployment-u  

## Faze izgradnje

- [x] **Faza 1** — Setup, config sistem, Home stranica
- [x] **Faza 2** — Sve podstranice (About, Services, Gallery, Kontakt)
- [x] **Faza 3** — Backend API + sigurnost + S3 + integracija sa frontom
- [ ] **Faza 4** — Admin panel u Angular-u (login + galerija + contact upiti)
- [ ] **Faza 5** — Deployment (Cloudflare Pages + Hetzner VPS + Coolify)
- [ ] **Faza 6** — AI chatbot integracija
