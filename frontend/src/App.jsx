import { Routes, Route, Navigate, useLocation} from "react-router-dom";
import { useState } from "react";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import HomePage from "./pages/HomePage";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import GetQuotePage from "./pages/GetQuotePage";
import PlansPage from "./pages/PlansPage";
import DashboardPage from "./pages/DashboardPage";
import Gamification from "./pages/Gamification";

import "./index.css";

import AdminDashboard from "./pages/AdminDashboard";


// 🔒 Protected Route
function ProtectedRoute({ user, children }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  const location = useLocation();
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const isAdminPage = location.pathname === "/admin";

  return (
    <>
       {!isAdminPage && <Navbar user={user} setUser={setUser} />}
      

      <Routes>

        
        <Route path="/" element={<HomePage />} />

        <Route path="/home" element={<Home />} />

        {/* 🔐 Login */}
        <Route
          path="/login"
          element={<Login setUser={setUser} />}
        />

        {/* 🧠 Get Quote (needs user) */}
        <Route
          path="/get-quote"
          element={
            <ProtectedRoute user={user}>
              <GetQuotePage user={user} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard-page"
          element={
            <ProtectedRoute user={user}>
              <DashboardPage user={user} />
            </ProtectedRoute>
          }
        />

        {/* 📊 Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute user={user}>
              <Dashboard user={user} setUser={setUser} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/gamification"
          element={
            <ProtectedRoute user={user}>
              <Gamification user={user} setUser={setUser} />
            </ProtectedRoute>
          }
        />

        {/* 📦 Plans */}
        <Route
          path="/plans"
          element={
            <ProtectedRoute user={user}>
              <PlansPage user={user} />
            </ProtectedRoute>
          }
        />

         
        <Route path="/admin" element={<AdminDashboard />} />

       
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {!isAdminPage && <Footer />}
      
      
    </>
  );
}

export default App;