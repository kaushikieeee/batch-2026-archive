# Batch 2022–26 · Memory Archive

> A cinematic, memory-driven website for your graduating class.

---

## ✨ Features

- **Landing Page** — Animated hero with rotating words, glowing typography
- **Journey** — Scroll-driven timeline with alternating cards and parallax
- **Yearbook** — Grayscale → colour photo cards with profile modals
- **Media Vault** — Masonry gallery with year filters and fullscreen lightbox
- **The Wall** — Sticky-note message board (Supabase-powered)
- Custom cursor glow, grain overlay, vignette, page transitions

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy env file and fill in Supabase keys (optional for now)
cp .env.example .env

# 3. Run dev server
npm run dev
```

App runs at **http://localhost:5173**

---

## 🗄️ Supabase Setup (When Ready)

### Tables

```sql
-- Users (plaintext passwords — localhost only!)
create table users (
  id uuid default gen_random_uuid() primary key,
  username text unique not null,
  password text not null
);

-- Messages (The Wall)
create table messages (
  id uuid default gen_random_uuid() primary key,
  name text default 'Anonymous',
  message text not null,
  created_at timestamptz default now()
);

-- Students (Yearbook)
create table students (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  section text,
  role text,
  quote text,
  image text  -- storage URL
);

-- Student messages (Yearbook modals)
create table student_messages (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references students(id),
  message text not null,
  author text,
  created_at timestamptz default now()
);

-- Media (Vault)
create table media (
  id uuid default gen_random_uuid() primary key,
  year text,  -- '1st yr', '2nd yr', etc
  src text,   -- storage URL
  caption text,
  aspect text default 'square',
  created_at timestamptz default now()
);
```

### Enabling Supabase

In each page file, uncomment the Supabase import and the `useEffect` / fetch calls,
and comment out the mock data imports. Everything is already wired up.

### Admin Moderation Mode

1) Run the SQL migration file in Supabase SQL Editor:

`supabase/all_in_one_godmode.sql`

2) Promote an admin user:

```sql
update users set is_admin = true where username = 'admin';
```

3) Login as that user and open `/admin`.

Admin panel includes:
- CSV import for users (`username,password` columns)
- Manual user creation
- Wall message approval / rejection
- Photo approval / rejection
- Yearbook memo approval / rejection
- Full user list with password visibility toggle (localhost-only)

---

## 🎨 Design System

| Token | Value |
|-------|-------|
| Background | `#1A1A1A` |
| Card bg | `#222222` |
| Yellow accent | `#F4C430` |
| Soft yellow | `#FFD95A` |
| Body text | `#EAEAEA` |
| Muted | `#888888` |

**Fonts:** Cormorant Garamond (headings) · Manrope (body) · Space Mono (labels)

---

## 🏗️ Project Structure

```
src/
 ├── components/
 │   ├── Navbar.jsx       ← Transparent → glass on scroll
 │   ├── Hero.jsx         ← Landing section with animations
 │   ├── Timeline.jsx     ← Alternating scroll timeline
 │   ├── YearbookCard.jsx ← Grayscale → color + modal
 │   ├── MessageCard.jsx  ← Rotated sticky notes
 │   └── Gallery.jsx      ← Masonry + lightbox
 │
 ├── pages/
 │   ├── Home.jsx
 │   ├── Journey.jsx
 │   ├── Yearbook.jsx
 │   ├── Vault.jsx
 │   └── Wall.jsx
 │
 ├── lib/
 │   ├── supabase.js      ← All DB helpers (ready to use)
 │   └── mockData.js      ← Dev data (replace with real data)
 │
 └── styles/
     └── globals.css      ← Grain, glow, cursor, vignette
```
