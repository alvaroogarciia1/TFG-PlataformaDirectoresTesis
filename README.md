# 🎓 PhD Supervisor Matching Platform

A web-based platform designed to connect prospective PhD students with suitable thesis supervisors based on research interests and academic alignment.

---

## 📌 Overview

This project was developed as a Final Year Project (TFG) at **Universidad Politécnica de Madrid (UPM)**.

The platform addresses a common challenge in academia:
students often struggle to identify suitable PhD supervisors, while professors receive generic and inefficient contact requests.

To solve this, the system provides a **structured matchmaking approach**, enabling efficient connections between students and supervisors based on research compatibility.

---

## 🚀 Key Features

* 👨‍🎓 Student profile creation including:

  * CV upload
  * Research interests
  * Thesis proposal
  * Academic background

* 👨‍🏫 Professor profiles with:

  * Research lines
  * Previous supervision experience
  * Availability

* 🔍 Dual search system:

  * **Automatic matching** based on research similarity and program alignment
  * **Manual search** with advanced filters

* 📊 Match scoring system to rank potential matches

* 📩 Integrated contact system with personalized messaging

* 🧠 Recommendation logic based on research keywords and academic compatibility

---

## 🏗️ Project Structure

```bash id="b5h4zq"
Fase de desarrollo/
│
├── backend/      # Spring Boot REST API
├── frontend/     # Web application
└── README.md
```

---

## ⚙️ Tech Stack

### Backend

* **Java 25 (LTS)**
* **Spring Boot**
* **Maven**
* **PostgreSQL**

### Frontend

* **Node.js 24**
* **npm 11**
* **React / Next.js**

### Tools & Environment

* Git 2.53
* RESTful API design
* MVC architecture

---

## 🖥️ Environment Setup

| Technology | Version |
| ---------- | ------- |
| Java       | 25 LTS  |
| Javac      | 25      |
| Maven      | 3.9.12  |
| Node.js    | 24.14   |
| npm        | 11.9    |
| Git        | 2.53    |
| PostgreSQL | 18      |

---

## ▶️ Getting Started

### Backend

```bash id="2cm7on"
cd backend/thesisplatform
mvn spring-boot:run
```

API available at:

```id="g3lccm"
http://localhost:8080
```

---

### Frontend

```bash id="k1r3o9"
cd frontend/thesisplatform-frontend
npm install
npm run dev
```

---

## 🎯 Objectives Achieved

* Full-stack web application developed following modern software engineering practices
* Implementation of a matchmaking system between students and PhD supervisors
* Efficient search and recommendation system based on research alignment
* User-friendly interface for both students and professors
* End-to-end functionality from profile creation to contact initiation

---

## 🧠 Motivation

Traditional methods of finding PhD supervisors rely heavily on manual searches and generic outreach, often resulting in low success rates.

This platform improves the process by introducing a **data-driven and structured matching system**, increasing efficiency and relevance in academic collaborations.

---

## 👨‍💻 Author

**Álvaro García-Caro Bartolomé**
Computer Engineering – UPM

---

## 📄 License

Academic use – Final Year Project (TFG)
