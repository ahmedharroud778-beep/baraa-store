# Shein Cart Tracker

A full-stack web application for calculating shipping costs from Shein to Libya, with order tracking and admin management.

## Features

- **Price Calculator**: Calculate shipping costs based on price or weight
- **Order Tracking**: Track orders by order ID
- **Admin Dashboard**: Manage orders and settings
- **Real-time Updates**: Live order status updates
- **Secure Authentication**: JWT-based admin authentication

## Tech Stack

### Backend
- Node.js + Express
- TypeScript
- PostgreSQL + Prisma ORM
- Redis + Bull Queue
- JWT Authentication

### Frontend
- React + Vite
- TypeScript
- Tailwind CSS
- React Router

### Scraper
- Playwright with stealth plugin
- Anti-detection utilities

### DevOps
- Docker + Docker Compose

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- Docker (optional)

### Installation

1. Clone the repository
2. Install dependencies:

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install

# Scraper
cd scraper
npm install
```

3. Set up environment variables:

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your credentials

# Frontend
cp frontend/.env.example frontend/.env
```

4. Set up the database:

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

### Running the Application

#### Development Mode

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

#### Docker (Recommended)

```bash
cd docker
docker-compose up -d
```

This will start:
- PostgreSQL on port 5432
- Redis on port 6379
- Backend API on port 5000
- Frontend on port 3000

## API Documentation

### Public Endpoints

#### Calculate Estimate
```http
POST /api/estimate/price
Content-Type: application/json

{
  "cartUrl": "https://www.shein.com/...",
  "mode": "price",
  "city": "tripoli"
}
```

#### Create Order
```http
POST /api/orders
Content-Type: application/json

{
  "orderId": "ORD123",
  "cartUrl": "https://www.shein.com/...",
  "mode": "weight",
  "city": "tripoli",
  "contactMethod": "whatsapp",
  "contactInfo": "+218912345678"
}
```

#### Get Order
```http
GET /api/orders/:id
```

#### Get Order by Order ID
```http
GET /api/orders/order-id/:orderId
```

### Admin Endpoints

#### Login
```http
POST /api/admin/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password"
}
```

#### Get Settings
```http
GET /api/admin/settings
Authorization: Bearer <token>
```

#### Update Settings
```http
PUT /api/admin/settings
Authorization: Bearer <token>
Content-Type: application/json

{
  "libyanRate": 4.9,
  "perKgFee": 15,
  "itemWeights": {
    "pants": 0.7,
    "shirt": 0.3
  },
  "cityFees": {
    "tripoli": 15,
    "benghazi": 20
  }
}
```

#### Get All Orders
```http
GET /api/admin/orders?status=not_confirmed
Authorization: Bearer <token>
```

#### Update Order Status
```http
PUT /api/admin/orders/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "shipping_to_libya"
}
```

## Project Structure

```
shein-tracker/
├── backend/          # Express API server
│   ├── prisma/       # Database schema
│   ├── src/          # Source code
│   └── package.json
├── frontend/         # React app
│   ├── src/          # Source code
│   └── package.json
├── scraper/          # Playwright scraper
│   ├── src/          # Source code
│   └── package.json
├── docker/           # Docker configuration
│   ├── docker-compose.yml
│   ├── Dockerfile.backend
│   └── Dockerfile.frontend
└── README.md
```

## License

This project is for educational purposes.
