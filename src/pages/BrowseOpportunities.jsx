import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import "./BrowseOpportunities.css";

const API_BASE = "http://127.0.0.1:8000/api";

const CATEGORIES = [
  "Physics", "Chemistry", "Biology", "Python", "Machine Learning",
  "Statistics", "C++", "Computer Science", "8 Week", "12 Week",
];

function BrowseOpportunities() {
  const navigate = useNavigate();
  const userID = localStorage.getItem("userID");
  const [opportunities, setOpportunities] = useState([]);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [durationFilter, setDurationFilter] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        const params = new URLSearchParams();
        if (userID) params.set("userID", userID);
        const res = await fetch(`${API_BASE}/opportunities/?${params.toString()}`);
        const data = await res.json();
        setOpportunities(Array.isArray(data.opportunities) ? data.opportunities : []);
      } catch {
        setOpportunities([]);
      }
    };

    fetchOpportunities();
  }, [userID]);

  const filteredProjects = useMemo(() => opportunities.filter((p) => {
    const title = String(p.title || "");
    const dept = String(p.department || "");
    const duration = String(p.duration || "");
    const skills = Array.isArray(p.skills) ? p.skills : [];

    const matchSearch = !search || title.toLowerCase().includes(search.toLowerCase()) || dept.toLowerCase().includes(search.toLowerCase());
    const matchDept = !deptFilter || dept.toLowerCase().includes(deptFilter.toLowerCase());
    const matchSkill = !skillFilter || skills.some((s) => String(s).toLowerCase().includes(skillFilter.toLowerCase()));
    const matchDuration = !durationFilter || duration.toLowerCase().includes(durationFilter.toLowerCase());
    const matchCategory = !selectedCategory || skills.includes(selectedCategory) || dept.toLowerCase().includes(selectedCategory.toLowerCase()) || duration.toLowerCase().includes(String(selectedCategory).toLowerCase());

    return matchSearch && matchDept && matchSkill && matchDuration && matchCategory;
  }), [opportunities, search, deptFilter, skillFilter, durationFilter, selectedCategory]);

  return (
    <div className="dashboard-page browse-page browse-projects">
      <h1 className="dashboard-title">Browse Projects</h1>
      <p className="dashboard-subtitle">Discover research opportunities ranked by relevance to your field</p>

      <div className="browse-above">
        <div className="filter-bar">
          <div className="filter-search">
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="filter-input"
            />
          </div>
          <div className="filter-group">
            <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className="filter-select">
              <option value="">Department</option>
              <option value="computer science">Computer Science</option>
              <option value="physics">Physics</option>
              <option value="biology">Biology</option>
              <option value="chemistry">Chemistry</option>
            </select>
            <select value={skillFilter} onChange={(e) => setSkillFilter(e.target.value)} className="filter-select">
              <option value="">Required Skill</option>
              <option value="python">Python</option>
              <option value="machine learning">Machine Learning</option>
              <option value="statistics">Statistics</option>
              <option value="c++">C++</option>
              <option value="physics">Physics</option>
            </select>
            <select value={durationFilter} onChange={(e) => setDurationFilter(e.target.value)} className="filter-select">
              <option value="">Duration</option>
              <option value="8 week">8 Week</option>
              <option value="12 week">12 Week</option>
              <option value="semester">Semester</option>
            </select>
          </div>
        </div>

        <div className="category-tags">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                className={`category-tag ${isActive ? "active" : ""}`}
                onClick={() => setSelectedCategory(isActive ? null : cat)}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <div className="results-count">
          {filteredProjects.length} project{filteredProjects.length === 1 ? "" : "s"} found
        </div>
      </div>

      <div className="projects-grid">
        {filteredProjects.map((project, index) => (
          <div key={project.id} className="project-card">
            <div className="project-card-body">
              <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center" }}>
                <h3 className="project-card-title">{project.title}</h3>
                {userID && index < 3 && <span className="skill-tag">Top Match</span>}
              </div>
              <div className="project-card-meta">
                {project.faculty} · {project.department}
              </div>
              <div className="project-card-skills">
                {(Array.isArray(project.skills) ? project.skills : []).map((s) => (
                  <span key={s} className="skill-tag">{s}</span>
                ))}
              </div>
              <p className="project-card-desc">{project.desc}</p>
              <div className="project-card-duration">{project.duration}</div>
            </div>
            <div className="project-card-footer">
              <button className="btn project-view-btn" onClick={() => navigate(`/student/project/${project.id}`)}>
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BrowseOpportunities;
