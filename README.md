# 4th Quarter Performance & Health — Static Showcase (Demo Mode)

A **front-end-only** showcase of the 4QPH website. There is **no database and
no backend**: the booking form and the admin dashboard are simulated entirely in
the browser using local mock data.

## Tech stack

- **Next.js** (App Router) + **Tailwind CSS**
- **Static export** (`output: "export"`) — the build produces a plain `out/`
  folder that can be hosted anywhere (GitHub Pages, Netlify, S3, Vercel static…)
- **No Prisma, no database, no email service**

## Pages

| Route            | Description                                                        |
| ---------------- | ------------------------------------------------------------------ |
| `/`              | Home — black hero, welcome text, two images                        |
| `/about`         | About — three stacked sections                                     |
| `/services`      | Services — four cards with a "Book Now" button                     |
| `/register`      | Booking flow (Demo Mode)                                           |
| `/testimonials`  | Testimonials with Instagram embeds                                 |
| `/admin`         | Hidden admin dashboard (Demo Mode)                                 |

## Demo Mode behaviour

- **Booking (`/register`)** — pick a type, date and time, fill the form, click
  **Register Now**: a modal says *"Demo Mode: Booking received! (This is a
  showcase website, no data was saved.)"* and the form resets. **No network
  request is made.**
- **Admin (`/admin`)** — log in with the demo password **`4qph-admin-2024`**
  (also shown on the login screen). The dashboard loads fake sessions and
  bookings from `src/lib/mock-data.ts`. **Create session**, **Cancel Session**
  and **Save Session** only update local React state (they move items between
  the Current/Future, Register Form and History sections). **No data is saved
  and no email is sent.** Refreshing the page resets everything.

## Getting started

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

## Static build

```bash
npm run build      # outputs ./out
```

Because the app is a pure static export, `next start` is not used. Serve the
`out/` folder with any static file server, for example:

```bash
npx serve out
```

## Where things live

| What                                   | Where                     |
| -------------------------------------- | ------------------------- |
| Fake sessions / bookings               | `src/lib/mock-data.ts`    |
| Booking flow + Demo modal              | `src/app/register/RegisterClient.tsx` |
| Admin login (demo password)            | `src/components/AdminLogin.tsx` |
| Admin dashboard (local-state actions)  | `src/components/AdminDashboard.tsx` |
| Session types                          | `src/lib/sessions.ts`     |
| Booking cut-off / timezone helper      | `src/lib/time.ts`         |
| Images                                 | `public/`                 |

## Notes

- The mock sessions are generated relative to "now", so the demo always looks
  populated (today, upcoming, recent and history sessions).
- All photos live in `/public` and are cropped with `object-fit: cover` inside
  fixed aspect-ratio containers (the logo uses `object-contain`).
