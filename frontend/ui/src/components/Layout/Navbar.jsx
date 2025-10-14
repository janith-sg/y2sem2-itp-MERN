import { useState, useEffect } from "react";
import { Bell, Search, User } from "lucide-react";
import "./Navbar.css";

const Navbar = ({ onSearch, user }) => {
  const [q, setQ] = useState("");

  // optional: emit on change (live search); remove if you prefer on submit only
  useEffect(() => {
    if (typeof onSearch === "function") onSearch(q);
  }, [q, onSearch]);

  const handleSubmit = (e) => {
    e.preventDefault(); // keep SPA, no page reload
    if (typeof onSearch === "function") onSearch(q);
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-brand">
          <div className="brand-icon">
            {/* <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M16 2L20 10H28L22 16L24 24L16 20L8 24L10 16L4 10H12L16 2Z" fill="#22c55e" />
            </svg> */}
          </div>
          {/* <h1 className="brand-text">PetCare</h1> */}
        </div>

        <div className="navbar-search">
          <form className="search-container" onSubmit={handleSubmit}>
            <Search size={20} className="search-icon" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search records, prescriptions, ..."
              className="search-input"
              aria-label="Global search"
            />
          </form>
        </div>

        <div className="navbar-actions">
          <button className="action-btn" aria-label="Notifications">
            <Bell size={20} />
          </button>
          <button className="action-btn profile-btn" aria-label="Profile">
            <User size={20} />
            <span>{user?.name ?? "Dr. Smith"}</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
