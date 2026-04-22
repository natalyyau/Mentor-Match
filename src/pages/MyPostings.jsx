import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import "./MyPostings.css";

const API_BASE = "http://127.0.0.1:8000/api";

function formatDate(isoStr) {
  if (!isoStr) return "";
  return new Date(isoStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function MyPostings() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const userID = localStorage.getItem("userID");

  const refresh = useCallback(() => {
    const fetchPostings = async () => {
      try {
        const res = await fetch(`${API_BASE}/my-postings/?userID=${userID}`);
        const data = await res.json();
        setProjects(Array.isArray(data.postings) ? data.postings : []);
      } catch (err) {
        setProjects([]);
      }
    };
    if (userID) fetchPostings();
  }, [userID]);

  useEffect(() => { refresh(); }, [refresh]);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    try {
      await fetch(`${API_BASE}/opportunities/delete/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userID, postingID: id }),
      });
      refresh();
    } catch (err) { console.error(err); }
  };

  const total = projects.length;

  return (
    <div className="dashboard-page my-projects-page">
      <h1 className="dashboard-title">My Projects</h1>
      <p className="dashboard-subtitle">Projects you have created for students</p>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-card-label">Total Projects</div>
          <div className="stat-card-value">{total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Active</div>
          <div className="stat-card-value">{total}</div>
        </div>
      </div>

      <div className="my-projects-list">
        {projects.length === 0 ? (
          <div className="my-projects-empty">
            <p>You have not created any projects yet.</p>
            <button className="btn" onClick={() => navigate("/faculty/create-posting")}>
              Create a project
            </button>
          </div>
        ) : (
          projects.map((project) => (
            <div key={project.id} className="my-project-card">
              <div className="my-project-header">
                <h2 className="card-title">{project.title}</h2>
                <div className="posting-dates">Created: {formatDate(project.createdAt)}</div>
                <span className="status-badge accepted">Active</span>
              </div>

              <p className="my-project-desc">
                {project.description.length > 250
                  ? `${project.description.slice(0, 250)}…`
                  : project.description}
              </p>

              <div className="my-project-skills">
                {(project.skills || []).map((s) => (
                  <span key={s} className="skill-tag">{s}</span>
                ))}
              </div>

              <div className="posting-actions-row">
                <button className="btn btn-outline btn-sm" onClick={() => navigate(`/faculty/create-posting?edit=${project.id}`)}>
                  Edit
                </button>
                <button className="btn btn-outline btn-sm" onClick={() => handleDelete(project.id, project.title)}>
                  Delete
                </button>
                <button className="btn btn-primary btn-sm" onClick={() => navigate(`/faculty/applications?projectId=${project.id}`)}>
                  View Applications
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default MyPostings;