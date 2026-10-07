# 💰 Finance Dashboard

A full-stack personal finance management application that helps users securely manage income, expenses, transactions, categories, budgets, savings, and financial reports from a centralized dashboard.

---

## 🔗 Live Links

| Resource | Link |
|----------|------|
| 🌐 Frontend | https://finance-dashboard-ki6h2zcjd-samarthunhale-alts-projects.vercel.app/ |
| ⚙️ Backend API | https://finance-dashboard-awr8.onrender.com/ |
| 📦 GitHub Repository | https://github.com/samarthunhale-alt/Finance-dashboard |

---

## 📌 Project Overview

Finance Dashboard is a full-stack web application developed to simplify personal financial management.

Users can create an account, securely log in, add income and expense transactions, categorize transactions, manage budgets and savings, and view their overall financial summary through an interactive dashboard.

The project uses a separate React frontend, a Node.js/Express backend, and a MongoDB Atlas database, deployed on cloud platforms.

---

## ✨ Key Features

### 👤 Authentication & Security

- User registration and login
- JWT-based authentication
- Secure password hashing
- Protected API routes
- CORS protection
- Security headers using Helmet
- API rate limiting

### 💸 Transaction Management

- Add, update and delete transactions
- Income and expense management
- Transaction categories
- Recent transactions view

### 📊 Dashboard & Reports

- Dashboard with total income, expenses and balance
- Financial summary at a glance
- Financial reports

### 🎯 Budgets & Savings

- Budget management
- Savings management

### ⚙️ Platform

- RESTful API
- MongoDB Atlas integration
- Responsive user interface
- Cloud deployment

---

## 🔄 Application Workflow

```text
Register / Login
       ↓
   Dashboard
       ↓
┌──────┼───────────┬────────────┐
↓      ↓           ↓            ↓
Add   Manage     Manage       View
Txns  Categories Budgets &    Reports
                 Savings
└──────┼───────────┴────────────┘
       ↓
 MongoDB Atlas Database
```

---

## 🏗️ System Architecture

```text
┌───────────────────────────────┐
│             User              │
└───────────────┬───────────────┘
                │
                ↓
┌───────────────────────────────┐
│        React + Vite           │
│          Frontend             │
└───────────────┬───────────────┘
                │
                │ Axios / REST API
                ↓
┌───────────────────────────────┐
│      Node.js + Express        │
│           Backend             │
└───────────────┬───────────────┘
                │
                │ Mongoose
                ↓
┌───────────────────────────────┐
│        MongoDB Atlas          │
│           Database            │
└───────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend

- React.js
- Vite
- JavaScript
- Axios
- React Router
- React Hot Toast
- CSS

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- Helmet
- CORS
- Morgan
- Express Rate Limit

### Database

- MongoDB Atlas

### Deployment

- Vercel – Frontend
- Render – Backend
- MongoDB Atlas – Database

---

## 📁 Project Structure

```text
Finance-dashboard/
│
├── client/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── app.js
│   ├── server.js
│   └── package.json
│
├── .gitignore
├── README.md
└── package.json
```

---

## 🔐 Environment Variables

### Frontend (`client/.env`)

```env
VITE_API_URL=http://localhost:5000/api
```

### Backend (`server/.env`)

```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

> ⚠️ Never commit `.env` files, database credentials, JWT secrets, or other production secrets to GitHub.

---

## 🚀 Installation & Local Setup

### 1. Clone the Repository

```bash
git clone https://github.com/samarthunhale-alt/Finance-dashboard.git
cd Finance-dashboard
```

### 2. Backend Setup

```bash
cd server
npm install
npm start
```

Backend runs at: http://localhost:5000

### 3. Frontend Setup

Open another terminal:

```bash
cd client
npm install
npm run dev
```

Frontend runs at: http://localhost:5173

---

## ☁️ Deployment

```text
┌──────────────────────────┐
│          Vercel          │
│   React + Vite Frontend  │
└────────────┬─────────────┘
             │
             │ REST API
             ↓
┌──────────────────────────┐
│          Render          │
│  Node.js + Express API   │
└────────────┬─────────────┘
             │
             ↓
┌──────────────────────────┐
│      MongoDB Atlas       │
│        Database          │
└──────────────────────────┘
```

| Service | Platform |
|---------|----------|
| Frontend | Vercel |
| Backend | Render |
| Database | MongoDB Atlas |

---

## 🔒 Security Architecture

```text
Authentication
      ↓
JWT Token
      ↓
Protected Routes
      ↓
Validated API Requests
      ↓
MongoDB
```

Security measures include:

- JWT authentication
- Password hashing
- Protected API routes
- CORS configuration
- Helmet security headers
- API rate limiting
- Environment-based secrets

---

## 🎯 Project Objectives

- Simplify personal finance tracking
- Give users a clear view of income, expenses and balance
- Help users plan budgets and savings
- Provide secure, token-based access to financial data
- Demonstrate a production-style MERN deployment

---

## 🚧 Future Enhancements

- Charts and advanced analytics
- Export reports to PDF / CSV
- Recurring transactions
- Budget alerts and notifications
- Multi-currency support
- Dark mode
- Mobile application

---

## 👨‍💻 Developer

**Samarth Unhale**
Computer Engineering Student & Full-Stack Developer

- GitHub: https://github.com/samarthunhale-alt
- Project Repository: https://github.com/samarthunhale-alt/Finance-dashboard

---

## ⭐ Project Highlights

- Full-stack MERN architecture
- JWT authentication with protected routes
- RESTful backend APIs
- MongoDB Atlas cloud database
- Responsive React interface
- Cloud deployment using Vercel and Render
- Secure API configuration

---

## 📄 License

This project is developed for educational, portfolio, and demonstration purposes.
