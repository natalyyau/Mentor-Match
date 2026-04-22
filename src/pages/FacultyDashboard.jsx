import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Dashboard.css";
import "./FacultyDashboard.css";

const API_BASE = "http://127.0.0.1:8000/api";

function FacultyDashboard() {
  const userName = localStorage.getItem("fullName") || "Faculty";
  const userID = localStorage.getItem("userID");
  const displayName = userName.includes("Dr.") ? userName : `Dr. ${userName}`;

  const [stats, setStats] = useState([
    { label: "Active Postings", value: "0" },
    { label: "Total Applications", value: "0" },
    { label: "Pending Review", value: "0" },
    { label: "Accepted Students", value: "0" },
  ]);
  const [activePostings, setActivePostings] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);

  useEffect(() => {
    if (!userID) return;

    const loadDashboard = async () => {
      try {
        const [postingsRes, appsRes] = await Promise.all([
          fetch(`${API_BASE}/my-postings/?userID=${userID}`),
          fetch(`${API_BASE}/faculty-applications/?userID=${userID}`),
        ]);

        const postingsData = await postingsRes.json();
        const appsData = await appsRes.json();

        const postings = postingsData.postings || [];
        const applications = appsData.applications || [];

        const pending = applications.filter(
          (app) => app.status === "New" || app.status === "Under Review"
        ).length;
        const accepted = applications.filter(
          (app) => app.status === "Accepted"
        ).length;

        setStats([
          { label: "Active Postings", value: String(postings.length) },
          { label: "Total Applications", value: String(applications.length) },
          { label: "Pending Review", value: String(pending) },
          { label: "Accepted Students", value: String(accepted) },
        ]);

        setActivePostings(postings.slice(0, 3));

        setRecentApplications(
          applications.slice(0, 3).map((app) => ({
            name: app.student,
            date: app.appliedDate,
            status: app.status,
            applicationId: app.applicationId,
          }))
        );
      } catch {
        // keep defaults
      }
    };

    loadDashboard();
  }, [userID]);

  return (
    <div className="dashboard-page">
      <h1 className="dashboard-title">Welcome Back, {displayName}</h1>
      <p className="dashboard-subtitle">
        Manage your research opportunities and review applications
      </p>

      <div className="stats-row">
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="stat-card-label">{s.label}</div>
            <div className="stat-card-value">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div>
          <div className="dashboard-section">
            <div className="dashboard-section-header">
              Active Postings
              <Link to="/faculty/my-postings" className="view-all-link">View all</Link>
            </div>
            <div className="dashboard-section-body">
              {activePostings.length === 0 && (
                <p style={{ color: "#5a6b85", fontSize: "14px", margin: 0 }}>
                  No active postings.
                </p>
              )}
              {activePostings.map((post) => (
                <div key={post.id} className="posting-card faculty-posting-card">
                  <div className="posting-header">
                    <div>
                      <div className="card-title">{post.title}</div>
                      <div className="posting-stats">{post.department}</div>
                    </div>
                    <span className="status-badge accepted">Active</span>
                  </div>
                  <div className="posting-meta">Deadline: {post.deadline}</div>
                  <div className="card-footer posting-actions">
                    <div>
                      <Link to="/faculty/applications">
                        <button className="btn">Review Applications</button>
                      </Link>
                      <Link to={`/faculty/my-postings`}>
                        <button className="btn btn-outline">View</button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="dashboard-section">
            <div className="dashboard-section-header">Recent Applications</div>
            <div className="dashboard-section-body">
              {recentApplications.length === 0 && (
                <p style={{ color: "#5a6b85", fontSize: "14px", margin: 0 }}>
                  No recent applications.
                </p>
              )}
              {recentApplications.map((app) => (
                <div key={app.applicationId} className="recent-app-row">
                  <div>
                    <div className="recent-app-name">{app.name}</div>
                    <div className="recent-app-date">{app.date}</div>
                  </div>
                  <div className="recent-app-right">
                    <span className={`status-badge ${app.status === "Accepted" ? "accepted" : "pending"}`}>
                      {app.status}
                    </span>
                    <Link to="/faculty/applications">
                      <button className="btn btn-outline btn-sm">Review</button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="dashboard-section">
            <div className="dashboard-section-header">Notification</div>
            <div className="dashboard-section-body">
              <p style={{ color: "#5a6b85", fontSize: "14px", margin: 0 }}>
                No new notifications.
              </p>
            </div>
          </div>
          <div className="dashboard-section">
            <div className="dashboard-section-header">Application Trend</div>
            <div className="dashboard-section-body">
              <p style={{ color: "#5a6b85", fontSize: "14px", margin: 0 }}>
                Chart placeholder — connect to analytics when ready.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FacultyDashboard;