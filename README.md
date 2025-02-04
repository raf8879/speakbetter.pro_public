# 🗣 SpeakBetter – ESL Learning Platform  
[🌐 Visit Live Website](https://speakbetter.pro)  

<p align="center">
  <b>Learn to speak English with confidence!</b><br />
  Improve pronunciation, practice grammar, and enhance communication skills with AI-driven technology.<br/>
</p>

## 📌 Table of Contents
1. [Project Overview](#project-overview)  
2. [Key Features](#key-features)  
3. [Technologies Used](#technologies-used)  
4. [Architecture & Components](#architecture--components)  
5. [Repository Structure](#repository-structure)  
6. [Installation & Setup](#installation--setup)  
7. [Future Development](#future-development)  
8. [Contact & Contributors](#contact--contributors)  

---

## 🔍 **Project Overview**
**SpeakBetter** is an interactive platform designed to help ESL (English as a Second Language) learners improve their speaking and pronunciation skills.  

**Key goals of the project:**  
✔ AI-powered pronunciation analysis  
✔ Interactive grammar & vocabulary practice  
✔ Realistic dialogue simulations with AI tutors  
✔ Personalized learning progress tracking  

Currently, the project utilizes **Azure Speech-to-Text** for pronunciation analysis and is experimenting with **Whisper, MFA, and G2P models**.  

---

## 🚀 **Key Features**
### 1️⃣ **Pronunciation Mode**  
🎙 Record speech via microphone  
📝 AI analyzes accuracy, fluency, and completeness  
📊 Highlights incorrect words & provides feedback  

### 2️⃣ **Conversation Mode**  
💬 AI-powered real-time conversations  
🌍 Scenarios: Business, Travel, Interviews, Healthcare  
🔊 AI responds via text and voice  

### 3️⃣ **Grammar & Chat Practice**  
📄 Exercises: fill-in-the-blanks, editing, reading  
🔄 Instant grammar correction & vocabulary suggestions  

### 4️⃣ **User Dashboard**  
📈 Progress tracking & personalized learning stats  
🏆 Achievements & XP-based motivation system  

### 5️⃣ **Authentication & Security**  
🔑 Secure login with JWT (HTTP-only cookies)  
📧 Email verification & password reset  

---

## 🛠 **Technologies Used**
### **Backend:**
- Django & Django REST Framework (API)  
- PostgreSQL (Database)  
- Azure Speech-to-Text / Whisper (Speech Recognition)  
- MFA / G2P models (Experimental)  
- Docker & Docker-Compose (Containerization)  

### **Frontend:**
- Next.js (React)  
- Tailwind CSS (Responsive Styling)  
- TypeScript (Optional)  
- Framer Motion (Animations)  

### **Infrastructure:**
- Docker & Docker-Compose  
- Secure authentication (CORS, CSRF, HTTP-only cookies)  

---


📌 **Key Modules:**  
- **accounts/** – User authentication & profile management  
- **pronunciation/** – AI-driven pronunciation analysis  
- **conversation/** – Real-time AI-based speaking practice  
- **exercises/** – Grammar & vocabulary training  

---


## 🛠 **Installation & Setup**
### 1️⃣ Clone the repository:
bash
git clone https://github.com/raf8879/speakbetter.pro_public.git
cd speakbetter

2️⃣ Run with Docker:
Ensure Docker & Docker-Compose are installed.
docker-compose up --build


3️⃣ Environment Variables
Create .env files for backend & frontend. Example:
DJANGO_SECRET_KEY=your_secret_key
DEBUG=True
DB_NAME=speakbetter_db
DB_USER=speakbetter_user
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=5432
AZURE_SPEECH_KEY=your_api_key


4️⃣ Migrate database:

docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser


5️⃣ Open in browser:
Frontend: http://localhost:3000
Admin Panel: http://localhost:8000/admin

📈 Future Development

✔ Whisper-based pronunciation diagnostics
✔ Advanced phoneme-level feedback (MFA / G2P)
✔ AI-powered grammar correction
✔ Gamification: achievements, leaderboards, and challenges

🔗 Contact & Contributors
👨‍💻 **Lead Developer:** Rafael Dzhabrailov
📩 **Email:** rafaelrafael8879@gmail.com
🔗 **LinkedIn:** http://www.linkedin.com/in/rafael-dzhabrailov-756716330
🔗 **GitHub Repo:** https://github.com/raf8879/speakbetter.pro_public/tree/main
🔗 **Website:** [Visit SpeakBetter](https://speakbetter.pro)   
💡 If you have any questions, suggestions, or business inquiries, feel free to reach out! 🚀