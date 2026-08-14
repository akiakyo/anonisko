# AnonIsko + Neon setup

## 1. Create `.env`
Copy `.env.example` to `.env` and replace the placeholders:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL="YOUR_NEON_POSTGRESQL_CONNECTION_STRING"
SESSION_SALT="replace-with-a-long-random-secret"
```

Do not commit `.env`.

## 2. Install packages

```powershell
npm install
```

`npm install` no longer requires `DATABASE_URL`, so a fresh checkout/install will not fail just because `.env` has not been created yet.

## 3. Generate Prisma and create/update Neon tables

```powershell
npm run db:setup
```

## 4. Start AnonIsko

```powershell
npm start
```

Health check: `http://localhost:3000/api/health`
