# FoodRush

A production-ready food delivery mobile app built with Expo/React Native and a Node.js/Express/MongoDB backend.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, path `/api`)
- `pnpm --filter @workspace/mobile run dev` — run the Expo app
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- **Mobile**: Expo 53 / React Native, expo-router v6, Socket.io-client, AsyncStorage
- **API**: Express 5, Mongoose/MongoDB, Socket.io, JWT auth (jsonwebtoken + bcryptjs), Razorpay
- **Build**: esbuild (CJS bundle), mongoose externalized

## Environment Variables / Secrets

| Secret | Purpose |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `RAZORPAY_KEY_ID` | Razorpay public key |
| `RAZORPAY_KEY_SECRET` | Razorpay signature verification secret |
| `SESSION_SECRET` | (reserved for future session use) |
| `EXPO_PUBLIC_DOMAIN` | Set automatically by Expo workflow to `$REPLIT_DEV_DOMAIN` |

## Where things live

- `artifacts/api-server/src/` — Express server (routes, models, lib)
  - `routes/auth.ts` — register, login, /me, addresses
  - `routes/restaurants.ts` — list (search/filter/featured) + detail
  - `routes/orders.ts` — create, list, get, cancel, verify-payment + status simulation
  - `routes/seed.ts` — POST /api/seed/restaurants (idempotent), DELETE
  - `models/` — User, Restaurant, Order (Mongoose schemas)
  - `lib/socket.ts` — Socket.io init, JWT auth middleware, room management
- `artifacts/mobile/` — Expo app
  - `app/(auth)/` — welcome, login, register screens
  - `app/(tabs)/` — home, search, orders, profile tabs
  - `app/restaurant/[id].tsx` — restaurant detail + menu
  - `app/cart.tsx` — cart screen
  - `app/checkout.tsx` — delivery address, payment method, place order
  - `app/order-tracking/[id].tsx` — real-time order tracking
  - `context/AuthContext.tsx` — auth state + API calls
  - `context/CartContext.tsx` — cart state, persisted to AsyncStorage
  - `lib/api.ts` — all API calls (wraps fetch with auth headers)
  - `lib/socket.ts` — Socket.io client (lazy connect, getSocket())
  - `components/MapView.tsx` — web fallback (LinearGradient placeholder)
  - `components/MapView.native.tsx` — native MapView with react-native-maps

## Architecture decisions

- **Platform-split MapView**: `react-native-maps` uses `codegenNativeComponent` which crashes on web. Use `MapView.tsx` (web fallback) + `MapView.native.tsx` (native). Never import react-native-maps at module level in shared files.
- **Socket.io path**: `/api/socket.io` — must match between server init and client connect options
- **MongoDB external in esbuild**: `mongoose` is in the `external` array in `build.mjs` so it's not bundled
- **API server starts even if MongoDB fails**: `connectDB()` catches errors and logs but doesn't `process.exit(1)`, so `/api/healthz` always responds
- **Seed is idempotent**: `POST /api/seed/restaurants` checks count > 0 before inserting — safe to call on every login

## Product

FoodRush is a food delivery app. Users can browse restaurants, view menus, add items to cart, checkout with Razorpay payments, and track orders in real-time. Auth via JWT. Restaurant/order data stored in MongoDB Atlas.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- **MongoDB Atlas IP Whitelist**: The Replit container IP must be whitelisted in Atlas → Network Access. Add `0.0.0.0/0` (Allow from Anywhere) for development. Without this, all DB calls fail but the server still starts.
- **react-native-maps version**: Installed 1.27.2 but Expo SDK expects 1.20.1. Functionality still works but Expo will warn on startup.
- **Metro watcher crash after package install**: If Metro crashes with ENOENT on `@types/whatwg-url_tmp_*`, restart the mobile workflow — it recovers automatically.
- **Razorpay native SDK**: Full Razorpay checkout (RazorpayCheckout.open) requires a development build (`expo prebuild`). In Expo Go / web, orders are placed but payment UI is skipped with a notice.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
