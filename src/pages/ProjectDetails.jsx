import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Dashboard.css";
import "./ProjectDetails.css";

const API_BASE = "http://127.0.0.1:8000/api";

function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);

  const [applied, setApplied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmMessage, setConfirmMessage] = useState("");
  const [appEmail, setAppEmail] = useState("");
  const [statement, setStatement] = useState("");

  const userID = localStorage.getItem("userID");

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const suffix = userID ? `?userID=${userID}` : "";
        const res = await fetch(`${API_BASE}/opportunities/${id}/${suffix}`);
        const data = await res.json();
        if (res.ok) {
          setProject(data.opportunity || null);
          if (data.opportunity?.eligibility?.reasons?.length) {
            setError(data.opportunity.eligibility.reasons.join(" "));
          } else {
            setError("");
          }
        } else setProject(null);
      } catch {
        setProject(null);
      }
    };

    fetchProject();
  }, [id, userID]);

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
        // no-op
      }
    };
    checkApplied();
  }, [userID, project]);

  const canApply = Boolean(project?.eligibility?.eligible ?? true);
  const assessmentRequired = Boolean(project?.eligibility?.assessment?.required);
  const shouldShowAssessmentButton = assessmentRequired && !project?.eligibility?.assessment?.attempted;

  const handleApply = async () => {
    if (!userID) {
      localStorage.setItem("returnAfterLogin", `/student/project/${project.id}`);
      navigate("/login");
      return;
    }
    if (applied || !canApply) return;

    if (!appEmail.trim()) {
      setError("Please provide your email.");
      return;
    }
    if (!statement.trim()) {
      setError("Please provide a brief statement of interest.");
      return;
    }

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
          email: appEmail.trim(),
          statementOfInterest: statement.trim(),
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setApplied(true);
        setConfirmMessage("Your application has been submitted successfully.");
        setStatement("");
      } else {
        if (data.error?.includes("already applied")) {
          setApplied(true);
          setError("");
          setConfirmMessage("You have already applied to this opportunity.");
          return;
        }
        setError(
          Array.isArray(data.eligibility?.reasons) && data.eligibility.reasons.length > 0
            ? data.eligibility.reasons.join(" ")
            : data.error || "Failed to submit application."
        );
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
            {(project.skills || []).map((skill) => (
              <span key={skill} className="skill-tag">
                {skill}
              </span>
            ))}
          </div>
        </section>

        <section className="project-details-section">
          <h2 className="section-heading">Prerequisites</h2>
          <ul>
            {project.requiredGPA !== null && project.requiredGPA !== undefined && (
              <li>Minimum GPA: {project.requiredGPA}</li>
            )}
            {assessmentRequired && (
              <li>Minimum assessment score: {project.minAssessmentScore}%</li>
            )}
            {project.prerequisites && <li>{project.prerequisites}</li>}
          </ul>
          {project.eligibility?.missingSkills?.length > 0 && (
            <p className="apply-error">Missing skills: {project.eligibility.missingSkills.join(", ")}</p>
          )}
        </section>

        <section className="project-details-section">
          <h2 className="section-heading">Apply</h2>
          <div className="apply-form">
            <div className="input-group">
              <label htmlFor="apply-email">Email</label>
              <input
                id="apply-email"
                type="email"
                value={appEmail}
                onChange={(e) => setAppEmail(e.target.value)}
                placeholder="you@university.edu"
              />
            </div>
            <div className="input-group">
              <label htmlFor="apply-statement">Statement of interest</label>
              <textarea
                id="apply-statement"
                rows={5}
                value={statement}
                onChange={(e) => setStatement(e.target.value)}
                placeholder="Briefly describe why you're interested and your relevant experience."
              />
            </div>
          </div>
        </section>

        <div className="project-details-footer">
          {shouldShowAssessmentButton && (
            <button className="btn btn-outline" onClick={() => navigate(`/student/assessment/${project.id}`)}>
              Take Assessment First
            </button>
          )}
          {confirmMessage && <p className="apply-confirmation">{confirmMessage}</p>}
          {error && <p className="apply-error">{error}</p>}
          <button
            className={`btn apply-btn ${applied ? "applied" : ""}`}
            onClick={handleApply}
            disabled={loading || applied || !canApply}
          >
            {loading ? "Submitting..." : applied ? "Applied" : canApply ? "Apply" : "Not Eligible Yet"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProjectDetails;
