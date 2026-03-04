import "./Dashboard.css";
import "./MyPostings.css";

const MOCK_POSTINGS = [
  {
    id: 1,
    title: "Machine Learning Research Assistant",
    status: "Active",
    postedDate: "Feb 20, 2025",
    deadline: "March 15, 2025",
    views: 127,
    applications: 7,
    positions: 2,
    filled: 0,
  },
];

function MyPostings() {
  const stats = [
    { label: "Total Posting", value: "1" },
    { label: "Active", value: "1" },
    { label: "Total Applications", value: "7" },
    { label: "Positions Filled", value: "0" },
  ];

  return (
    <div className="dashboard-page">
      <h1 className="dashboard-title">My Research Posting</h1>
      <p className="dashboard-subtitle">
        Manage all your research opportunity listings
      </p>

      <div className="stats-row">
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="stat-card-label">{s.label}</div>
            <div className="stat-card-value">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="postings-toolbar">
        <select className="filter-select">
          <option>All Status</option>
          <option>Active</option>
          <option>Closed</option>
        </select>
        <span className="sort-label">Sort: Most Recent</span>
      </div>

      <div className="postings-list">
        {MOCK_POSTINGS.map((post) => (
          <div key={post.id} className="posting-card my-posting-card">
            <div className="my-posting-header">
              <div>
                <div className="card-title">{post.title}</div>
                <div className="posting-dates">
                  Posted: {post.postedDate} · Deadline: {post.deadline} · {post.views} Views
                </div>
              </div>
              <span className={`status-badge ${post.status === "Active" ? "accepted" : ""}`}>
                {post.status}
              </span>
            </div>
            <div className="my-posting-stats">
              <span>Application: {post.applications}</span>
              <span>Position: {post.positions}</span>
              <span>Filled: {post.filled}</span>
              <span>Remaining: {post.positions - post.filled}</span>
            </div>
            <div className="posting-actions-row">
              <button className="btn btn-outline btn-sm">Close Posting</button>
              <button className="btn btn-outline btn-sm">Edit</button>
              <button className="btn btn-outline btn-sm">Preview</button>
              <button className="btn btn-sm">Review Application</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyPostings;
