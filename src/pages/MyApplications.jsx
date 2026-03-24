import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MOCK_PROJECTS } from "../data/mockProjects";
import "./Dashboard.css";
import "./MyApplications.css";

const API_BASE = "http://127.0.0.1:8000/api";

const STAGES = [
  "Application Submitted",
  "Faculty Review",
  "Interview",
  "Final Decision",
];

function formatDate(isoStr) {
  if (!isoStr) return "";
  const d = new Date(isoStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function MyApplications() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const userID = localStorage.getItem("userID");

  useEffect(() => {
    const fetchApplications = async () => {
      if (!userID) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/my-applications/?userID=${userID}`);
        const data = await res.json();
        if (data.applications) {
          const enriched = data.applications
            .map((app) => {
              const project = MOCK_PROJECTS.find((p) => p.id === app.projectId);
              return project
                ? {
                    projectId: app.projectId,
                    submittedAt: app.submittedAt,
                    title: project.title,
                    faculty: project.faculty,
                    department: project.department,
                  }
                : null;
            })
            .filter(Boolean);
          setApplications(enriched);
        }
      } catch {
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, [userID]);

  const total = applications.length;
  const stats = [
    { label: "Total Applications", value: String(total) },
    { label: "Under Review", value: String(total) },
    { label: "Accepted", value: "0" },
    { label: "Action Needed", value: "0" },
  ];

  return (
    <div className="dashboard-page">
      <h1 className="dashboard-title">My Applications</h1>
      <p className="dashboard-subtitle">
        Track the status of your research opportunity applications
      </p>

      <div className="stats-row">
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="stat-card-label">{s.label}</div>
            <div className="stat-card-value">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="pipeline-visual">
        {STAGES.map((stage, i) => (
          <div key={stage} className="pipeline-step">
            <div className="pipeline-dot" />
            <span className="pipeline-label">{stage}</span>
            {i < STAGES.length - 1 && <div className="pipeline-line" />}
          </div>
        ))}
      </div>

      <div className="dashboard-section">
        <div className="dashboard-section-header">Your Applications</div>
        <div className="dashboard-section-body">
          {loading ? (
            <p className="applications-loading">Loading...</p>
          ) : !userID ? (
            <p className="applications-empty">Please log in to view your applications.</p>
          ) : applications.length === 0 ? (
            <p className="applications-empty">You have not applied to any projects yet.</p>
          ) : (
            applications.map((app) => (
              <div key={app.projectId} className="application-card app-card">
                <div className="app-card-header">
                  <div>
                    <div className="card-title">{app.title}</div>
                    <div className="card-meta">
                      {app.faculty} · {app.department}
                    </div>
                  </div>
                  <div className="app-card-right">
                    <span className="status-badge review">Submitted</span>
                  </div>
                </div>
                <div className="app-card-footer">
                  <span>Applied: {formatDate(app.submittedAt)}</span>
                  <button
                    className="btn btn-outline"
                    onClick={() => navigate(`/student/project/${app.projectId}`)}
                  >
                    View Detail
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default MyApplications;
