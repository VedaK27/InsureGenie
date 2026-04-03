import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const { pathname } = useLocation();

  return (
    <nav className="navbar">
      <Link className="nav-logo" to="/">
        Insur<span className="g">Genie</span>
      </Link>
      <div className="nav-links">
        <Link to="/#how" className={pathname === "/" ? "" : ""}>
          How It Works
        </Link>
        <Link to="/plans">Plans</Link>
        <Link to="/get-quote">Get Quote</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/get-quote" className="nav-cta">
          Start Free
        </Link>
      </div>
    </nav>
  );
}