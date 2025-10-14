// src/Components/Layout/Layout.jsx (FINAL, CLEANED MODIFICATION)

import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useLocation } from "react-router-dom"; 
import "./Layout.css";

const Layout = ({ children, onSearch, user, menuItems, pathPrefix }) => { 
  const location = useLocation();
  
  // ⬇️ CRITICAL FIX: Skip rendering the Layout components if we are on the gate page.
  if (location.pathname.endsWith('/petid-gate')) {
    // Returns ONLY the content (PetIdGate component)
    return (
      <div className="layout" style={{ minHeight: '100vh', display: 'block' }}>
        {children}
      </div>
    );
  }

  // Render the full layout (Navbar + Sidebar) for all other paths
  return (
    <div className="layout">
      <Navbar onSearch={onSearch} user={user} />
      <div className="layout-content">
        <Sidebar menuItems={menuItems} pathPrefix={pathPrefix} /> 
        <main className="main-content">{children}</main>
      </div>
    </div>
  );
};

export default Layout;