# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite dev server (localhost:5173)
npm run build     # Production build
npm run lint      # Run ESLint
npm run preview   # Preview production build
```

## Environment

The app reads `VITE_API_URL` (defaults to `https://oncepuntos.duckdns.org`). Create a `.env.local` file to override:

```
VITE_API_URL=https://oncepuntos.duckdns.org
```

## Architecture

Spanish-language e-commerce SPA (Oncepuntos). React 19 + Vite + React Router v7. No state management library — everything is React Context.

**Provider hierarchy (`App.jsx`):**
1. `AuthProvider` — user, token, favorites; persists token to `localStorage`
2. `CartProvider` — cart items, totals

**Routes:**
- `/` → `ShopPage` — product catalog with filtering, pagination, search
- `/checkout` → `CheckoutPage`
- `/favoritos` → `FavoritesPage`

**API layer:** No dedicated API module — `fetch` calls are made directly inside context files and pages. Base URL comes from `import.meta.env.VITE_API_URL`. Auth token is passed as `Bearer` in `Authorization` header.

Key endpoints (all under `/api`):
- `/shop/register`, `/shop/login` — auth
- `/shop/favorites`, `/shop/favorites/:id` — favorites (GET / POST / DELETE)
- `/shop/orders` — user orders
- `/products` — paginated catalog (`limit`, `offset`, `category_id`, `sort`)
- `/products/search?name=` — search
- `/products/categories` — category list

**`src/data/mockProducts.js`** — fallback mock data used when the API is unavailable.

**Components of note:**
- `CartDrawer` / `OrdersDrawer` — slide-in panels controlled by boolean state in `Header`
- `AuthModal` — handles both login and register flows in one modal
- `ChatBot` (`src/components/layout/ChatBot.jsx`) — floating chatbot widget
- `CheckoutForm` (`src/components/checkout/CheckoutForm.jsx`) — payment form, calls the backend on submit
