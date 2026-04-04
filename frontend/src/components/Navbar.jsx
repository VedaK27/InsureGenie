import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo/logo.png";

export default function Navbar() {
  const { pathname } = useLocation();

  return (
    <nav className="navbar">
      <Link className="nav-logo" to="/">
       <img 
  src={logo} 
  alt="InsurGenie logo" 
  style={{ width: "60px", height: "60px", marginRight: "5px" }} 
/>
        Insur<span className="g">Genie</span>
      </Link>
      <div className="nav-links">
        <Link to="/how-it-works" className={pathname === "/how-it-works" ? "active" : ""}>
          How It Works
        </Link>
        <Link to="/plans">Plans</Link>
        <Link to="/get-quote">Get Quote</Link>
        <Link to="/dashboard">Rewards</Link>
        <Link to="/dashboard-page">Dashboard</Link>
      </div>
    </nav>
  );
}