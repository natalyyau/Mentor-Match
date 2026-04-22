import { Link, useLocation, Outlet } from "react-router-dom";
import "./Layout.css";

const STUDENT_NAV = [
  { path: "/student/dashboard", label: "Dashboard" },
  { path: "/student/browse", label: "Browse Opportunities" },
  { path: "/student/applications", label: "My Application" },
];

const FACULTY_NAV = [
  { path: "/faculty/dashboard", label: "Dashboard" },
  { path: "/faculty/analytics", label: "Analytics" }, // Added this
  { path: "/faculty/create-posting", label: "Create Project" },
  { path: "/faculty/my-postings", label: "My Projects" },
  { path: "/faculty/applications", label: "Applicant List" },
];

function Layout({ userRole: propRole, userName: propName }) {
  const location = useLocation();
  const path = location.pathname;

  const savedRole = localStorage.getItem("role");
  const savedName = localStorage.getItem("fullName");

  const userRole = propRole ?? savedRole ?? (path.startsWith("/faculty") ? "faculty" : "student");
  const userName = propName ?? savedName ?? "User";
  const navItems = userRole === "faculty" ? FACULTY_NAV : STUDENT_NAV;

  const displayName =
    userRole === "faculty"
      ? userName.startsWith("Dr.") ? userName : `Dr. ${userName}`
      : userName;

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <Link to="/" className="sidebar-brand">Mentor Match</Link>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link ${location.pathname === item.path ? "active" : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="sidebar-user">
          <span className="user-name">{displayName}</span>
        </div>
      </aside>
      <main className="dashboard-main">
        <Outlet context={{ userRole, userName }} />
      </main>
    </div>
  );
}

export default Layout;