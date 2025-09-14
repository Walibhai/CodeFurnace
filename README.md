# 🚀 CodeFurnace – Online Coding Platform  

CodeFurnace is a **full-stack online coding platform** inspired by **LeetCode** and **GeeksforGeeks (GFG)**.  
It allows users to practice coding problems with **real-time code compilation**, an **admin panel for problem management**, and a **secure authentication system**.  

---

## ✨ Features  

- 🖥️ **Solve Coding Problems** – Real-time code compilation powered by **Judge0 API**.  
- 🔐 **Authentication & Security** – Implemented using **JWT tokens** with **Redis** for session handling and logout functionality.  
- 🛠️ **Admin Panel** – Add, update, and delete coding problems as well as editorial videos.  
- 🎨 **Responsive UI** – Built with **React.js**, styled using **Tailwind CSS** and **DaisyUI** for an elegant developer experience.  
- 📂 **Database** – **MongoDB** for storing user data, coding problems, and submissions with scalability in mind.  

---

## 🏗️ Tech Stack  

**Frontend:** React.js, Tailwind CSS, DaisyUI  
**Backend:** Node.js, Express.js  
**Database:** MongoDB  
**Session & Auth:** JWT, Redis  
**Compiler API:** Judge0  

---

## ⚡ Installation & Setup  

1. **Clone the repository**  
   ```bash
   git clone https://github.com/your-username/codefurnace.git
   cd codefurnace

   Install dependencies

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install


Setup environment variables
Create a .env file in the server folder with:

PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
REDIS_URL=your_redis_url
JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=your_judge0_api_key


Run the development servers

# Start backend
cd server
npm run dev

# Start frontend
cd ../client
npm start

