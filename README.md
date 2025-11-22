# 📝 01Blog – A Social Blogging Platform for Learners

**01Blog** is a fullstack social blogging platform where students can share their learning experiences, discoveries, and progress throughout their journey.  
Users can create posts, follow others, engage through likes and comments, and report inappropriate content.  
Administrators have moderation tools to manage users, posts, and reports.

---

## 🚀 Project Overview

In this project, you will build a **fullstack web application** using:
- **Backend:** Java Spring Boot
- **Frontend:** Angular
- **Database:** PostgreSQL

The goal is to create a secure, responsive, and engaging blogging system that promotes knowledge sharing within a student community.

---

## 🧩 Role Play

You are a **Fullstack Developer** working on a learning platform that helps students document their educational journey.  
Your mission is to create a user-friendly and secure system where:
- Students can post content, follow others, and comment.
- Users can report inappropriate behavior.
- Administrators can manage content and users effectively.

---

## 🎯 Learning Objectives

By completing this project, you will:

- Master **Java Spring Boot** for RESTful APIs, authentication, and service architecture.  
- Build dynamic **Angular** applications using components, services, and routing.  
- Understand fullstack **API integration and architecture**.  
- Handle **user-generated content** (text, media uploads).  
- Design **relational databases** for social interactions (likes, comments, follows).  
- Implement **JWT authentication** and **role-based access control**.  
- Create **admin tools** for moderation.  

---

## ⚙️ Backend – Spring Boot

### 🔐 Authentication
- User registration & login (JWT-based authentication).  
- Secure password hashing with BCrypt.  
- Role-based access (`USER`, `ADMIN`).  

### 👤 User Block Page
- Public profile page displaying user posts.  
- Ability to follow/unfollow users.  
- Notification system for new posts from followed users.

### 📰 Posts
- Create, edit, delete posts.  
- Add **media (images/videos)** with preview.  
- Like & comment on posts.  
- Automatic timestamps for each post.

### 🚨 Reports
- Report users or posts for inappropriate content.  
- Each report includes reason & timestamp.  
- Reports visible only to **admins**.

### 🧑‍💼 Admin Panel
- Manage users (view, ban, or delete).  
- Moderate posts and handle reports.  
- All admin routes protected by role-based security.

---

## 💻 Frontend – Angular

### 🏠 User Experience
- Homepage feed showing posts from followed users.  
- Personal “block page” for managing user’s own posts.  
- Visit other profiles and follow/unfollow.
- implement infinite scroll

### 💬 Post Interaction
- Like & comment on posts.  
- Upload media with live preview.  
- Show timestamps, likes.

### 🔔 Notifications
- Notification system for new posts or followers with websocket (sockJs).  


### 🚨 Reporting
- Modal-based report submission with confirmation dialog.  
- Clean UI for reporting reasons.

### 🧭 Admin Dashboard
- View all users, posts, and reports.  
- Delete or ban users, remove posts.  
- Responsive and minimal design using **Angular Material** .

---

## 🧱 Architecture


- Authentication handled via **JWT tokens** stored in **HTTP-only cookies**.
- Media stored in the file system.
- Clean separation between **frontend** and **backend** services.

---

## 🧰 Technologies Used

### Backend
- Java 17+
- Spring Boot
- Spring Security (JWT)
- Spring Data JPA / Hibernate
- PostgreSQL
- Maven

### Frontend
- Angular 19+
- Angular Material 
- RxJS
- sockJs
- TypeScript
- HTML5 / CSS3

### Tools
- GitHub
- Postman (API testing)
- VS Code

---

### 1️⃣ Clone the repository
```bash
git clone https://github.com/louhabali/01blog
cd 01blog
