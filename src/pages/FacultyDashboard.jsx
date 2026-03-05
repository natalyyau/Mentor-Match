import { useState } from "react";
import { Link } from "react-router-dom";
import "./Dashboard.css";
import "./FacultyDashboard.css";

function FacultyDashboard() {
  const userName = localStorage.getItem("fullName") || "Faculty";
  const displayName = userName.includes("Dr.") ? userName : `Dr. ${userName}`;

  const stats = [
    { label: "Active Posting", value: "1" },
    { label: "Total Applications", value: "7" },
    { label: "Pending Review", value: "2" },
    { label: "Accepted Students", value: "0" },
  ];

  const activePostings = [
    {
      id: 1,
      title: "Machine Learning Research Assistant",
      filled: 0,
      total: 2,
      deadline: "March 15, 2025",
    },
  ];

  const recentApplications = [
    { name: "Tim Drake", score: 100, date: "Feb 27, 2025", status: "New" },
    { name: "Percy Jackson", score: 75, date: "Jan 27, 2025", status: "Reviewed" },
  ];

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
              Active Posting
              <Link to="/faculty/my-postings" className="view-all-link">View all</Link>
            </div>
            <div className="dashboard-section-body">
              {activePostings.map((post) => (
                <div key={post.id} className="posting-card faculty-posting-card">
                  <div className="posting-header">
                    <div>
                      <div className="card-title">{post.title}</div>
                      <div className="posting-stats">
                        {post.filled}/{post.total} Positions Filled
                      </div>
                    </div>
                    <span className="status-badge accepted">Active</span>
                  </div>
                  <div className="posting-meta">Deadline: {post.deadline}</div>
                  <div className="card-footer posting-actions">
                    <div>
                      <button className="btn">Review Application</button>
                      <button className="btn btn-outline">View</button>
                      <button className="btn btn-outline">Edit Posting</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="dashboard-section">
            <div className="dashboard-section-header">Recent Application</div>
            <div className="dashboard-section-body">
              {recentApplications.map((app, i) => (
                <div key={i} className="recent-app-row">
                  <div>
                    <div className="recent-app-name">{app.name}</div>
                    <div className="recent-app-date">{app.date}</div>
                  </div>
                  <div className="recent-app-right">
                    <span className="assessment-badge">Assessment Score: {app.score}</span>
                    <button className="btn btn-outline btn-sm">Review</button>
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
