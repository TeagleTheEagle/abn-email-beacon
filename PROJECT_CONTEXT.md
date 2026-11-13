# Project Context: Teague Industries Authentication System

**Last Updated:** 2026-11-07  
**Branch:** main  
**Status:** In progress — route tree generation conflict blocking verification

---

## Completed Work

### 1. Database Schema (Supabase)

- **File:** `drizzle/migrations/0001_profiles_table.sql`
- Profiles table with `id` (UUID, FK to `auth.users`), `full_name`, `business_name`, `phone`, `created_at`, `updated_at`
- RLS policies: users can SELECT/UPDATE/INSERT their own profile
- Trigger `on_auth_user_created` auto-creates profile on signup
- ON DELETE CASCADE from auth.users

### 2. Supabase Types

- **File:** `src/integrations/supabase/types.ts`
- Added `profiles` table to `Database['public']['Tables']`

### 3. Auth Context

- **File:** `src/contexts/AuthContext.tsx`
- `AuthProvider` wraps app with Supabase auth state management
- `onAuthStateChange` filtered to `SIGNED_IN`, `SIGNED_OUT`, `USER_UPDATED`
- `useAuth()` hook returns `{ user, profile, loading, signOut, refreshProfile }`
- **File:** `src/routes/__root.tsx` — wrapped `<Outlet />` with `<AuthProvider>`

### 4. Site Navigation

- **File:** `src/components/SiteNav.tsx`
- Signed out: "Client Portal" link → `/auth`
- Signed in: Avatar dropdown with:
  - User email + "Account" link → `/_authenticated/account`
  - "Sign out" button (calls `signOut()`)

### 5. Auth Routes

#### `/auth` (Sign In / Sign Up)

- **File:** `src/routes/auth.tsx`
- Tabs: "Sign in" / "Create account"
- Email/password forms with React Hook Form + Zod validation
- "Forgot password?" → Dialog → `/reset-password` flow
- Google OAuth button (`signInWithOAuth` with `access_type: offline`, `prompt: consent`)
- Redirect handling via `?redirect=` search param

#### `/reset-password`

- **File:** `src/routes/reset-password.tsx`
- Recovers session via `exchangeCodeForSession` (PKCE flow)
- Password strength indicator (zxcvbn-style checks)
- Updates password via `supabase.auth.updateUser({ password })`

### 6. Protected Layout & Account Page

#### Authenticated Layout (`_layout.tsx`)

- **File:** `src/routes/_authenticated/_layout.tsx` (renamed from `layout.tsx`)
- `beforeLoad` guard: redirects to `/auth?redirect=/_authenticated/account` if no user
- Renders `<Outlet />` for child routes

#### `/_authenticated/account` (Account Dashboard)

- **File:** `src/routes/_authenticated/account.tsx`
- Three tabs: **Profile**, **Security**, **Danger zone**
- **Profile:** Edit full name, business name, phone; save to `profiles` table
- **Security:** Change password (current + new + confirm); "Sign out everywhere" (global signout)
- **Danger zone:** Delete account (requires email confirmation; calls `supabase.auth.admin.deleteUser` via client)
- Uses `useAuth()` for profile data and `refreshProfile()`

### 7. Tests

- **File:** `src/contexts/AuthContext.test.tsx` — AuthContext unit tests (mocked Supabase)
  - Mostly passing; 2 timing-related failures on `USER_UPDATED`/`refreshProfile`
- **File:** `src/routes/_authenticated/-account.test.tsx` — Route matching tests using `router.matchRoutes()`
  - Tests for `/auth`, `/reset-password`, `/_authenticated/account`

### 8. TypeScript Fixes Applied

- Fixed `Profile` type import in `AuthContext.tsx`
- Fixed `Tabs` `onValueChange` typing in `auth.tsx`
- Fixed duplicate `name` props on `TabsTrigger` in `account.tsx`
- Fixed `useSearch` API usage in `auth.tsx` and `reset-password.tsx`
- Fixed `map` types in `index.tsx`

---

## Remaining Tasks

### 1. **CRITICAL: Fix Route Tree Generation Conflict** ⚠️

**Error:** `Conflicting configuration paths were found for the following routes: "/", "/". Conflicting files: src/routes/index.tsx, src/routes/_authenticated/_layout.tsx`

**Root cause:** The authenticated layout route (`_layout.tsx`) uses `path: ""` with `getParentRoute: () => RootRouteExport`, which creates a route at `/` conflicting with `index.tsx`.

