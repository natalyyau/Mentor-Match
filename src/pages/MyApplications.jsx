import "./Dashboard.css";
import "./MyApplications.css";

const STAGES = [
  "Application Submitted",
  "Faculty Review",
  "Interview",
  "Final Decision",
];

const MOCK_APPLICATIONS = [
  {
    id: 1,
    faculty: "Dr. Sarah Smith",
    department: "Computer Science",
    position: "Machine Learning Research Assistant",
    appliedDate: "Feb 25, 2025",
    assessmentScore: 100,
    status: "Under Review",
    statusClass: "review",
  },
];

function MyApplications() {
  const stats = [
    { label: "Total Applications", value: "3" },
    { label: "Accepted", value: "1" },
    { label: "Under Review", value: "1" },
    { label: "Action Needed", value: "0" },
  ];

  return (
    <div className="dashboard-page">
      <h1 className="dashboard-title">My Application</h1>
      <p className="dashboard-subtitle">
        Track the status of your research opportunity application
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
        <div className="dashboard-section-header">Under Review</div>
        <div className="dashboard-section-body">
          {MOCK_APPLICATIONS.map((app) => (
            <div key={app.id} className="application-card app-card">
              <div className="app-card-header">
                <div>
                  <div className="card-title">{app.position}</div>
                  <div className="card-meta">
                    {app.faculty} · {app.department}
                  </div>
                </div>
                <div className="app-card-right">
                  <div className="assessment-badge">Assessment Score: {app.assessmentScore}</div>
                  <span className={`status-badge ${app.statusClass}`}>{app.status}</span>
                </div>
              </div>
              <div className="app-card-footer">
                <span>Applied: {app.appliedDate}</span>
                <span>{app.appliedDate}</span>
                <button className="btn btn-outline">View Detail</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MyApplications;
