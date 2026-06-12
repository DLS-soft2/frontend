# Frontend

React frontend for the DLS-2 food delivery platform. Desktop-first SaaS-style UI with role-based views for customers, couriers, restaurant staff, and admins.

## Stack

- React 19, TypeScript 6, Vite 8
- Tailwind CSS 4 (CSS-first config)
- React Router 7
- Apollo Client 4 (GraphQL)
- Keycloak JS 26 (auth)
- Axios (REST)

## Getting Started

```bash
npm install
npm run dev
```

Requires a running Keycloak instance and API gateway. See [Environment Variables](#environment-variables) below.

## Environment Variables

Configure via `.env` file or shell environment. All variables are prefixed with `VITE_` for Vite's client-side injection.

| Variable | Purpose | Default |
|----------|---------|---------|
| `VITE_KEYCLOAK_URL` | Keycloak base URL | `http://localhost:8080` |
| `VITE_API_BASE_URL` | API Gateway base URL | `""` (same origin) |
| `VITE_NOTIFICATION_WS_URL` | WebSocket URL for notifications | `""` |

Keycloak realm (`dls`) and client ID (`dls-gateway`) are hardcoded in `src/settings.ts`.

## Docker

The frontend is included in the full-stack Docker Compose setup:

```bash
docker compose -f infra/docker/docker-compose.yaml up frontend
```

Build args are passed at image build time (not runtime) since Vite inlines them:

```yaml
build:
  args:
    VITE_API_BASE_URL: ""
    VITE_KEYCLOAK_URL: http://localhost:8080
    VITE_NOTIFICATION_WS_URL: ""
```

## Quality Gates

```bash
npm run build                        # TypeScript + Vite build, zero errors
npx eslint src/ --max-warnings 0     # ESLint, zero warnings
```

## Project Structure

```
src/
  api/              REST + GraphQL calls, one file per resource
    couriers.ts       Courier assignment and delivery endpoints
    orders.ts         Order CRUD and status transitions
    payments.ts       Payment status queries
    restaurants.ts    Restaurant and menu REST calls
    restaurantQueries.ts  GraphQL queries for restaurants
    userQueries.ts    GraphQL queries for user profiles
  components/
    layout/         AppLayout, Sidebar, TopBar
    ui/             Button, Card, Input, Modal, DataTable, PageHeader,
                    StatusBadge, SagaTimeline, ApiSourceToggle, etc.
  context/          AuthProvider, CartProvider, NotificationProvider
  lib/              Apollo client setup, WebSocket notifications hook
  pages/
    home/           Landing (unauthenticated hero / authenticated dashboard)
    auth/           Keycloak login callback
    restaurants/    Restaurant list (grid) + detail (menu + cart)
    orders/         Order list (table), detail (saga timeline), create (form)
    payments/       Payment status table
    profile/        User profile with avatar, personal info, preferences
    dashboard/      Role-specific dashboards:
                      AdminDashboard, CourierDashboard, RestaurantDashboard
    not-found/      404 catch-all
  security/         Keycloak config, axios interceptor, RequireAuth, RoleGuard
  types/            TypeScript interfaces (order, payment, restaurant, user, etc.)
  utils/            Date, price, and label formatters
  settings.ts       Centralised env-var config (VITE_*)
```

## Key Features

- Collapsible dark sidebar with role-filtered navigation
- Role-based dashboards: customer order flow, courier dispatch, restaurant order management, admin overview
- REST and GraphQL data sources (toggleable on restaurant pages via `ApiSourceToggle`)
- Real-time order status updates via WebSocket
- Notification bell with unread count, mark-as-read on hover, persisted dismiss state
- Saga timeline component showing order status progression
- Cart context for multi-item order placement
- Responsive: sidebar overlay on mobile, persistent on desktop
