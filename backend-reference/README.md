# MR Dashboard Backend Reference

This is a **reference implementation** for your Node.js + Express + MongoDB backend.
Copy this folder to a separate project and deploy it on your own server (Render, Railway, Heroku, etc.)

## Setup

1. Copy this folder to a new project directory
2. Run `npm install`
3. Create `.env` file with:
   ```
   MONGO_URI=mongodb+srv://your-connection-string
   JWT_SECRET=your-super-secret-key
   PORT=5000
   NODE_ENV=development
   ```
4. Run `npm run dev` for development
5. Run `npm start` for production

## Folder Structure

```
backend-reference/
├── src/
│   ├── config/
│   │   └── database.ts       # MongoDB connection
│   ├── models/               # Mongoose schemas
│   │   ├── User.ts
│   │   ├── Farmer.ts
│   │   ├── LocalMR.ts
│   │   ├── Product.ts
│   │   ├── Sale.ts
│   │   ├── MechanisationJob.ts
│   │   ├── Visit.ts
│   │   ├── Training.ts
│   │   ├── Machinery.ts
│   │   ├── Notification.ts
│   │   ├── ApprovalRequest.ts
│   │   ├── AuditLog.ts
│   │   └── SystemLog.ts
│   ├── middleware/
│   │   ├── auth.ts           # JWT authentication
│   │   ├── roleGuard.ts      # Role-based access
│   │   └── validate.ts       # Request validation
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── users.ts
│   │   ├── farmers.ts
│   │   ├── localMrs.ts
│   │   ├── products.ts
│   │   ├── sales.ts
│   │   ├── mechanisation.ts
│   │   ├── visits.ts
│   │   ├── trainings.ts
│   │   ├── machinery.ts
│   │   ├── notifications.ts
│   │   ├── approvals.ts
│   │   ├── dashboard.ts
│   │   └── logs.ts
│   ├── services/             # Business logic
│   │   └── auditService.ts
│   └── server.ts             # Main entry point
├── package.json
└── tsconfig.json
```

## API Endpoints

All endpoints are prefixed with `/api`

### Auth
- POST `/api/auth/login`
- POST `/api/auth/register`
- POST `/api/auth/logout`
- GET `/api/auth/me`

### Users
- GET `/api/users`
- GET `/api/users/:id`
- POST `/api/users`
- PUT `/api/users/:id`
- DELETE `/api/users/:id`

### Farmers
- GET `/api/farmers`
- GET `/api/farmers/:id`
- POST `/api/farmers`
- PUT `/api/farmers/:id`
- DELETE `/api/farmers/:id`
- POST `/api/farmers/:id/approve`
- POST `/api/farmers/:id/reject`

### Local MRs
- GET `/api/mrs`
- GET `/api/mrs/:id`
- POST `/api/mrs`
- PUT `/api/mrs/:id`
- GET `/api/mrs/:id/stats`

### Products
- GET `/api/products`
- GET `/api/products/:id`
- POST `/api/products`
- PUT `/api/products/:id`
- PATCH `/api/products/:id/stock`

### Sales
- GET `/api/sales`
- GET `/api/sales/:id`
- POST `/api/sales`
- PUT `/api/sales/:id`
- POST `/api/sales/:id/complete`
- POST `/api/sales/:id/cancel`

### Mechanisation
- GET `/api/mechanisations`
- GET `/api/mechanisations/:id`
- POST `/api/mechanisations`
- PUT `/api/mechanisations/:id`
- POST `/api/mechanisations/:id/approve`
- POST `/api/mechanisations/:id/reject`
- POST `/api/mechanisations/:id/complete`

### Dashboard
- GET `/api/dashboard/admin`
- GET `/api/dashboard/manager/:localMrId`
- GET `/api/dashboard/tot/:totId`

## Connecting to Frontend

Set this in your Lovable project's environment variables:
```
VITE_API_URL=https://your-backend-url.com/api
```
