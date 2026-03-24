import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getFacultyProjectById } from "../utils/facultyProjectsStorage";
import "./Dashboard.css";
import "./FacultyApplications.css";

const STATUS_STYLES = {
  New: "status-new",
  "Under Review": "status-review",
  Shortlisted: "status-shortlisted",
  Accepted: "status-accepted",
  Rejected: "status-rejected",
};

const MOCK_APPLICANTS = [
  {
    id: 1,
    student: "Tim Drake",
    email: "tdrake@university.edu",
    position: "Machine Learning Research Assistant",
    skills: ["Python", "Statistics", "TensorFlow", "Research Writing"],
    assessment: 100,
    gpa: 4.0,
    appliedDate: "Apr 27, 2025",
    status: "New",
  },
  {
    id: 2,
    student: "Percy Jackson",
    email: "pjackson@university.edu",
    position: "Machine Learning Research Assistant",
    skills: ["Python", "Data Analysis", "Linear Algebra"],
    assessment: 67,
    gpa: 3.2,
    appliedDate: "Apr 27, 2025",
    status: "Under Review",
  },
  {
    id: 3,
    student: "Annabeth Chase",
    email: "achase@university.edu",
    position: "Quantum Computing Simulation",
    skills: ["C++", "Physics", "Python", "Linear Algebra", "Research Writing"],
    assessment: 88,
    gpa: 3.85,
    appliedDate: "Apr 22, 2025",
    status: "Shortlisted",
  },
  {
    id: 4,
    student: "Grover Underwood",
    email: "gunderwood@university.edu",
    position: "Data Visualization for Genomics",
    skills: ["R", "Statistics", "Python"],
    assessment: 72,
    gpa: 3.5,
    appliedDate: "Apr 18, 2025",
    status: "Accepted",
  },
  {
    id: 5,
    student: "Nico di Angelo",
    email: "ndangelo@university.edu",
    position: "NLP for Clinical Notes",
    skills: ["Python", "Natural Language Processing"],
    assessment: 45,
    gpa: 3.0,
    appliedDate: "Apr 10, 2025",
    status: "Rejected",
  },
];

function FacultyApplications() {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectId");
  const project = projectId ? getFacultyProjectById(projectId) : null;

  const [skillsModal, setSkillsModal] = useState(null);

  const applicants = MOCK_APPLICANTS.filter((a) => {
    if (!project) return true;
    return a.position === project.title;
  });

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
      <p className="dashboard-subtitle">
        Students who applied to your projects — view skills and application status
      </p>

      {project && (
        <div className="faculty-app-project-banner">
          Filtering by project: <strong>{project.title}</strong>
        </div>
      )}

      <div className="stats-row faculty-app-stats">
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="stat-card-label">{s.label}</div>
            <div className="stat-card-value">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="faculty-app-toolbar">
        <select className="filter-select" defaultValue="">
          <option value="">All projects</option>
          {project && <option value={project.id}>{project.title}</option>}
        </select>
        <span className="sort-label">Sort: Most recent</span>
      </div>

      {applicants.length === 0 ? (
        <div className="applicants-empty">
          No applicants for this project yet.
        </div>
      ) : (
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
                  <td>
                    <div className="position-cell">{app.position}</div>
                  </td>
                  <td>
                    <div className="skills-preview">
                      {app.skills.slice(0, 2).map((s) => (
                        <span key={s} className="skill-pill">
                          {s}
                        </span>
                      ))}
                      {app.skills.length > 2 && (
                        <span className="skills-more">+{app.skills.length - 2}</span>
                      )}
                    </div>
                    <button
                      type="button"
                      className="link-btn"
                      onClick={() => setSkillsModal(app)}
                    >
                      View skills
                    </button>
                  </td>
                  <td>
                    <span
                      className={`app-status-badge ${STATUS_STYLES[app.status] || "status-review"}`}
                    >
                      {app.status}
                    </span>
                  </td>
                  <td>{app.assessment}</td>
                  <td>{app.gpa}</td>
                  <td>{app.appliedDate}</td>
                  <td>
                    <button type="button" className="btn btn-outline btn-sm">
                      View profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {skillsModal && (
        <div
          className="skills-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="skills-modal-title"
          onClick={() => setSkillsModal(null)}
        >
          <div
            className="skills-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="skills-modal-title" className="skills-modal-title">
              {skillsModal.student}&apos;s skills
            </h2>
            <p className="skills-modal-meta">{skillsModal.position}</p>
            <ul className="skills-modal-list">
              {skillsModal.skills.map((skill) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
            <button
              type="button"
              className="btn skills-modal-close"
              onClick={() => setSkillsModal(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default FacultyApplications;
