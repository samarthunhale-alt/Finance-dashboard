# 💰 Finance Dashboard

A full-stack personal finance management application that helps users securely manage income, expenses, transactions, categories, budgets, savings, and financial reports from a centralized dashboard.

## 🔗 Live Links

- **Frontend:** https://finance-dashboard-ki6h2zcjd-samarthunhale-alts-projects.vercel.app/
- **Backend API:** https://finance-dashboard-awr8.onrender.com/
- **GitHub:** https://github.com/samarthunhale-alt/Finance-dashboard

---

## 📌 Project Overview

Finance Dashboard is a full-stack web application developed to simplify personal financial management.

Users can create an account, securely log in, add income and expense transactions, categorize transactions, manage budgets and savings, and view their overall financial summary through an interactive dashboard.

The project uses a separate React frontend, Node.js/Express backend, and MongoDB Atlas database.

---

## ✨ Features

- User Registration & Login
- JWT-based Authentication
- Secure Password Hashing
- Protected API Routes
- Add, Update & Delete Transactions
- Income & Expense Management
- Transaction Categories
- Budget Management
- Savings Management
- Financial Reports
- Dashboard with Income, Expenses & Balance
- Recent Transactions
- REST API
- API Rate Limiting
- CORS Protection
- Security Headers using Helmet
- MongoDB Atlas Integration
- Responsive User Interface
- Cloud Deployment

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

### Deployment
- Vercel – Frontend
- Render – Backend
- MongoDB Atlas – Database

---

## 🏗️ Architecture

```text
User
  ↓
React + Vite Frontend
  ↓
Axios / REST API
  ↓
Node.js + Express Backend
  ↓
Mongoose
  ↓
MongoDB Atlas

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


git clone https://github.com/samarthunhale-alt/Finance-dashboard.git
cd Finance-dashboard

*# frontend setup*
cd client
npm install
npm run dev

# Frontend runs on: http://localhost:5173

# Backend Setup
cd server
npm install
npm start

#Backend runs on: http://localhost:5000
