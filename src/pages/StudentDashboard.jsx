import { useEffect, useState } from "react";
import "./Dashboard.css";

const API_BASE = "http://127.0.0.1:8000/api";

function StudentDashboard() {
  const userName = localStorage.getItem("fullName") || "Student";
  const userID = localStorage.getItem("userID");
  const [stats, setStats] = useState([
    { label: "Available Opportunities", value: "0" },
    { label: "Applications Submitted", value: "0" },
    { label: "Accepted", value: "0" },
    { label: "Pending", value: "0" },
  ]);
  const [recentApps, setRecentApps] = useState([]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [oppRes, appRes] = await Promise.all([
          fetch(`${API_BASE}/opportunities/${userID ? `?userID=${userID}` : ""}`),
          userID ? fetch(`${API_BASE}/my-applications/?userID=${userID}`) : Promise.resolve(null),
        ]);

        const oppData = oppRes ? await oppRes.json() : { opportunities: [] };
        const appData = appRes ? await appRes.json() : { applications: [] };

        const applications = Array.isArray(appData?.applications) ? appData.applications : [];
        const accepted = applications.filter((app) => app.status === "Accepted").length;
        const pending = applications.filter((app) => app.status !== "Accepted" && app.status !== "Rejected").length;

        setStats([
          { label: "Available Opportunities", value: String((oppData.opportunities || []).length) },
          { label: "Applications Submitted", value: String(applications.length) },
          { label: "Accepted", value: String(accepted) },
          { label: "Pending", value: String(pending) },
        ]);

        setRecentApps(applications.slice(0, 3).map((app) => ({
          faculty: app.faculty,
          position: app.title,
          appliedDate: app.submittedAt,
          status: app.status,
          statusClass: "pending",
        })));
      } catch {
        // keep defaults
      }
    };

    loadDashboard();
  }, [userID]);

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
            {recentApps.length === 0 && <p style={{ color: "#5a6b85", fontSize: "14px", margin: 0 }}>No recent applications.</p>}
            {recentApps.map((app, i) => (
              <div key={i} className="application-card">
                <div className="card-title">{app.position}</div>
                <div className="card-meta">{app.faculty}</div>
                <div className="card-footer">
                  <span>Applied: {app.appliedDate}</span>
                  <span className={`status-badge ${app.statusClass}`}>{app.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-section">
          <div className="dashboard-section-header">Notification</div>
          <div className="dashboard-section-body">
            <p style={{ color: "#5a6b85", fontSize: "14px", margin: 0 }}>No new notifications.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
