# 4th Quarter Performance & Health — Website

A multi-page website for **4th Quarter Performance & Health (4QPH)**.

## Tech stack

- **Next.js** (App Router) + **Tailwind CSS**
- **PostgreSQL** via **Prisma** (for Vercel; previously SQLite for local dev)
- **Resend** for transactional email (production-ready)

## Pages

| Route       | Description                                                                  |
| ----------- | ---------------------------------------------------------------------------- |
| `/`         | Home — black hero, welcome text, two images                                  |
| `/about`    | About — three stacked sections (black, white, teal)                          |
| `/services` | Services — four vertically stacked cards with a "Book Now" button            |
| `/register` | Register — session type → date → time → customer form → booking + 2 emails   |
| `/admin`    | Hidden, password-protected admin dashboard (create sessions, list bookings)  |

## Getting started

### 1. Prerequisites

- Node.js 18.17+ (tested with Node 24)
- A package manager — `pnpm`, `npm`, or `yarn`

### 2. Install dependencies

```bash
pnpm install
# or: npm install
```

The `postinstall` script runs `prisma generate` automatically.

### 3. Configure environment variables

Copy the example file and fill in the values:

```bash
cp .env.example .env
```

Then edit `.env`:

| Variable       | Required | Description                                                                 |
| -------------- | -------- | --------------------------------------------------------------------------- |
| `DATABASE_URL` | yes      | PostgreSQL connection string, e.g. `postgresql://user:password@host:5432/db` |
| `ADMIN_EMAIL`  | yes      | Email that receives new-booking notifications (`jeffery071004@gmail.com`)   |
| `ADMIN_PASSWORD` | yes    | Password that protects the hidden `/admin` dashboard                        |
| `RESEND_API_KEY` | yes    | Resend API key (from <https://resend.com/api-keys>)                         |
| `RESEND_FROM`  | yes      | `From` address for outgoing mail (verify your domain in Resend first)       |

### 4. Initialize the database

```bash
pnpm prisma db push
# or: pnpm db:push
```

This creates the PostgreSQL tables `Session` and `Booking`. For local dev you
can point `DATABASE_URL` at a local Postgres instance or a hosted one (Vercel
Postgres, Neon, etc.).

### 5. Run the dev server

```bash
pnpm dev
# or: npm run dev
```

Open <http://localhost:3000>.

## Admin dashboard

1. Visit <http://localhost:3000/admin>.
2. Enter the value of `ADMIN_PASSWORD`.
3. From the dashboard you can:
   - **Create a session** (date, start time, end time, session type, optional notes)
   - **Cancel** or **archive** sessions and record customer attendance

The admin password is verified server-side and stored as an `httpOnly` session
cookie; it is never exposed to the client.

## Booking flow

1. On `/register`, pick a session type, then a date (the calendar blocks past
   dates), then an available time slot (sessions created by the admin for that
   date and type).
2. Fill in the form and click **Register Now**.
3. The server validates everything (email format, participants ≥ 1, required
   fields), saves the booking, then sends **two emails**:
   - **Admin** — subject `New Booking: <First> <Last> - <Session Type> (<Date>)`
     with a formatted HTML table of the booking details.
   - **Customer** — a confirmation with the same details and a "We'll see you
     there" message.
4. If email sending fails, the booking is still kept and a warning is returned.
5. There is **no capacity limit** — participants are simply recorded.

## Data model

- **Session**: `id`, `date`, `startTime`, `endTime`, `type`, `notes?`, `createdAt`
- **Booking**: `id`, `sessionId` (FK), `firstName`, `lastName`, `email`,
  `participants`, `gender`, `createdAt`

## Images

All images live in `/public` and are referenced by filename. Every photo is
placed in a **fixed aspect-ratio container** and rendered with
`object-fit: cover` (centered), so images are cropped — never stretched or
distorted. The logo uses `object-contain` (scale-to-fit) so the full mark stays
visible.

Provided assets (already in `/public`):

`4Q_Logo.png`, `home_1.JPG`, `home_2.JPG`, `about_1.JPG`, `about_2.jpg`,
`services_high.jpg`, `services_uni.jpg`, `services_women.jpg`, `services_men.jpg`

## Security notes

- No secrets are hardcoded. Everything secret lives in `.env` (which is
  gitignored). `.env.example` documents every variable.
- Admin password and Resend API key are only read server-side and are never
  shipped to the client.

## Vercel Deployment

Set these environment variables in **Vercel → Project → Settings → Environment
Variables**:

| Variable          | Where to get it                                                                 |
| ----------------- | ------------------------------------------------------------------------------- |
| `DATABASE_URL`    | Your Postgres connection string (Vercel Postgres / Neon / Supabase)             |
| `ADMIN_EMAIL`     | The email that receives booking notifications (e.g. `jeffery071004@gmail.com`)  |
| `ADMIN_PASSWORD`  | Any secret you choose for the `/admin` dashboard                                |
| `RESEND_API_KEY`  | Resend → API Keys (<https://resend.com/api-keys>)                               |
| `RESEND_FROM`     | `"4th Quarter Performance & Health <noreply@yourdomain.com>"` after verifying your domain |

### 1. Create a Postgres database

- **Vercel Postgres:** in Vercel, open your project → **Storage** → **Create
  Database** → **Postgres** → follow the wizard. Vercel injects a `DATABASE_URL`
  automatically (or gives it to you to copy).
- **Neon (alternative):** <https://neon.tech> → create a project → copy the
  connection string.

It looks like:

```
postgresql://user:password@host:5432/dbname?sslmode=require
```

### 2. Create the tables

Once `DATABASE_URL` is set, run:

```bash
npx prisma db push
```

(The `postinstall` script already runs `prisma generate` on every Vercel build,
so the client is regenerated automatically.)

### 3. Get a Resend API key

1. Sign up at <https://resend.com>.
2. Go to **API Keys** → **Create API Key**.
3. Copy the `re_...` key into `RESEND_API_KEY`.

### 4. Verify a sending domain

1. In Resend → **Domains** → **Add Domain**, add your domain (e.g. `yourdomain.com`).
2. Add the DNS records Resend shows you.
3. Once verified, set `RESEND_FROM` to
   `"4th Quarter Performance & Health <noreply@yourdomain.com>"`.

> Until you verify a domain, Resend only allows sending **to your own account
> email** from `onboarding@resend.dev` — fine for testing.

### 5. Deploy

1. Push the project to GitHub.
2. In Vercel, **Add New → Project**, import the repo (Framework: Next.js;
   build command `next build`; output directory `.next`).
3. Add the environment variables above.
4. Vercel runs `npm install` (which runs `prisma generate`) and `next build`
   automatically.

## Scripts

| Script          | Description                        |
| --------------- | ---------------------------------- |
| `pnpm dev`      | Start the Next.js dev server       |
| `pnpm build`    | Production build                   |
| `pnpm start`    | Serve the production build         |
| `pnpm db:push`  | Apply the Prisma schema to PostgreSQL |
| `pnpm db:migrate` | Create/apply a Prisma migration  |
| `pnpm db:studio` | Open Prisma Studio               |

## Smoke test (optional)

With the dev server running, a self-contained acceptance check is available:

```bash
node --env-file=.env scripts/smoke.mjs
```

It verifies page content, image handling (`object-fit: cover` + fixed
aspect-ratio containers), sticky navbar, server-side validation, admin
authentication, session creation, availability, and the booking + dual-email
flow. It expects the server at <http://localhost:3000>.

