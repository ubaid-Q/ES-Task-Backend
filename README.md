# 🚀 Exact Solution Task – NestJS Backend

A scalable and secure **Task Management API** built with **NestJS**, supporting real-time task updates, robust authentication, and a hybrid database setup using **PostgreSQL**, **MongoDB**, and **Redis**.

---

## 📚 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Available APIs](#available-apis)
- [WebSocket Integration](#websocket-integration)
- [Testing](#testing)
- [License](#license)

---

## ✅ Features

- JWT-based Authentication with Role-based Access Control
- Task CRUD operations with status management
- Real-time task updates using WebSockets
- Redis-powered token revocation (logout)
- PostgreSQL for core relational data
- MongoDB for event logging
- Auto-generated API documentation with Swagger (`/api-docs`)

---

## 🧰 Tech Stack

- **Framework:** NestJS
- **Relational DB:** PostgreSQL (via TypeORM)
- **NoSQL DB:** MongoDB (via Mongoose)
- **Cache Store:** Redis
- **Authentication:** JWT
- **Real-time:** Socket.IO
- **API Documentation:** Swagger / OpenAPI

---

## 🔧 Installation & Setup

Clone the repository and install dependencies. A sample `.env.example` file is included—rename it to `.env` and update the values as needed.

---

## 🌐 Environment Variables

Make sure your `.env` file includes the following:

```env
# PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=exact_solution_task

# MongoDB
MONGODB_URI=mongodb://localhost:27017/events

# JWT
JWT_SECRET=supersecret
JWT_EXPIRES_IN=3h

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Admin User (default credentials)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

---

## 🚀 Running the Application

Ensure PostgreSQL, MongoDB, and Redis services are running locally.

Then use the following commands:

```bash
npm install
npm run build
npm start
```

To run in production with PM2:

```bash
pm2 start dist/main.js --name exact-solution-backend
```

---

## 📖 API Documentation

Visit:

```
http://localhost:4000/api-docs
```

Interactive API docs powered by Swagger are available here.

---

## 🔁 WebSocket Integration

WebSockets are used to push real-time updates to connected clients:

- When tasks are created, updated, or deleted
- Useful for collaborative task dashboards or real-time UIs

---

## 🧪 Testing

To run unit tests:

```bash
npm run test
```

## 👨‍💻 Author

**Ubaid Ali**  
Full Stack Developer  
[GitHub Profile](https://github.com/ubaid-Q)

