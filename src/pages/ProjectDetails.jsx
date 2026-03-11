import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MOCK_PROJECTS } from "../data/mockProjects";
import "./Dashboard.css";
import "./ProjectDetails.css";

const API_BASE = "http://127.0.0.1:8000/api";

function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const project = MOCK_PROJECTS.find((p) => p.id === parseInt(id, 10));

  const [applied, setApplied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmMessage, setConfirmMessage] = useState("");

  const userID = localStorage.getItem("userID");

  useEffect(() => {
    const checkApplied = async () => {
      if (!userID || !project) return;
      try {
        const res = await fetch(
          `${API_BASE}/check-applied/?userID=${userID}&projectId=${project.id}`
        );
        const data = await res.json();
        if (data.applied) setApplied(true);
      } catch {
        const local = localStorage.getItem("appliedProjects") || "[]";
        const ids = JSON.parse(local);
        if (ids.includes(project.id)) setApplied(true);
      }
    };
    checkApplied();
  }, [userID, project]);

  const handleApply = async () => {
    if (!userID) {
      localStorage.setItem("returnAfterLogin", `/student/project/${project.id}`);
      navigate("/login");
      return;
    }
    if (applied) return;

    setLoading(true);
    setError("");
    setConfirmMessage("");

    try {
      const res = await fetch(`${API_BASE}/apply/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userID: parseInt(userID, 10),
          projectId: project.id,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setApplied(true);
        setConfirmMessage("Your application has been submitted successfully.");
        const local = JSON.parse(localStorage.getItem("appliedProjects") || "[]");
        if (!local.includes(project.id)) {
          localStorage.setItem("appliedProjects", JSON.stringify([...local, project.id]));
        }
      } else {
        if (data.error?.includes("already applied")) {
          setApplied(true);
        }
        setError(data.error || "Failed to submit application.");
      }
    } catch {
      setError("Unable to connect. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (!project) {
    return (
      <div className="dashboard-page">
        <p>Project not found.</p>
        <button className="btn" onClick={() => navigate("/student/browse")}>
          Back to Browse
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-page project-details-page">
      <button className="back-link" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="project-details-card">
        <h1 className="project-details-title">{project.title}</h1>
        <div className="project-details-meta">
          {project.faculty} · {project.department} · {project.duration}
        </div>

        <section className="project-details-section">
          <h2 className="section-heading">Description</h2>
          <p className="project-description">{project.fullDescription || project.desc}</p>
        </section>

        <section className="project-details-section">
          <h2 className="section-heading">Required Skills</h2>
          <div className="skills-list">
            {project.skills.map((skill) => (
              <span key={skill} className="skill-tag">
                {skill}
              </span>
            ))}
          </div>
        </section>

        <div className="project-details-footer">
          {confirmMessage && (
            <p className="apply-confirmation">{confirmMessage}</p>
          )}
          {error && <p className="apply-error">{error}</p>}
          <button
            className={`btn apply-btn ${applied ? "applied" : ""}`}
            onClick={handleApply}
            disabled={loading || applied}
          >
            {loading ? "Submitting..." : applied ? "Applied" : "Apply"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProjectDetails;
