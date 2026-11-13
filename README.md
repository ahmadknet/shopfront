# Shopfront

React + TypeScript front end on an ASP.NET Core 8 API with PostgreSQL and JWT auth.
Covers Day 34 of the 60-day plan (React app on your .NET API) and reuses the Day 22-23 PostgreSQL work.

## Run locally (3 terminals)

1. Database: `docker compose up db`
2. API: `cd backend/ShopApi && dotnet run` (http://localhost:5080, Swagger at /swagger)
3. Web: `cd frontend && npm install && npm run dev` (http://localhost:5173, proxies /api to the API)

## Run everything in Docker

`docker compose up --build`, then open http://localhost:8080.

## What it does

- Public: browse products, search by name, paginate.
- Signed in: add, edit and delete products.
- Auth: register and sign in; the API issues a JWT (2 hours), the web app sends it as a Bearer token.

## Plan exercises built in

- Day 23: the API uses `EnsureCreated()`. Replace it with EF Core migrations, add a GIN or trigram index for search, and run `EXPLAIN ANALYZE` on the product list query.
- Day 31: `ProductForm` is a controlled form with manual validation.
- Day 32: `AuthProvider` is the Context API example. Decide where Zustand would or would not help.
- Day 33: React Query handles loading, error and cache invalidation.
- Day 47-48: Docker Compose is already here. Next, write Helm charts for `api` and `web` and deploy to your cluster.

## Before you deploy anywhere real

Change `Jwt:Key`, the database password and CORS origins, and move secrets to Key Vault or Kubernetes Secrets.
