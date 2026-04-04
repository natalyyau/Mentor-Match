import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "./Dashboard.css";
import "./FacultyApplications.css";

const API_BASE = "http://127.0.0.1:8000/api";

const STATUS_STYLES = {
  New: "status-new",
  "Under Review": "status-review",
  Shortlisted: "status-shortlisted",
  Accepted: "status-accepted",
  Rejected: "status-rejected",
};

const STATUS_OPTIONS = ["New", "Under Review", "Shortlisted", "Accepted", "Rejected"];

function FacultyApplications() {
  const [searchParams, setSearchParams] = useSearchParams();
  const projectId = searchParams.get("projectId");
  const userID = localStorage.getItem("userID");

  const [skillsModal, setSkillsModal] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [facultyPostings, setFacultyPostings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    const fetchPostings = async () => {
      if (!userID) return;
      try {
        const res = await fetch(`${API_BASE}/my-postings/?userID=${userID}`);
        const data = await res.json();
        setFacultyPostings(Array.isArray(data.postings) ? data.postings : []);
      } catch {
        setFacultyPostings([]);
      }
    };

    fetchPostings();
  }, [userID]);

  useEffect(() => {
    const fetchApplicants = async () => {
      if (!userID) {
        setApplicants([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const url = projectId
          ? `${API_BASE}/faculty-applications/?userID=${userID}&projectId=${projectId}`
          : `${API_BASE}/faculty-applications/?userID=${userID}`;
        const res = await fetch(url);
        const data = await res.json();
        setApplicants(Array.isArray(data.applications) ? data.applications : []);
      } catch {
        setApplicants([]);
      } finally {
        setLoading(false);
      }
    };

    fetchApplicants();
  }, [userID, projectId]);

  const project = facultyPostings.find((p) => String(p.id) === String(projectId)) || null;

  const handleStatusChange = async (applicationId, nextStatus) => {
    setStatusMessage("");
    try {
      const res = await fetch(`${API_BASE}/faculty-applications/status/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userID: Number.parseInt(userID, 10),
          applicationId,
          status: nextStatus,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatusMessage(data.error || "Could not update status.");
        return;
      }
      setApplicants((prev) => prev.map((app) => (app.applicationId === applicationId ? { ...app, status: nextStatus } : app)));
      setStatusMessage("Application status updated.");
    } catch {
      setStatusMessage("Could not update status.");
    }
  };

  const statusCounts = applicants.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});

  const stats = [
    { label: "Total Applicants", value: String(applicants.length) },
    { label: "New", value: String(statusCounts.New || 0) },
    { label: "Under Review", value: String(statusCounts["Under Review"] || 0) },
    { label: "Shortlisted", value: String(statusCounts.Shortlisted || 0) },
    { label: "Accepted", value: String(statusCounts.Accepted || 0) },
    { label: "Rejected", value: String(statusCounts.Rejected || 0) },
  ];

  return (
    <div className="dashboard-page faculty-applicants-page">
      <h1 className="dashboard-title">Applicant List</h1>
      <p className="dashboard-subtitle">Students who applied to your projects — view skills and update application status</p>

      {project && (
        <div className="faculty-app-project-banner">
          Filtering by project: <strong>{project.title}</strong>
        </div>
      )}

      {statusMessage && <div className="faculty-app-project-banner">{statusMessage}</div>}

      <div className="stats-row faculty-app-stats">
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="stat-card-label">{s.label}</div>
            <div className="stat-card-value">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="faculty-app-toolbar">
        <select className="filter-select" value={projectId || ""} onChange={(e) => {
          const next = e.target.value;
          setSearchParams(next ? { projectId: next } : {});
        }}>
          <option value="">All projects</option>
          {facultyPostings.map((p) => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
        <span className="sort-label">Sort: Most recent</span>
      </div>

      {loading && <div className="applicants-empty">Loading...</div>}
      {!loading && applicants.length === 0 && <div className="applicants-empty">No applicants for this project yet.</div>}
      {!loading && applicants.length > 0 && (
        <div className="applications-table-wrapper">
          <table className="applications-table applicants-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Project</th>
                <th>View skills</th>
                <th>Application status</th>
                <th>Assessment</th>
                <th>GPA</th>
                <th>Applied</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {applicants.map((app) => (
                <tr key={app.id}>
                  <td>
                    <div className="student-cell">
                      <span className="student-name">{app.student}</span>
                      <span className="student-email">{app.email}</span>
                    </div>
                  </td>
                  <td><div className="position-cell">{app.position}</div></td>
                  <td>
                    <div className="skills-preview">
                      {(Array.isArray(app.skills) ? app.skills : []).slice(0, 2).map((s) => (
                        <span key={s} className="skill-pill">{s}</span>
                      ))}
                      {(Array.isArray(app.skills) ? app.skills : []).length > 2 && <span className="skills-more">+{(Array.isArray(app.skills) ? app.skills : []).length - 2}</span>}
                    </div>
                    <button type="button" className="link-btn" onClick={() => setSkillsModal(app)}>View skills</button>
                  </td>
                  <td>
                    <select value={app.status} className={`filter-select ${STATUS_STYLES[app.status] || "status-review"}`} onChange={(e) => handleStatusChange(app.applicationId, e.target.value)}>
                      {STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status}</option>)}
                    </select>
                  </td>
                  <td>{app.assessment || "—"}</td>
                  <td>{app.gpa ?? "—"}</td>
                  <td>{app.appliedDate}</td>
                  <td><button type="button" className="btn btn-outline btn-sm" onClick={() => setSkillsModal(app)}>View profile</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {skillsModal && (
        <div className="skills-modal-overlay" aria-labelledby="skills-modal-title">
          <section className="skills-modal">
            <h2 id="skills-modal-title" className="skills-modal-title">{skillsModal.student}&apos;s skills</h2>
            <p className="skills-modal-meta">{skillsModal.position}</p>
            <ul className="skills-modal-list">
              {(Array.isArray(skillsModal.skills) ? skillsModal.skills : []).map((skill) => (<li key={skill}>{skill}</li>))}
            </ul>
            <button type="button" className="btn skills-modal-close" onClick={() => setSkillsModal(null)}>Close</button>
          </section>
        </div>
      )}
    </div>
  );
}

export default FacultyApplications;
