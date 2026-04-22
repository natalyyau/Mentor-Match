import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import "./MyApplications.css";

const API_BASE = "http://127.0.0.1:8000/api";
const STAGES = ["Submitted", "Under Review", "Shortlisted", "Final Decision"];

function MyApplications() {
  const navigate = useNavigate();
  const userID = localStorage.getItem("userID");

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      if (!userID) {
        setApplications([]);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/my-applications/?userID=${userID}`);
        const data = await res.json();
        setApplications(Array.isArray(data.applications) ? data.applications : []);
      } catch (error) {
        console.error("Error loading applications:", error);
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [userID]);

  const stats = useMemo(() => {
    const counts = {
      total: applications.length,
      submitted: 0,
      underReview: 0,
      shortlisted: 0,
      accepted: 0,
    };

    applications.forEach((app) => {
      const status = app.status || "";
      if (status === "New") counts.submitted += 1;
      if (status === "Under Review") counts.underReview += 1;
      if (status === "Shortlisted") counts.shortlisted += 1;
      if (status === "Accepted") counts.accepted += 1;
    });

    return [
      { label: "Total Applications", value: String(counts.total) },
      { label: "Submitted", value: String(counts.submitted) },
      { label: "Under Review", value: String(counts.underReview) },
      { label: "Shortlisted", value: String(counts.shortlisted) },
      { label: "Accepted", value: String(counts.accepted) },
    ];
  }, [applications]);

  const formatDate = (value) => {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString();
  };

  const renderAssessmentCell = (app) => {
    const assessment = app.assessment;

    if (!assessment) return null;

    if (assessment.gradingStatus === "pending") {
      return <span className="status-badge review">Pending Review</span>;
    }

    if (assessment.score === null || assessment.score === undefined) {
      return <span className="status-badge review">Pending Review</span>;
    }

    const passed = assessment.passed === true;
    const failed = assessment.passed === false;
    const label = `${Number(assessment.score).toFixed(1)}%`;

    return (
      <button
        className={`status-badge ${passed ? "accepted" : failed ? "review" : "review"}`}
        type="button"
      >
        Quiz: {label}
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
