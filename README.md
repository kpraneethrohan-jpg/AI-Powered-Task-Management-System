# 🤖 AI-Powered Task Management System

A fullstack web application that combines task tracking with Google Gemini AI for intelligent scheduling and Google Calendar integration for meeting management.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React.js / Node.js
- **Styling & UI:** CSS / Tailwind

### Backend
- **Framework:** Java 17+, Spring Boot
- **AI Integration:** Spring AI (Google Gemini 2.5 Flash)
- **Security & OAuth:** Spring Security, Google OAuth 2.0
- **Database & Persistence:** PostgreSQL, Spring Data JPA
- **Messaging & Communication:** Spring Mail (Gmail SMTP)

---

## ✨ Key Features

- 📝 **Task Management:** Create, update, organize, and attach files (up to 10MB) to tasks.
- 🤖 **AI Assistant:** Leverages Google Gemini AI to help analyze, summarize, and prioritize your daily tasks.
- 📅 **Google Calendar Integration:** Schedule Google Meetings directly from your tasks via OAuth 2.0 authorization.
- 📧 **Email Notifications:** Automated email updates and reminders sent via Gmail SMTP.

---

## 📁 Repository Structure

```text
AI-Powered-Task-Management-System/
├── backend/
│   └── todo/               # Spring Boot Application
│       └── src/main/resources/
│           └── application.properties
└── frontend/               # React Client Application
