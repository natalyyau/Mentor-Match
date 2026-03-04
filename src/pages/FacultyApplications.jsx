import "./Dashboard.css";
import "./FacultyApplications.css";

const STATS = [
  { label: "Total Application", value: "7" },
  { label: "New", value: "2" },
  { label: "Under Review", value: "3" },
  { label: "Shortlisted", value: "1" },
  { label: "Accepted", value: "0" },
  { label: "Rejected", value: "1" },
];

const MOCK_APPLICATIONS = [
  {
    id: 1,
    student: "Tim Drake",
    position: "Machine Learning Research Assistant",
    assessment: 100,
    gpa: 4.0,
    appliedDate: "4/27/2025",
    status: "New",
    statusClass: "pending",
  },
  {
    id: 2,
    student: "Percy Jackson",
    position: "Machine Learning Research Assistant",
    assessment: 67,
    gpa: 3.2,
    appliedDate: "4/27/2025",
    status: "Review",
    statusClass: "review",
  },
];

function FacultyApplications() {
  return (
    <div className="dashboard-page">
      <h1 className="dashboard-title">All Applications</h1>
      <p className="dashboard-subtitle">
        Review and manage applications across all your postings
      </p>

      <div className="stats-row faculty-app-stats">
        {STATS.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="stat-card-label">{s.label}</div>
            <div className="stat-card-value">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="faculty-app-toolbar">
        <select className="filter-select">
          <option>All Posting</option>
        </select>
        <span className="sort-label">Sort: Most Recent</span>
      </div>

      <div className="applications-table-wrapper">
        <table className="applications-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Position</th>
              <th>Assessment</th>
              <th>GPA</th>
              <th>Applied Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_APPLICATIONS.map((app) => (
              <tr key={app.id}>
                <td>
                  <div className="student-cell">
                    <span className="student-name">{app.student}</span>
                  </div>
                </td>
                <td>
                  <div className="position-cell">{app.position}</div>
                </td>
                <td>{app.assessment}</td>
                <td>{app.gpa}</td>
                <td>{app.appliedDate}</td>
                <td>
                  <span className={`status-badge ${app.statusClass}`}>{app.status}</span>
                </td>
                <td>
                  <button className="btn btn-outline btn-sm">View Profile</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default FacultyApplications;
