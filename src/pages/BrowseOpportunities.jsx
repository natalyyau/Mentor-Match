import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import "./BrowseOpportunities.css";

const API_BASE = "http://127.0.0.1:8000/api";

const CATEGORIES = [
  "Physics", "Chemistry", "Biology", "Python", "Machine Learning",
  "Statistics", "C++", "Computer Science",
];

function BrowseOpportunities() {
  const navigate = useNavigate();
  const userID = localStorage.getItem("userID");
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true); // New loading state
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const fetchOpportunities = async () => {
      setLoading(true); // Start loading
      try {
        const params = new URLSearchParams();
        if (userID) params.set("userID", userID);
        const res = await fetch(`${API_BASE}/opportunities/?${params.toString()}`);
        const data = await res.json();
        setOpportunities(Array.isArray(data.opportunities) ? data.opportunities : []);
      } catch (error) {
        console.error("Error fetching opportunities:", error);
        setOpportunities([]);
      } finally {
        setLoading(false); // Stop loading regardless of success/fail
      }
    };

    fetchOpportunities();
  }, [userID]);

  const filteredProjects = useMemo(() => opportunities.filter((p) => {
    const title = String(p.title || "");
    const dept = String(p.department || "");
    const skills = Array.isArray(p.skills) ? p.skills : [];

    const matchSearch = !search || title.toLowerCase().includes(search.toLowerCase()) || dept.toLowerCase().includes(search.toLowerCase());
    const matchDept = !deptFilter || dept.toLowerCase().includes(deptFilter.toLowerCase());
    const matchSkill = !skillFilter || skills.some((s) => String(s).toLowerCase().includes(skillFilter.toLowerCase()));
    const matchCategory = !selectedCategory || skills.includes(selectedCategory) || dept.toLowerCase().includes(selectedCategory.toLowerCase());

    return matchSearch && matchDept && matchSkill && matchCategory;
  }), [opportunities, search, deptFilter, skillFilter, selectedCategory]);

  // Loading Screen Render
  if (loading) {
    return (
      <div className="dashboard-page browse-page loading-container">
        <div className="loader"></div>
        <p>Loading research opportunities...</p>
      </div>
    );
  }

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
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project) => (
            <div key={project.id} className="project-card">
              <div className="project-card-body">
                <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center" }}>
                  <h3 className="project-card-title">{project.title}</h3>
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
              </div>
              <div className="project-card-footer">
                <button className="btn project-view-btn" onClick={() => navigate(`/student/project/${project.id}`)}>
                  View Details
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">No projects match your criteria.</div>
        )}
      </div>
    </div>
  );
}

export default BrowseOpportunities;