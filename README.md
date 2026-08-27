# V3 Classes Website & Coaching Management Platform

Official website and enquiry platform for **V3 Classes** (Khagaul, Bihar) — Premier coaching institute for Classes 5–12 (CBSE & Bihar Board), JEE (Main & Advanced), and NEET UG.

---

## 🚀 Features

- **Modern Responsive UI**: Interactive institute website with courses, results, faculty, testimonials, gallery, and contact sections.
- **Intelligent Assistant & Chatbot**: Interactive enquiry-focused chatbot with quick replies, automated FAQs, course guidance, and lead capture.
- **Backend API & Database**: Express.js REST API with Prisma ORM (SQLite / PostgreSQL ready).
- **Admin Dashboard**: Portal for managing enquiries, courses, faculty, and website settings.

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, Vanilla CSS3, JavaScript (ES6+), FontAwesome & Custom SVGs
- **Backend**: Node.js, Express.js
- **Database & ORM**: Prisma ORM with SQLite (Local) / PostgreSQL (Production)
- **Authentication**: JWT, bcryptjs
- **Media**: Cloudinary integration ready

---

## 💻 Local Development Setup

### 1. Prerequisites
- Node.js (v18 or higher recommended)
- npm

### 2. Install Dependencies
```bash
cd server
npm install
```

### 3. Setup Database (Prisma)
```bash
cd server
npx prisma generate
npx prisma db push
node prisma/seed.js
```

### 4. Run Application
From the root directory:
```bash
node server.js
```

- **Frontend Website**: [http://localhost:8080](http://localhost:8080)
- **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)
- **Admin Panel**: [http://localhost:8080/admin](http://localhost:8080/admin)

---

## 📄 License
All rights reserved © V3 Classes.
