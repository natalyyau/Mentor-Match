import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import "./MyApplications.css";

const API_BASE = "http://127.0.0.1:8000/api";

const STAGES = ["Application Submitted", "Faculty Review", "Interview", "Final Decision"];

function formatDate(isoStr) {
  if (!isoStr) return "";
  const d = new Date(isoStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function MyApplications() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [assessmentStatus, setAssessmentStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const userID = localStorage.getItem("userID");

  useEffect(() => {
    const fetchApplications = async () => {
      if (!userID) { setLoading(false); return; }
      try {
        const res = await fetch(`${API_BASE}/my-applications/?userID=${userID}`);
        const data = await res.json();
        setApplications(Array.isArray(data.applications) ? data.applications : []);
      } catch {
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, [userID]);

  useEffect(() => {
    const checkAssessments = async () => {
      if (!userID || applications.length === 0) return;
      const results = {};
      await Promise.all(
        applications.map(async (app) => {
          try {
            const res = await fetch(
              `${API_BASE}/assessment/attempt/?userID=${userID}&postingID=${app.projectId}`
            );
            const data = await res.json();
            results[app.projectId] = data;
          } catch {
            results[app.projectId] = { hasAssessment: false };
          }
        })
      );
      setAssessmentStatus(results);
    };
    checkAssessments();
  }, [applications, userID]);

  const total = applications.length;
  const underReview = applications.filter((app) => ["New", "Under Review", "Shortlisted"].includes(app.status)).length;
  const accepted = applications.filter((app) => app.status === "Accepted").length;
  const actionNeeded = applications.filter((app) => app.status === "Rejected").length;

  const stats = [
    { label: "Total Applications", value: String(total) },
    { label: "Under Review", value: String(underReview) },
    { label: "Accepted", value: String(accepted) },
    { label: "Action Needed", value: String(actionNeeded) },
  ];

  const renderAssessmentCell = (app) => {
    const status = assessmentStatus[app.projectId];
    if (!status) return null;
    if (!status.hasAssessment) return null;

    if (status.attempt) {
      const { score, passed } = status.attempt;
      return (
        <span className={`assessment-score-badge ${passed === true ? "pass" : passed === false ? "fail" : ""}`}>
          Quiz: {parseFloat(score).toFixed(1)}%
        </span>
      );
    }

    return (
      <button
        className="btn btn-sm"
        onClick={() => navigate(`/student/assessment/${app.projectId}`)}
      >
        Take quiz
      </button>
    );
  };

  let bodyContent;
  if (loading) {
    bodyContent = <p className="applications-loading">Loading...</p>;
  } else if (!userID) {
    bodyContent = <p className="applications-empty">Please log in to view your applications.</p>;
  } else if (applications.length === 0) {
    bodyContent = <p className="applications-empty">You have not applied to any projects yet.</p>;
  } else {
    bodyContent = applications.map((app) => (
      <div key={app.applicationId} className="application-card app-card">
        <div className="app-card-header">
          <div>
            <div className="card-title">{app.title}</div>
            <div className="card-meta">{app.faculty} · {app.department}</div>
          </div>
          <div className="app-card-right">
            <span className="status-badge review">
              {app.status === "New" ? "Submitted" : app.status || "Submitted"}
            </span>
            {renderAssessmentCell(app)}
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
    ));
  }

  return (
    <div className="dashboard-page">
      <h1 className="dashboard-title">My Applications</h1>
      <p className="dashboard-subtitle">Track the status of your research opportunity applications</p>

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
        <div className="dashboard-section-body">{bodyContent}</div>
      </div>
    </div>
  );
}

export default MyApplications;