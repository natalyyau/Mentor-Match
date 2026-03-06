import { useOutletContext } from "react-router-dom";
import "./Dashboard.css";

function StudentDashboard() {
  const userName = localStorage.getItem("fullName") || "Student";
  
  const stats = [
    { label: "Available Opportunities", value: "12" },
    { label: "Applications Submitted", value: "3" },
    { label: "Accepted", value: "1" },
    { label: "Pending", value: "2" },
  ];

  const recentApps = [
    {
      faculty: "Dr. Smith",
      position: "Machine Learning Research Assistant",
      appliedDate: "Feb 25, 2025",
      status: "Pending",
      statusClass: "pending",
    },
  ];

  return (
    <div className="dashboard-page">
      <h1 className="dashboard-title">Welcome Back, {userName}</h1>
      <p className="dashboard-subtitle">Here&apos;s your research opportunity overview</p>

      <div className="stats-row">
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="stat-card-label">{s.label}</div>
            <div className="stat-card-value">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-section">
          <div className="dashboard-section-header">Recent Application</div>
          <div className="dashboard-section-body">
            {recentApps.map((app, i) => (
              <div key={i} className="application-card">
                <div className="card-title">{app.position}</div>
                <div className="card-meta">{app.faculty}</div>
                <div className="card-footer">
                  <span>Applied: {app.appliedDate}</span>
                  <span className={`status-badge ${app.statusClass}`}>{app.status}</span>
                  <button className="btn btn-outline">View Detail</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-section">
          <div className="dashboard-section-header">Notification</div>
          <div className="dashboard-section-body">
            <p style={{ color: "#5a6b85", fontSize: "14px", margin: 0 }}>
              No new notifications.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;