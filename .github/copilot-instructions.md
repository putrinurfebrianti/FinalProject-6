Project structure & quick overview
===============================

- This repo is two apps in one workspace:
  - `wms_api` (Laravel 12 + PHP 8.2) — REST API backend with Laravel Sanctum authentication.
  - `wms_fe` (React + TypeScript + Tailwind + Vite) — Frontend UI built from TailAdmin template.

High-level architecture
-----------------------

- Backend: `wms_api` exposes a JSON REST API at `routes/api.php`. Controllers are grouped under `app/Http/Controllers/Api` and further split by role: `Admin`, `Supervisor`, `Superadmin`, `User`. Middleware lives in `app/Http/Middleware` and implements role-based access using `Auth::user()->role`.
- Frontend: Single-page React app under `wms_fe/src`. Routes use `react-router` and role-aware wrappers under `src/routes/*` (e.g., `AdminRoute.tsx`). The UI layout and navigation are under `src/layout/` and `src/components`.

Key developer workflows
-----------------------

- Setup backend (quick):
  - cd `wms_api`
  - Install backend deps + basic setup with Laravel: `composer run-script setup` or run the commands individually:
    - `composer install`
    - `cp .env.example .env` (or manually create `.env`)
    - `php artisan key:generate`
    - `php artisan migrate --seed`
  - Launch backend for development: `php artisan serve --host=127.0.0.1 --port=8000` (frontend assumes backend at 127.0.0.1:8000).
  - Or use the all-in-one script from `composer.json`: `composer run dev` (runs server, queue, pail logger, and vite concurrently).

- Setup frontend:
  - cd `wms_fe`
  - `npm install`
  - `npm run dev` to start Vite dev server (hot reload).

- Tests:
  - Backend: `composer test` (uses `php artisan test` / PHPUnit configuration in `phpunit.xml`). Tests use sqlite memory by default.
  - Frontend lint: `npm run lint` and build with `npm run build`.

Project-specific conventions & patterns
-------------------------------------

- Role-based API: Routes in `routes/api.php` are grouped and protected with middleware: `auth:sanctum` plus `user`, `admin`, `supervisor`, `superadmin`. Add new endpoints to the correct route group by role.
- Controllers: Put controllers into `app/Http/Controllers/Api/<RoleName>`. Keep role logic in middleware and simple guards (`Auth::user()` & `branch_id` scope checks).
- Logging: Use `ActivityLog` model when you want to persist notable events (login, register, create inbound/outbound, generating reports). Search `ActivityLog` usage in controllers for examples.
- Response shape: Controllers generally return JSON objects with `status` (`success` or `error`) and `data`/`message`/`errors`. Frontend expects this pattern; keep it consistent when adding endpoints.
- Auth & tokens: Backend uses Laravel Sanctum for API tokens. Frontend stores token & user in `localStorage` via `AuthContext` (see `wms_fe/src/context/AuthContext.tsx`) and adds `Authorization: Bearer <token>` headers in fetch calls.

Frontend specifics
-----------------

- The frontend uses `fetch(...)` with hard-coded API base URL `http://127.0.0.1:8000/api/...`. If the backend runs on a different host/port, update fetch URLs across `wms_fe/src/pages` or centralize them.
- Routes & nav: Pages are under `wms_fe/src/pages`. Add a new page component and add a route to the appropriate `src/routes/*` wrapper depending on role. Sidebar navigation items are configured in `wms_fe/src/layout/AppSidebar.tsx` as role-specific arrays.
- Token usage & user routing: `SignInForm` stores token via `AuthContext.login`; role-aware redirects are implemented in the sign-in flow. Use the user's `role` to decide where to redirect after login.

Adding new API endpoints (best practice example)
-----------------------------------------------

1. Add a route in `routes/api.php` under the right role prefix and middleware.
   Example (admin-only):
   ```php
   Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
       Route::post('/reports/recount', [ReportController::class, 'recount']);
   });
   ```
2. Create/Update controller method in `app/Http/Controllers/Api/Admin/ReportController.php`.
3. Keep response format consistent (`status` + `data`/`message`) and scope to `Auth::user()->branch_id` if it operates on branch-scoped data.
4. Add activity log entries with `ActivityLog::create([...])` when appropriate.
5. Add migration or seeder if adding new DB fields. Update `database/seeders` when relevant.
6. Add Feature/Unit test in `tests/Feature` or `tests/Unit`.

Adding a new frontend page or API integration
-------------------------------------------

1. Add a React page under `wms_fe/src/pages` and a route in the appropriate wrapper (`AdminRoute`, `SupervisorRoute`, etc.).
2. Add a navigation entry in `wms_fe/src/layout/AppSidebar.tsx` for the appropriate role list.
3. Use `const { token } = useAuth()` and add `Authorization: Bearer ${token}` header to fetch calls.
4. Prefer consistent response handling (read `data` and check `response.ok`) per existing pages.

Troubleshooting / debugging
---------------------------

- Always verify the backend runs on port 8000 when using the frontend, otherwise update API URLs.
- For backend errors, check `storage/logs/laravel.log` (or run `php artisan pail` for live logs) and `ActivityLog` table if actions are logged.
- For dev server issues, check node versions (project uses Node 18/20 recommended), PHP 8.2, and Composer 2.
- Use `composer run dev` from `wms_api` to start backend & frontend concurrently (depends on `npm` + `npx concurrently`).

Files of interest (quick map)
----------------------------

- `wms_api/routes/api.php` — canonical place to add REST routes.
- `wms_api/app/Http/Controllers/Api` — Controller implementation per role.
- `wms_api/app/Http/Middleware` — role-based access checks (admin, user, supervisor, superadmin).
- `wms_api/app/Models` — Eloquent models (Product, Branch, Report, Outbound, Inbound, Order, BranchStock, ActivityLog).
- `wms_api/database/migrations` and `wms_api/database/seeders` — DB schema and seeded data.
- `wms_api/composer.json` scripts — `setup`, `dev`, `test`.
- `wms_fe/src/context/AuthContext.tsx` — central auth state and token storage.
- `wms_fe/src/layout/AppSidebar.tsx` — role-based navigation layout.
- `wms_fe/src/routes/*` — role-route wrappers used in `react-router` to limit page access.

Feedback
--------

If anything is missing or you'd like me to expand on specific code areas (e.g., ActivityLog usage, queue workers, pail logging, full CI commands, or adding secrets/config for production), tell me which area to focus on and I’ll update this document accordingly.
