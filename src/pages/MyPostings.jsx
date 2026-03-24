import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getFacultyProjects,
  deleteFacultyProject,
} from "../utils/facultyProjectsStorage";
import "./Dashboard.css";
import "./MyPostings.css";

function formatDate(isoStr) {
  if (!isoStr) return "";
  return new Date(isoStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function MyPostings() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);

  const refresh = useCallback(() => {
    setProjects(getFacultyProjects());
  }, []);

  useEffect(() => {
    refresh();
    const onStorage = (e) => {
      if (e.key === "facultyProjects" || e.key === null) refresh();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [refresh]);

  const handleDelete = (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    deleteFacultyProject(id);
    refresh();
  };

  const total = projects.length;
  const stats = [
    { label: "Total Projects", value: String(total) },
    { label: "Active", value: String(total) },
  ];

  return (
    <div className="dashboard-page my-projects-page">
      <h1 className="dashboard-title">My Projects</h1>
      <p className="dashboard-subtitle">
        Projects you have created for students
      </p>

      <div className="stats-row">
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="stat-card-label">{s.label}</div>
            <div className="stat-card-value">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="postings-list my-projects-list">
        {projects.length === 0 ? (
          <div className="my-projects-empty">
            <p>You have not created any projects yet.</p>
            <button
              type="button"
              className="btn"
              onClick={() => navigate("/faculty/create-posting")}
            >
              Create a project
            </button>
          </div>
        ) : (
          projects.map((project) => (
            <div key={project.id} className="posting-card my-project-card">
              <div className="my-project-header">
                <div>
                  <div className="card-title">{project.title}</div>
                  <div className="posting-dates">
                    Created: {formatDate(project.createdAt)}
                  </div>
                </div>
                <span className="status-badge accepted">Active</span>
              </div>
              <p className="my-project-desc">
                {project.description.length > 200
                  ? `${project.description.slice(0, 200)}…`
                  : project.description}
              </p>
              <div className="my-project-skills">
                {(project.skills || []).map((s) => (
                  <span key={s} className="skill-tag">
                    {s}
                  </span>
                ))}
              </div>
              <div className="posting-actions-row my-project-actions">
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() =>
                    navigate(`/faculty/create-posting?edit=${project.id}`)
                  }
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => handleDelete(project.id, project.title)}
                >
                  Delete
                </button>
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() =>
                    navigate(`/faculty/applications?projectId=${project.id}`)
                  }
                >
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
