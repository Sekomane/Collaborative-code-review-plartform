# Collaborative Code Review Platform

A **RESTful API** for managing code reviews and collaboration within development teams, built with **TypeScript**, **Express**, and **PostgreSQL**.

---

## Table of Contents
1. [Overview](#overview)  
2. [Features](#features)  
3. [Installation](#installation)  
4. [Running the API](#running-the-api)  
5. [API Endpoints](#api-endpoints)  
6. [Error Handling](#error-handling)  

---

## Overview

This API allows development teams to:  
- Register users as **submitters** or **reviewers**.  
- Create and manage **projects**.  
- Submit **code snippets or files** for review.  
- Add **inline or general comments** on submissions.  
- Approve or request changes on code submissions.  
- Track submission statuses and project analytics.

All data is stored in **PostgreSQL**, with secure authentication and role-based access control.

---

## Features

- **User Authentication** (/api/auth)  
  - Register, login with JWT  
  - Profile CRUD  

- **Projects** (/api/projects)  
  - Create, list, update, delete projects  
  - Add/remove members  

- **Code Submissions** (/api/submissions)  
  - Submit code, track status  
  - Approve or request changes  

- **Comments** (/api/submissions/:id/comments)  
  - Add, list, update, delete comments (role-based)  

- **Notifications & Stats**  
  - Real-time updates via WebSockets  
  - Project-level analytics  

- **Middleware**  
  - Request validation  
  - Error handling  
  - Role-based authorization  

---

## Installation

1. Clone the repository:

```bash
git clone https://github.com/Sekomane/Collaborative-code-review-plartform.git
cd collaborative-code-review-plartform
```

2. install dependancies
   npm install

3. Ensure that PostgreSQL is running and database codereview exists
```
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255),
  role VARCHAR(20) CHECK (role IN ('reviewer', 'submitter'))
);

CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  description TEXT
);

CREATE TABLE submissions (
  id SERIAL PRIMARY KEY,
  project_id INT REFERENCES projects(id),
  user_id INT REFERENCES users(id),
  code TEXT,
  status VARCHAR(20) DEFAULT 'pending'
);

CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  submission_id INT REFERENCES submissions(id),
  reviewer_id INT REFERENCES users(id),
  content TEXT
);

CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

```
Run the server in development
```
npm run dev
```

---
API endpoints

- **Register: ** POST /api/auth/register
```
{
  "name": "Rori Seko,
  "email": "Seko@gmail.com",
  "password": "Rori123",
  "role": "submitter"
}
```

-  **Login:** POST /api/auth/login
  ```
{
  "email": "Seko@gmail.com",
  "password": "Rori123"
}
```

- **Get user**
  ```
  GET /api/users/:id
  ```

- **Update user**
```
PUT /api/users/:id
```

- **Add user**
 ```
POST /api/projects/:id/members
```
 - **Remove member**
   ```
   DELETE /api/projects/:id/members/:Id
   ```

- **Comments**
```
POST /api/submissions/:id/comments --Add comment

GET /api/submissions/:id/comments --List comments

PUT /api/comments/:id --Update comment

DELETE /api/comments/:id 
```



- **Notifications & Stats**
```
GET /api/users/:id/notifications - User activity feed

GET /api/projects/:id/stats - Project statistics

Error Handling

400 Bad Request: Missing or invalid input

401 Unauthorized: Invalid or missing token

403 Forbidden: Insufficient role permissions

404 Not Found: Resource does not exist

409 Conflict: Duplicate entry
```
