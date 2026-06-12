# Frontend

React frontend for the AAAB food delivery platform. Desktop-first SaaS-style UI with role-based views for customers, couriers, restaurant staff, and admins.

## Stack

- React 19, TypeScript 6, Vite 8
- Tailwind CSS 4 (CSS-first config)
- React Router 7
- Apollo Client 4 (GraphQL)
- Keycloak JS 26 (auth)
- Axios (REST)

## Getting started

```bash
npm install
npm run dev
```

Requires a running Keycloak instance and API gateway. Copy `.env.example` to `.env` and configure the URLs.

## Quality gates

```bash
npm run build          # TypeScript + Vite build, zero errors
npx eslint src/ --max-warnings 0   # ESLint, zero warnings
```

## Project structure

```
src/
  api/              One file per resource (orders, restaurants, payments, couriers, userQueries)
  components/
    layout/         Sidebar, TopBar, AppLayout
    ui/             Button, Card, Input, Modal, DataTable, PageHeader, StatusBadge, etc.
  context/          AuthProvider, CartProvider, NotificationProvider
  lib/              Apollo client setup, WebSocket notifications hook
  pages/
    home/           Landing page (unauthenticated hero / authenticated dashboard)
    auth/           Keycloak login callback
    restaurants/    Restaurant list (grid) + detail (menu + cart)
    orders/         Order list (table), detail (info + status timeline), create (form)
    payments/       Payment status table
    profile/        User profile with avatar, personal info, delivery preferences
    dashboard/      Courier dispatch, restaurant order management, admin overview
    not-found/      404 catch-all
  security/         Keycloak config, axios interceptor, RequireAuth, RoleGuard
  types/            TypeScript interfaces for all backend entities
  utils/            Date, price, and label formatters
  settings.ts       Env-var config (VITE_*)
```

## Key features

- Collapsible dark sidebar with role-filtered navigation
- Notification bell with unread count, mark-as-read on hover, persisted dismiss state
- REST and GraphQL data sources (toggleable on restaurant pages)
- Real-time order status updates via WebSocket
- Responsive: sidebar overlay on mobile, persistent on desktop