**Solution needed:** Configure the authenticated layout as a proper parent route for `/account` without creating a conflicting path. Based on TanStack Router conventions:

- The layout file should be named `_layout.tsx` inside `_authenticated/` folder ✓ (done)
- It should use a path that represents the folder (`/_authenticated` or similar)
- The account route should use `getParentRoute: () => LayoutRoute` ✓ (already done in account.tsx)

**Current state:** Renamed `layout.tsx` → `_layout.tsx`; account.tsx imports `LayoutRoute` from `./_layout` and uses it as parent. Need to fix the path configuration in `_layout.tsx`.

### 2. Run Full Verification Suite

```bash
npx tsc --noEmit       # Type check
npm test               # All tests
npm run build          # Production build
npm run lint           # ESLint
npm run format         # Prettier
```

### 3. Commit & Push

```bash
git add -A
git commit -m "feat: complete auth system with email/password, Google OAuth, account dashboard"
git push origin main
```

### 4. Supabase Dashboard Configuration (Manual)

- Enable Google OAuth provider in Supabase Auth settings
- Add authorized redirect URLs: `https://www.teagueindustries.com.au/auth`, `https://abn-email-beacon.lovable.app/auth`
- Customize email templates (Confirm signup, Reset password, Magic link)

### 5. Future Enhancements

- Phone number validation (Australian format: `+61 4xx xxx xxx`)
- Test OAuth flow end-to-end
- Add rate limiting on auth endpoints

---

## Important Project Details

### Stack

- **Framework:** TanStack Start (React 19, SSR) + TanStack Router (file-based)
- **Auth:** Supabase Auth (email/password, Google OAuth, PKCE)
- **Database:** Supabase (PostgreSQL) with RLS
- **UI:** shadcn/ui (new-york) + Tailwind v4 + custom utilities (`glass`, `btn-primary`, `field`, `label`, `font-display`, `chrome-line`)
- **Forms:** React Hook Form + Zod
- **Locale:** Australian English, AUD pricing, "businesses of every size"

### Key Conventions

- Path alias `@/` → `src/`
- TypeScript strict: `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noPropertyAccessFromIndexSignature`
- `src/routeTree.gen.ts` is **generated** — never edit manually
- Run `npx @tanstack/router-cli generate` after route changes

### Environment Variables (`.env`)

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...  (server only)
```

### File Structure (Auth-Related)

```
src/
├── contexts/
│   ├── AuthContext.tsx
│   └── AuthContext.test.tsx
├── routes/
│   ├── auth.tsx
│   ├── reset-password.tsx
│   ├── __root.tsx
│   ├── _authenticated/
│   │   ├── _layout.tsx          # Layout route (parent)
│   │   ├── account.tsx          # Account dashboard
│   │   └── -account.test.tsx    # Route matching tests
│   └── index.tsx                # Home page (conflicts with layout)
├── components/
│   └── SiteNav.tsx              # Auth-aware header
└── integrations/supabase/
    ├── client.ts                # Browser client (anon)
    ├── client.server.ts         # Server client (service role)
    └── types.ts                 # Database types (includes profiles)
```

---

## Instructions for Continuing in a New Session

1. **First:** Fix the route tree generation conflict in `src/routes/_authenticated/_layout.tsx`
   - Change `path: ""` to a non-conflicting path (e.g., `path: "/_authenticated"` or use folder-based routing convention)
   - Ensure `getParentRoute` correctly references root
   - Run `npx @tanstack/router-cli generate` to verify

2. **Then:** Run the full verification suite (see commands above)

3. **If all passes:** Commit and push to `main`

4. **Manual steps:** Configure Google OAuth in Supabase Dashboard, customize email templates

5. **Test:** Sign up, sign in, OAuth, password reset, account dashboard, sign out everywhere, delete account

---

## Current Blockers

| Blocker                        | Impact                                     | Resolution                           |
| ------------------------------ | ------------------------------------------ | ------------------------------------ |
| Route tree generation conflict | Cannot run build, tests, or verify routing | Fix `_layout.tsx` path configuration |

---

## Related Memories

- [[always-merge-to-main]] — No branches/PRs; merge directly to main
- [[site-push-and-publish]] — `git push` may hang on credential popup; use `gh` creds; Lovable needs `deploy_project` after push
- [[jarvis-changes-go-into-the-exe]] — JARVIS changes ship via release + `update-step.cmd`

---

_This document captures the state at context exhaustion. Resume by fixing the route tree conflict, then run the verification suite._
