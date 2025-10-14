// src/Components/Layout/Sidebar.jsx
import { NavLink } from "react-router-dom";
import { Home, FileText, Pill, Syringe, FlaskConical } from "lucide-react";
import "./Sidebar.css";

const ADMIN_MENU = [
  { path: "/medical-records", icon: Home, label: "Dashboard", end: true },
  { path: "/records", icon: FileText, label: "Medical Records" },
  { path: "/prescriptions", icon: Pill, label: "Prescriptions" },
  { path: "/vaccinations", icon: Syringe, label: "Vaccinations" },
  { path: "/labresults", icon: FlaskConical, label: "Lab Results" },
];

const USER_MENU = [
  { path: "/medical-records/", icon: Home, label: "Dashboard", end: true },
  { path: "/medical-records/records", icon: FileText, label: "Medical Records" },
  { path: "/medical-records/prescriptions", icon: Pill, label: "Prescriptions" },
  { path: "/medical-records/vaccinations", icon: Syringe, label: "Vaccinations" },
  { path: "/medical-records/labresults", icon: FlaskConical, label: "Lab Results" },
];

const Sidebar = ({ menuItems, pathPrefix = "" }) => {
  // Determine which menu to use based on pathPrefix
  const getMenuItems = () => {
    if (pathPrefix === "/user") {
      return USER_MENU;
    }
    return menuItems || ADMIN_MENU;
  };

  const currentMenu = getMenuItems();

  const getPath = (path) => {
    if (pathPrefix) {
      const combined = `${pathPrefix}${path === "/" ? "" : path}`;
      return combined.replace(/\/\//g, '/'); 
    }
    return path;
  };

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {currentMenu.map(({ path, icon: Icon, label, end }) => (
          <NavLink
            key={path}
            to={getPath(path)}
            end={Boolean(end)} 
            className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;