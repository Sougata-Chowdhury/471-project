# BracuNet - University Student, Faculty, Alumni Connection App

A modern platform connecting BRAC University students, alumni, faculty, and admin with secure authentication and role-based dashboards.

## 🎯 Features (Module 1)

- **User Registration** - Create accounts as Student, Alumni, Faculty, or Admin
- **Secure Login** - JWT-based authentication with httpOnly cookies
- **Role-Based Access** - Separate dashboards for each user role
- **Password Security** - bcrypt hashing for secure password storage
- **Session Management** - Automatic logout and secure cookie handling

---

## 📋 Prerequisites

Before starting, ensure you have:

- **Node.js** v16+ ([Download](https://nodejs.org/))
- **MongoDB** (Local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- **Git**
- **npm** or **yarn**

---

## 🚀 Setup Instructions

### Step 1: MongoDB Setup

#### Option A: Local MongoDB
```powershell
# Install MongoDB Community Edition from https://www.mongodb.com/try/download/community
# Start MongoDB service (Windows):
net start MongoDB

# Verify connection:
mongo --version
```

#### Option B: MongoDB Atlas (Cloud)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a cluster
4. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/bracunet`
5. Update `.env` in Backend folder

### Step 2: Backend Setup

```powershell
# Navigate to backend folder
cd Backend

# Copy environment file
copy .env.example .env

# Edit .env with your MongoDB URI (if using Atlas, replace MONGODB_URI)
# notepad .env

# Install dependencies
npm install

# Seed database with demo users
npm run seed

# Start development server
npm run dev
```

**Backend runs on:** `http://localhost:3000`

### Step 3: Frontend Setup

```powershell
# In a new terminal, navigate to frontend folder
cd Frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

**Frontend runs on:** `http://localhost:3001`

---

## 📝 Demo Credentials

After seeding the database, use these credentials to test different roles:

| Role    | Email                   | Password    |
|---------|-------------------------|-------------|
| Admin   | admin@bracunet.edu      | admin123    |
| Student | student@bracunet.edu    | student123  |
| Alumni  | alumni@bracunet.edu     | alumni123   |
| Faculty | faculty@bracunet.edu    | faculty123  |

---

## 🏗️ Project Structure

```
BracuNet/
├── Backend/
│   ├── src/
│   │   ├── auth/                 # Authentication logic
│   │   │   ├── auth.service.js   # Register, Login, Logout
│   │   │   └── auth.routes.js    # Auth endpoints
│   │   ├── users/                # User management
│   │   │   ├── user.model.js     # User Mongoose schema
│   │   │   └── user.routes.js    # User endpoints
│   │   ├── middleware/
│   │   │   └── auth.js           # JWT & role guards
│   │   ├── config/
│   │   │   └── index.js          # Config from env
│   │   └── index.js              # Express app entry
│   ├── scripts/
│   │   └── seed.js               # Database seeding
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
│
└── Frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Home.jsx          # Landing page
    │   │   ├── Login.jsx         # Login form
    │   │   ├── Register.jsx      # Registration form
    │   │   └── Dashboard.jsx     # Role-based dashboard
    │   ├── components/           # Reusable components
    │   ├── context/
    │   │   └── AuthContext.jsx   # Auth state management
    │   ├── hooks/
    │   │   └── useAuth.js        # Auth hook
    │   ├── App.jsx               # Main app component
    │   ├── main.jsx              # React entry
    │   └── index.css             # Tailwind styles
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── package.json
    └── .gitignore
```

---

## 🔐 Security Features

1. **Password Hashing** - bcryptjs (10 salt rounds)
2. **JWT Tokens** - Secure token-based auth
3. **httpOnly Cookies** - Prevents XSS attacks (no localStorage)
4. **CORS Protection** - Restricted origin access
5. **Role-Based Access Control (RBAC)** - Protected endpoints by role

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout (clears cookie)
- `GET /api/auth/me` - Get current user (requires auth)

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID (admin or self)

### Dashboards (for future)
- `GET /api/dashboard/student`
- `GET /api/dashboard/alumni`
- `GET /api/dashboard/faculty`
- `GET /api/dashboard/admin`

---

## 🔄 Authentication Flow

```
1. User registers/logs in
2. Backend validates credentials
3. JWT token created and sent in httpOnly cookie
4. Frontend automatically includes cookie in requests (credentials: 'include')
5. Backend validates token on protected routes
6. User can access role-specific dashboard
7. Logout clears cookie
```

---

## 🛠️ Environment Variables

**Backend (.env)**
```env
MONGODB_URI=mongodb://localhost:27017/bracunet
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:3000
```

---

## 📦 Dependencies

### Backend
- **express** - Web framework
- **mongoose** - MongoDB ORM
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT creation/verification
- **dotenv** - Environment variables
- **cors** - Cross-origin requests
- **cookie-parser** - Cookie handling
- **nodemon** - Development auto-reload

### Frontend
- **react** - UI library
- **react-router-dom** - Routing
- **tailwindcss** - Styling
- **vite** - Build tool

---

## 🧪 Testing the App

### 1. Register a new user
- Go to `http://localhost:3000`
- Click "Register"
- Fill in the form (all roles available)
- Create account

### 2. Login with credentials
- Go to `http://localhost:3000/login`
- Use demo credentials or newly created account
- See role-specific dashboard

### 3. View your profile
- After login, dashboard shows user info
- Role badge displays user's role
- Click logout to clear session

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| MongoDB connection fails | Check MongoDB is running; verify URI in .env |
| CORS errors | Ensure CORS_ORIGIN matches frontend URL |
| Cookies not sent | Use `credentials: 'include'` in fetch |
| 401 Unauthorized | Token expired or missing; login again |
| Port 3000 already in use | Kill process or change PORT in `.env` |

---

## 🔜 Next Steps (Future Modules)

- Profile management
- User search and discovery
- Messaging system
- Event management
- Group/community features
- File uploads
- Notifications

---

## 📄 License

MIT License - Free to use and modify

---

## 👥 Team

BracuNet Development Team

---

## 📞 Support

For issues or questions, create a GitHub issue or contact the development team.
