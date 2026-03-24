import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MOCK_PROJECTS } from "../data/mockProjects";
import "./Dashboard.css";
import "./BrowseOpportunities.css";

const CATEGORIES = [
  "Physics", "Chemistry", "Biology", "Python", "Machine Learning",
  "Statistics", "C++", "Computer Science", "8 Week", "12 Week",
];

function BrowseOpportunities() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [durationFilter, setDurationFilter] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);

  const filteredProjects = MOCK_PROJECTS.filter((p) => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.department.toLowerCase().includes(search.toLowerCase());
    const matchDept = !deptFilter || p.department.toLowerCase().includes(deptFilter);
    const matchSkill = !skillFilter || p.skills.some(s => s.toLowerCase().includes(skillFilter));
    const matchDuration = !durationFilter || p.duration.toLowerCase().includes(durationFilter);
    const matchCategory = !selectedCategory || p.skills.includes(selectedCategory) ||
      p.department.includes(selectedCategory);
    return matchSearch && matchDept && matchSkill && matchDuration && matchCategory;
  });

  return (
    <div className="dashboard-page browse-page browse-projects">
      <h1 className="dashboard-title">Browse Projects</h1>
      <p className="dashboard-subtitle">Discover research opportunities</p>

      {/* Above: Search & Filters */}
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
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">Department</option>
              <option value="computer science">Computer Science</option>
              <option value="physics">Physics</option>
              <option value="biology">Biology</option>
              <option value="chemistry">Chemistry</option>
            </select>
            <select
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">Required Skill</option>
              <option value="python">Python</option>
              <option value="machine learning">Machine Learning</option>
              <option value="statistics">Statistics</option>
              <option value="c++">C++</option>
              <option value="physics">Physics</option>
            </select>
            <select
              value={durationFilter}
              onChange={(e) => setDurationFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">Duration</option>
              <option value="8 week">8 Week</option>
              <option value="12 week">12 Week</option>
              <option value="semester">Semester</option>
            </select>
          </div>
        </div>

        <div className="category-tags">
          {CATEGORIES.map((cat) => (
            <span
              key={cat}
              className={`category-tag ${selectedCategory === cat ? "active" : ""}`}
              onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
            >
              {cat}
            </span>
          ))}
        </div>

        <div className="results-count">
          {filteredProjects.length} project{filteredProjects.length !== 1 ? "s" : ""} found
        </div>
      </div>

      {/* Card layout: List of projects */}
      <div className="projects-grid">
        {filteredProjects.map((project) => (
          <div key={project.id} className="project-card">
            <div className="project-card-body">
              <h3 className="project-card-title">{project.title}</h3>
              <div className="project-card-meta">
                {project.faculty} · {project.department}
              </div>
              <div className="project-card-skills">
                {project.skills.map((s) => (
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
