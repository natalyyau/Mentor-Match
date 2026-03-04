import { useState } from "react";
import "./Dashboard.css";
import "./BrowseOpportunities.css";

const CATEGORIES = [
  "Physics", "Chemistry", "Biology", "Python", "Machine Learning",
  "Statistics", "C++", "8 Week", "Computer science",
];

const MOCK_OPPORTUNITIES = [
  {
    id: 1,
    title: "Machine Learning Research Assistant",
    faculty: "Dr. Sarah Smith",
    department: "Computer Science",
    skills: ["Python", "Statistics"],
    desc: "Assist with developing ML models for natural language processing.",
  },
];

function BrowseOpportunities() {
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [durationFilter, setDurationFilter] = useState("");

  return (
    <div className="dashboard-page browse-page">
      <h1 className="dashboard-title">Browse Opportunities</h1>

      <div className="filter-bar">
        <div className="filter-search">
          <input
            type="text"
            placeholder="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="filter-input"
          />
        </div>
        <div className="filter-group">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">Department</option>
            <option value="cs">Computer Science</option>
            <option value="physics">Physics</option>
            <option value="chem">Chemistry</option>
          </select>
          <select
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">Required Skill</option>
            <option value="python">Python</option>
            <option value="ml">Machine Learning</option>
            <option value="stats">Statistics</option>
          </select>
          <select
            value={durationFilter}
            onChange={(e) => setDurationFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">Duration</option>
            <option value="8">8 Week</option>
            <option value="12">12 Week</option>
            <option value="semester">Semester</option>
          </select>
        </div>
      </div>

      <div className="category-tags">
        {CATEGORIES.map((cat) => (
          <span key={cat} className="category-tag">{cat}</span>
        ))}
      </div>

      <div className="results-count">
        {MOCK_OPPORTUNITIES.length} opportunity found
      </div>

      <div className="opportunities-list">
        {MOCK_OPPORTUNITIES.map((opp) => (
          <div key={opp.id} className="opportunity-card browse-card">
            <div className="card-title">{opp.title}</div>
            <div className="card-meta">
              {opp.faculty} · {opp.department}
            </div>
            <div className="card-skills">
              {opp.skills.map((s) => (
                <span key={s} className="skill-tag">{s}</span>
              ))}
              <span className="skill-label">Skills Required</span>
            </div>
            <div className="card-desc">{opp.desc}</div>
            <div className="card-footer">
              <span></span>
              <button className="btn">View Detail</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BrowseOpportunities;
