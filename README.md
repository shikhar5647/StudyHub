# StudyHub 🚀

**Online Learning Management System** built to empower learners and content creators through a seamless educational experience.

---

## 🌟 Project Overview

StudyHub is a modern, web-based LMS designed to help students learn, practice, and grow—anytime, anywhere. Whether you’re a **student** seeking structured courses or a **content creator** crafting engaging lessons, StudyHub offers a polished, intuitive platform that adapts to your needs.

Built by **Shikhar** and **Mahek**, StudyHub harnesses the latest in web, database and AI :

* **Personalized Learning Paths** powered by AI-driven recommendations
* **Interactive Content**: embedded videos, downloadable notes, and hands-on problem sets
* **Real-time Progress Tracking** and performance analytics
* **Role-based Access Control**: distinct student and creator dashboards

## 🔧 Key Features

1. **Role Selection & Authentication**

   * OAuth2 & JWT-based login for secure, hassle-free access.
   * Role-based dashboards for **Students** and **Content Creators**.

2. **Dynamic Course Management**

   * Create, update, and organize courses with modules (Video, Notes, Problems).
   * Presigned-upload for notes and resources via AWS S3.

3. **AI-Assisted Learning**

   * Smart course recommendations based on learning history.
   * Chatbot assistant for instant Q\&A and study tips.

4. **Rich Media & Interactivity**

   * YouTube video embeds for high-quality lessons.
   * Markdown and PDF viewers for clean, printable notes.
   * Integrated code runner for problem sets and quizzes.

5. **Performance & Scalability**

   * **MongoDB** for flexible, schema-less course data.
   * **Redis** for caching hot content and sessions, ensuring lightning-fast load times.
   * Containerized deployment with Docker & Kubernetes for effortless scaling.

## 🏗️ Architecture & Tech Stack

```
Frontend  ↔  API Gateway  ↔  Backend  ↔  MongoDB Atlas
                                     ↔  Redis Cache
                                     ↔  AWS S3 Storage
```

* **Frontend**: React + Tailwind CSS + Vite for a snappy SPA experience.
* **Backend**: Node.js, Express.js, Passport.js (JWT + OAuth2).
* **Database**: MongoDB Atlas (NoSQL) with Mongoose ORM.
* **Cache**: Redis for rapid data access.
* **Storage**: AWS S3 for course assets.
* **Deployment**: Docker, GitHub Actions CI/CD, AWS ECS / EKS.

## 🚀 Getting Started

1. **Clone the repo**

   ```bash
   git clone https://github.com/shikhar5647/StudyHub.git
   cd StudyHub
   ```

2. **Environment Setup**

   * Copy `.env.example` to `.env` in both `frontend/` and `backend/`.
   * Fill in your MongoDB, Redis, OAuth, and AWS S3 credentials.

3. **Launch Locally**

   ```bash
   # Start services
   docker-compose up --build

   # Frontend
   cd frontend && npm install && npm start

   # Backend
   cd backend && npm install && npm run dev
   ```

4. **Explore**

   * Frontend: `http://localhost:3000`
   * Backend API docs (Swagger): `http://localhost:4000/api-docs`

## 📱 Applications & Use Cases

* **Self-Paced Learning**: Ideal for individual learners tackling new skills.
* **Classroom Supplement**: Teachers can upload curated modules for hybrid instruction.
* **Corporate Training**: Onboard employees with interactive tutorials and assessments.

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repo
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Commit your changes (`git commit -m "feat: add new feature"`)
4. Push and open a Pull Request

## 🧑‍💻 Authors

* **Shikhar** 
* **Mahek** 

## 📜 License

Distributed under the MIT License. See `LICENSE` for details.

---

✨ Thank you for exploring StudyHub! Let’s make learning smarter, together. ✨
