import { Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Gamification from "./pages/Gamification";

// Simple wrapper to protect routes that require a logged-in user
function ProtectedRoute({ user, children }) {
  if (!user) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function App() {
  const [user, setUser] = useState(() => {
    // Persist user across page refreshes using localStorage
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Login setUser={setUser} />} />
      <Route path="/home" element={<Home />} />

      {/* Protected routes */}
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
            <Gamification user={user} />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;