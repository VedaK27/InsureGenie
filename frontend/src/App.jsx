import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import GetQuotePage from "./pages/GetQuotePage";
import PlansPage from "./pages/PlansPage";
import DashboardPage from "./pages/DashboardPage";
import "./index.css";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/get-quote" element={<GetQuotePage />} />
        <Route path="/plans" element={<PlansPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
      <Footer />
    </>
  );
}