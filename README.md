# TrustScore AI

An AI-powered Identity Trust Scoring platform that evaluates user identity risk based on login behavior and adaptive security rules.

The platform analyzes authentication events, calculates a dynamic Trust Score, estimates Risk Score, and provides AI-driven security recommendations for identity protection.

---

## Features

### Identity Risk Analysis

- Dynamic Trust Score calculation
- Risk Score Engine
- Adaptive Access Decisions
- AI-powered security recommendations

### Employee Intelligence

- Employee Trust Profile
- Behavioral Analytics
- Trust Score History
- Privilege Recommendations
- Security Awareness Recommendations

### Organization Dashboard

- Executive Overview
- Employees Risk Dashboard
- Trust & Risk Timeline
- Recent Security Events
- Interactive Analytics

---

## Technology Stack

### Backend

- FastAPI
- SQLAlchemy
- SQLite
- Pydantic

### Frontend

- React
- Axios
- Chart.js
- CSS

---

## Project Structure

```text
trustscore-ai/
│
├── backend/
│   ├── app/
│   ├── services/
│   ├── models/
│   └── routers/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── styles/
│
├── README.md
└── .gitignore
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /events | Submit a security event |
| GET | /events | Retrieve all security events |
| GET | /profile/{username} | Employee profile |
| GET | /profile/{username}/history | Trust score history |
| GET | /employees | Organization employees |

---

## Run Backend

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload
```

---

## Run Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Current Capabilities

- Identity Trust Scoring
- Behavioral Risk Analysis
- Adaptive Access Control
- AI Security Assessment
- Employee Risk Dashboard
- Executive Overview
- Organization Analytics
- Historical Trust Timeline

---

## Future Improvements

- JWT Authentication
- PostgreSQL Support
- Docker Deployment
- Real-time Notifications
- Machine Learning Risk Models
- SIEM Integration

---

## Author

**Lujain**

Cybersecurity | Identity Security | AI Security