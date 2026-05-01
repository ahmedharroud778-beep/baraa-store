# Repository Report: Shein Cart Tracker

## Project Overview
A full-stack web application for tracking and estimating Shein cart prices with delivery to Libyan cities.

---

## Folder Tree

```
shein-tracker/
├── backend/
│   ├── dist/              # Compiled TypeScript output
│   ├── node_modules/
│   ├── prisma/
│   │   └── schema.prisma  # Database schema
│   ├── src/
│   │   ├── controllers/  # API controllers
│   │   │   ├── adminController.ts
│   │   │   ├── estimateController.ts
│   │   │   ├── orderController.ts
│   │   │   └── userController.ts
│   │   ├── jobs/
│   │   │   └── scrapeJob.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   └── errorHandler.ts
│   │   ├── routes/
│   │   │   ├── adminRoutes.ts
│   │   │   ├── estimateRoutes.ts
│   │   │   ├── index.ts
│   │   │   ├── orderRoutes.ts
│   │   │   └── userRoutes.ts
│   │   ├── services/
│   │   │   ├── calculationService.ts
│   │   │   └── scraperService.ts
│   │   ├── utils/
│   │   │   ├── encryption.ts
│   │   │   └── validation.ts
│   │   ├── __tests__/
│   │   ├── app.ts
│   │   └── index.ts
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── docker/
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── docker-compose.yml
├── frontend/
│   ├── dist/
│   ├── node_modules/
│   ├── src/
│   │   ├── assets/
│   │   ├── i18n.ts
│   │   ├── lib/
│   │   │   └── api.ts
│   │   ├── locales/
│   │   │   ├── ar.json
│   │   │   └── en.json
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── Clothing.tsx
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── Locations.tsx
│   │   │   │   ├── Login.tsx
│   │   │   │   └── Settings.tsx
│   │   │   ├── Calculator.tsx
│   │   │   └── Tracking.tsx
│   │   ├── App.css
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
├── scraper/
│   ├── node_modules/
│   ├── src/
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
├── shared/
├── ISSUES_AND_SOLUTIONS.md
├── NEXT_STEPS.md
├── PROGRESS.md
├── README.md
└── SESSION_SUMMARY.md
```

---

## Detected Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL (via Prisma ORM)
- **Cache/Queue**: Redis + Bull (job queue)
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Web Scraping**: Playwright
- **Testing**: Jest + Supertest

### Frontend
- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **Internationalization**: i18next + react-i18next
- **UI Components**: Lucide React (icons)
- **Styling**: Tailwind CSS (implied from class names)

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Database**: PostgreSQL 15
- **Cache**: Redis 7

---

## Public Entry Points

### Frontend
- **Main URL**: `http://localhost:3000` (or configured VITE_API_URL)
- **Public Pages**:
  - `/` - Calculator page (main public entry)
  - `/tracking` - Order tracking page

### Backend API
- **Base URL**: `http://localhost:5000/api`
- **Port**: 5000 (configurable via PORT env var)

---

## API Endpoints

### Public Endpoints (No Auth)

#### Orders
- `POST /api/orders` - Create a new order
- `GET /api/orders/:id` - Get order by database ID
- `GET /api/orders/order-id/:orderId` - Get order by order ID

#### Estimates
- `GET /api/estimate/config` - Get configuration (cities, clothing items, settings)
- `POST /api/estimate/price` - Calculate price estimate

#### Admin Auth
- `POST /api/admin/login` - Admin login (returns JWT token)

### Protected Endpoints (Require JWT Auth)

#### Admin
- `GET /api/admin/settings` - Get settings
- `PUT /api/admin/settings` - Update settings
- `GET /api/admin/orders` - Get all orders
- `PUT /api/admin/orders/:id/status` - Update order status
- `GET /api/admin/cities` - Get cities
- `POST /api/admin/cities` - Add city
- `DELETE /api/admin/cities/:id` - Delete city
- `GET /api/admin/clothing-items` - Get clothing items
- `POST /api/admin/clothing-items` - Add clothing item
- `DELETE /api/admin/clothing-items/:id` - Delete clothing item
- `POST /api/admin/clothing-items/:id/weights` - Add clothing weight
- `DELETE /api/admin/clothing-weights/:id` - Delete clothing weight

---

## Form Field Names

### Order Creation (POST /api/orders)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| orderId | string | Yes | Unique order identifier |
| cartUrl | string | No | Shein cart URL |
| mode | string | Yes | 'price' or 'weight' |
| city | string | No | City name for delivery |
| contactMethod | string | No | 'whatsapp' or 'messenger' |
| contactInfo | string | No | Contact information |
| originalPrice | number | No | Original price in USD |
| convertedPrice | number | No | Converted price in LYD |
| weightFee | number | No | Weight-based fee in LYD |
| deliveryFee | number | No | Delivery fee in LYD |
| totalEstimated | number | No | Total estimated price in LYD |

### Estimate Request (POST /api/estimate/price)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| cartUrl | string | No | Shein cart URL |
| cartTotal | number | No | Cart total in USD |
| totalWeight | number | No | Total weight in kg |
| mode | string | Yes | 'price' or 'weight' |
| city | string | No | City name for delivery |

### Admin Login (POST /api/admin/login)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | Admin email |
| password | string | Yes | Admin password |

---

## Run Commands

### Backend

```bash
cd backend

# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Development mode
npm run dev

# Build TypeScript
npm run build

# Production mode
npm start

# Run tests
npm test

# Open Prisma Studio (DB GUI)
npm run prisma:studio
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Docker (Full Stack)

```bash
cd docker

# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild and start
docker-compose up -d --build
```

### Scraper

```bash
cd scraper

# Install dependencies
npm install

# Development mode
npm run dev

# Build
npm run build

# Run
npm start
```

---

## Environment Variables

### Backend (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection string | - |
| REDIS_HOST | Redis host | localhost |
| REDIS_PORT | Redis port | 6379 |
| JWT_SECRET | JWT signing secret | - |
| ENCRYPTION_KEY | 32-character encryption key | - |
| PORT | Server port | 5000 |
| NODE_ENV | Environment | development |
| FRONTEND_URL | Frontend URL for CORS | http://localhost:3000 |
| ADMIN_EMAIL | Default admin email | admin@example.com |
| ADMIN_PASSWORD | Default admin password | password |

### Frontend

| Variable | Description | Default |
|----------|-------------|---------|
| VITE_API_URL | Backend API URL | http://localhost:5000/api |

---

## Database Schema

### Models

- **Order** - Customer orders with pricing and status
- **Settings** - Application settings (rates, fees)
- **Admin** - Admin users for authentication
- **City** - Libyan cities for delivery
- **ClothingItem** - Clothing categories
- **ClothingWeight** - Weight variations for clothing items
- **User** - End users (language preferences)

---

## Security Notes

- JWT authentication for admin endpoints
- bcrypt password hashing
- Environment-based configuration
- CORS enabled for frontend
- No DB credentials in client code (server-side only)
