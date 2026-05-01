# Shein Cart Tracker - Issues and Solutions

## Current Status

Project structure is complete but not running due to Prisma 7 compatibility issues.

---

## Issues Encountered

### 1. Prisma 7 Schema Format Change

**Error:**
```
Error: Prisma schema validation - (get-config wasm)
Error code: P1012
error: The datasource property `url` is no longer supported in schema files.
```

**Cause:**
Prisma 7 changed how database connections are configured. The `url` property in `schema.prisma` is deprecated.

**Solution:**
Need to create a `prisma.config.ts` file and update the schema.

**Files to Update:**

1. `backend/prisma/schema.prisma` - Remove the `url` line
2. `backend/prisma/prisma.config.ts` - Create new config file

**Updated schema.prisma:**
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}

model Order {
  id              String   @id @default(cuid())
  orderId         String   @unique
  cartUrl         String
  mode            String
  city            String?
  status          String   @default("not_confirmed")
  originalPrice   Float?
  convertedPrice  Float?
  weightFee       Float?
  deliveryFee     Float?
  totalEstimated  Float?
  cartSnapshot    Json?
  contactMethod   String?
  contactInfo     String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model Settings {
  id              String   @id @default(cuid())
  libyanRate      Float
  perKgFee        Float
  sheinEmail      String?
  sheinPassword   String?
  itemWeights     Json
  cityFees        Json
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model Admin {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**New prisma.config.ts:**
```typescript
import { defineConfig } from '@prisma/client'

export default defineConfig({
  datasourceUrl: 'postgresql://shein:shein123@localhost:5432/shein_tracker'
})
```

---

## Steps to Fix and Run the Project

### Step 1: Update Prisma Configuration

```bash
cd backend
```

Update `prisma/schema.prisma` (remove the `url` line from datasource).

Create `prisma/prisma.config.ts` with the datasource URL.

### Step 2: Generate Prisma Client

```bash
npx prisma generate
```

### Step 3: Run Database Migration

```bash
npx prisma migrate dev --name init
```

**Note:** This requires PostgreSQL to be running on localhost:5432.

### Step 4: Start Backend

```bash
npm run dev
```

Backend should start on port 5000.

### Step 5: Start Frontend (New Terminal)

```bash
cd frontend
npm run dev
```

Frontend should start on port 3000.

---

## Alternative: Use Docker

If you don't have PostgreSQL and Redis installed locally, use Docker:

```bash
cd docker
docker-compose up -d
```

This will start all services including the database.

---

## Prerequisites

### Required Software:
- Node.js 20+
- PostgreSQL 15+ (or use Docker)
- Redis 7+ (or use Docker)
- Docker Desktop (optional, for containerized setup)

### Environment Variables

**Backend (.env):**
```env
DATABASE_URL="postgresql://shein:shein123@localhost:5432/shein_tracker"
JWT_SECRET="your-secret-key-here"
REDIS_HOST="localhost"
REDIS_PORT=6379
ENCRYPTION_KEY="your-32-character-encryption-key-1234"
PORT=5000
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:5000/api
```

---

## Quick Fix Commands

When you return, run these commands:

```bash
cd C:\Users\ahmed\Desktop\code\shein-tracker\backend

# Update schema (remove url line)
# Create prisma.config.ts

# Generate client
npx prisma generate

# Run migration (requires PostgreSQL)
npx prisma migrate dev --name init

# Start backend
npm run dev
```

In another terminal:

```bash
cd C:\Users\ahmed\Desktop\code\shein-tracker\frontend
npm run dev
```

---

## What's Working

- All source code files are created
- Dependencies are installed
- Project structure is complete
- Docker configuration is ready

## What Needs Fixing

- Prisma 7 configuration (main blocker)
- Database setup (PostgreSQL needs to be running)
- Redis setup (for job queue)

---

## Next Session Checklist

- [ ] Update Prisma schema (remove url line)
- [ ] Create prisma.config.ts
- [ ] Run `npx prisma generate`
- [ ] Ensure PostgreSQL is running
- [ ] Run `npx prisma migrate dev --name init`
- [ ] Start backend with `npm run dev`
- [ ] Start frontend with `npm run dev`
- [ ] Test the application

---

## Notes

- The project uses Prisma 7 which has breaking changes from Prisma 6
- All other code is compatible and should work once Prisma is fixed
- Consider downgrading to Prisma 6 if Prisma 7 issues persist
