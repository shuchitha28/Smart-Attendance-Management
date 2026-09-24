# 🎓 Smart Attendance Management System

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![NodeJS](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

An enterprise-grade, full-stack **Smart Attendance Management & Predictive Analytics System** built for modern educational institutions. Featuring real-time rotating security passcodes, AI-driven early warning risk analytics, attendance correction workflows, role-based dashboards, multi-format PDF/Excel reporting, and dynamic glassmorphism UI.

---

## 🌟 Key Features & Core Modules

### 👨‍🎓 Student Dashboard
- **Instant Smart Join**: Enter the live 6-digit session pass-code to mark attendance in seconds.
- **Personal Analytics**: Real-time attendance percentage breakdown per subject with visual progress indicators.
- **Attendance History & Status**: View detailed log of present, absent, and late classes.
- **Correction Requests**: Submit formal attendance correction appeals with custom reasons directly to faculty.
- **Dark/Light Mode**: Full theme customization powered by a smooth glassmorphism UI engine.

### 👩‍🏫 Faculty Portal
- **Live Session Management**: Launch attendance sessions with auto-rotating 6-digit security codes (rotates every 15s to prevent code sharing).
- **Live Attendance Monitor**: Real-time polling feed displaying student check-ins as they happen.
- **Manual Attendance Overrides**: Quick one-click mark/update for any student in the roster.
- **AI Early Warning System**: Predictive analytics engine automatically categorizing students into:
  - 🚨 **High Risk (<60%)**: Immediate intervention required.
  - ⚠️ **Watchlist (60% – 74%)**: At-risk monitoring list.
  - ✅ **Safe (≥75%)**: Satisfactory academic standing.
- **Correction Request Inbox**: Review, approve, or reject student attendance correction appeals.
- **Report Exporter**: Generate institutional PDF and Excel reports with 1 click.

### 🛡️ Admin Suite
- **Institutional Overview**: Real-time statistics tracking total students, faculty members, departments, active sessions, and today's attendance counts.
- **Faculty Directory**: Add new faculty members and track session workloads.
- **Department & Course Hierarchy**: Manage nested Department ➔ Class ➔ Section ➔ Course tree structures.
- **Compliance & Audit Center**: Access full student rosters, low-attendance defaulter lists, and institutional audit data.
- **Executive Exporting**: One-click generation of branded PDF reports and formatted `.xlsx` spreadsheets for official compliance.

---

## 🏗️ Architecture & Tech Stack

```
Smart Attendance Management/
├── frontend/             # React 19 + TypeScript + Vite + TailwindCSS
│   ├── src/
│   │   ├── components/   # Reusable UI components & background animations
│   │   ├── config/       # API Base URL & environment configurations
│   │   ├── context/      # Theme engine (Light/Dark mode)
│   │   ├── hooks/        # Custom React hooks (useStudentData)
│   │   ├── pages/        # Page routes (Landing, Login, Register, Dashboards)
│   │   ├── store/        # Zustand global authentication state
│   │   ├── types/        # TypeScript interfaces and data models
│   │   └── utils/        # PDF (jsPDF-AutoTable) & Excel (XLSX) export utilities
└── backend/              # Node.js + Express 5 + Prisma ORM
    ├── prisma/           # Database schema & seed scripts
    └── src/
        ├── middleware/   # JWT Authentication & RBAC protection
        ├── routes/       # RESTful API endpoints (auth, students, attendance, sessions, admin, analytics)
        └── index.ts      # Server bootstrap & CORS setup
```

---

## 🛠️ Installation & Local Setup

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- **PostgreSQL**: Running locally or hosted (e.g. Supabase / Neon / Render)

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/smart-attendance-management.git
cd smart-attendance-management
```

---

### Step 2: Configure & Run Backend

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create environment file (.env)
cp .env.example .env
```

Edit `backend/.env` with your PostgreSQL database credentials:
```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/attendance_db?schema=public"
JWT_SECRET="super-secret-jwt-key-2024"
PORT=5000
CLIENT_URL="http://localhost:5173"
```

Push database schema & seed initial demo data:
```bash
# Apply Prisma migrations / push schema
npx prisma db push

# Seed sample database (Admin, Faculty, Students, Departments)
npx prisma db seed

# Start backend dev server
npm run dev
```

The backend server will run on `http://localhost:5000`.

---

### Step 3: Configure & Run Frontend

Open a new terminal window:

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Create environment file (.env)
cp .env.example .env
```

Ensure `frontend/.env` points to your backend URL:
```env
VITE_API_BASE_URL="http://localhost:5000"
```

Start Vite dev server:
```bash
npm run dev
```

Open your browser at `http://localhost:5173`.

---

## 🔑 Demo Login Credentials

The seed script creates pre-configured accounts for testing:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@college.edu` | `admin123` |
| **Faculty** | `smith@college.edu` | `admin123` |
| **Student** | `student1@college.edu` | `admin123` |

*(Tip: Click the **1-Click Demo Buttons** on the Login screen to automatically fill credentials!)*

---

## 📄 Environment Variables Reference

### Backend (`backend/.env`)
| Variable | Description | Example |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Secret key for JWT signing | `your-secret-key` |
| `PORT` | Server port | `5000` |
| `CLIENT_URL` | Allowed CORS origin(s) | `http://localhost:5173` |

### Frontend (`frontend/.env`)
| Variable | Description | Example |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Backend REST API endpoint | `http://localhost:5000` |

---

## 🚀 Deployment Guide

### Deploying Backend (Render / Railway)
1. Provision a PostgreSQL database on **Supabase**, **Neon.tech**, or **Render**.
2. Deploy the `backend` folder as a Web Service on **Render** or **Railway**.
3. Set Environment Variables:
   - `DATABASE_URL` = *your cloud postgres URL*
   - `JWT_SECRET` = *random secure string*
   - `CLIENT_URL` = *your deployed frontend URL (e.g. `https://smart-attendance.vercel.app`)*
4. Build Command: `npm run build`
5. Start Command: `npm start`

### Deploying Frontend (Vercel / Netlify)
1. Import repository to **Vercel** or **Netlify**.
2. Set Root Directory to `frontend`.
3. Set Environment Variable:
   - `VITE_API_BASE_URL` = *your deployed backend URL (e.g. `https://smart-attendance-api.onrender.com`)*
4. Framework Preset: **Vite**
5. Build Command: `npm run build` | Output Directory: `dist`

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

Distributed under the **ISC License**. See `LICENSE` for more information.
