# Local Development Setup

## Prerequisites

- Node.js 20+ installed
- MongoDB installed locally or MongoDB Atlas connection string
- Git configured

## Quick Start (Dev Mode)

### 1. Install Dependencies

```bash
# Backend
cd bracunet/backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Start MongoDB (Local)

If MongoDB is installed locally:
```bash
mongod
```

Or update the `.env` file with a MongoDB Atlas connection string:
```bash
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/bracunet
```

### 3. Start Backend

```bash
cd bracunet/backend
npm run start:dev
```

Backend runs on `http://localhost:3000`
- Health check: `GET http://localhost:3000/health`

### 4. Start Frontend (In another terminal)

```bash
cd bracunet/frontend
npm run dev
```

Frontend runs on `http://localhost:5173`

### 5. Open Browser

Navigate to `http://localhost:5173`

## Environment Variables

### Backend (bracunet/.env or bracunet/backend/.env.local)
```
DATABASE_URL=mongodb://localhost:27017/bracunet
JWT_SECRET=dev-secret-change-in-production
STRIPE_SECRET_KEY=sk_test_...
SENDGRID_API_KEY=
CLOUDINARY_URL=
NODE_ENV=development
PORT=3000
```

### Frontend (bracunet/frontend/.env)
```
VITE_API_URL=http://localhost:3000
```

## Commands Reference

### Backend
- `npm run build` - Build TypeScript
- `npm run start:dev` - Development mode (watches for changes)
- `npm start` - Production mode

### Frontend
- `npm run dev` - Development mode with hot reload
- `npm run build` - Production build
- `npm run preview` - Preview production build locally

## Project Structure

```
bracunet/
├── backend/          # NestJS API server
│   ├── src/
│   │   ├── modules/  # Feature modules (auth, users, alumni, etc.)
│   │   ├── config/   # Configuration
│   │   └── main.ts   # Entry point
│   └── package.json
├── frontend/         # React app
│   ├── src/
│   │   ├── pages/    # Route pages
│   │   ├── components/
│   │   └── main.tsx  # Entry point
│   └── package.json
└── infra/           # Docker and Kubernetes configs
```

## Troubleshooting

### Backend won't start
- Check MongoDB is running: `mongosh` or check MongoDB Atlas connection
- Verify DATABASE_URL in .env
- Check logs: `npm run start:dev`

### Frontend won't compile
- Clear node_modules: `npm ci`
- Check for missing dependencies: `npm install`
- Verify port 5173 is not in use

### API calls failing from frontend
- Ensure backend is running on port 3000
- Check VITE_API_URL in .env
- Check browser console for CORS errors

## Next Steps

- Implement feature modules (Events, Jobs, Notifications)
- Add authentication flows
- Create database seed data
- Setup CI/CD pipeline
- Deploy to production environment

See `DEPLOYMENT.md` for deployment instructions.
