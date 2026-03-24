import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  addFacultyProject,
  updateFacultyProject,
  getFacultyProjectById,
} from "../utils/facultyProjectsStorage";
import "./Dashboard.css";
import "./CreatePosting.css";

const AVAILABLE_SKILLS = [
  "Python",
  "Java",
  "C++",
  "R",
  "Machine Learning",
  "Statistics",
  "Data Analysis",
  "Natural Language Processing",
  "Computer Vision",
  "Research Writing",
  "Linear Algebra",
  "Physics",
  "Biology",
  "Chemistry",
];

function CreatePosting() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const editId = searchParams.get("edit");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!editId) return;
    const existing = getFacultyProjectById(editId);
    if (existing) {
      setTitle(existing.title);
      setDescription(existing.description);
      setSelectedSkills(existing.skills || []);
    }
  }, [editId]);

  const toggleSkill = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!title.trim()) {
      setError("Please enter a project title.");
      return;
    }
    if (!description.trim()) {
      setError("Please enter a description.");
      return;
    }
    if (selectedSkills.length === 0) {
      setError("Select at least one required skill.");
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      skills: selectedSkills,
    };

    if (editId && getFacultyProjectById(editId)) {
      updateFacultyProject(editId, payload);
      setSuccess("Project updated successfully.");
      setSearchParams({});
    } else {
      addFacultyProject(payload);
      setSuccess("Project created successfully.");
      setTitle("");
      setDescription("");
      setSelectedSkills([]);
    }
  };

  return (
    <div className="dashboard-page create-posting-page create-project-page">
      <h1 className="dashboard-title">
        {editId ? "Edit Project" : "Create Project"}
      </h1>
      <p className="dashboard-subtitle">
        {editId
          ? "Update your research opportunity"
          : "Add a new research opportunity for students"}
      </p>

      <form className="create-project-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <div className="input-group">
            <label htmlFor="project-title">Title</label>
            <input
              id="project-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError("");
              }}
              placeholder="e.g. Machine Learning Research Assistant"
              maxLength={200}
            />
          </div>

          <div className="input-group">
            <label htmlFor="project-description">Description</label>
            <textarea
              id="project-description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setError("");
              }}
              placeholder="Describe the project, responsibilities, and expectations for students."
              rows={8}
            />
          </div>

          <div className="input-group skills-field">
            <label>Required skills</label>
            <p className="skills-hint">Select all skills students should have.</p>
            <div className="skill-select-grid" role="group" aria-label="Required skills">
              {AVAILABLE_SKILLS.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  className={`skill-chip ${selectedSkills.includes(skill) ? "selected" : ""}`}
                  onClick={() => toggleSkill(skill)}
                  aria-pressed={selectedSkills.includes(skill)}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="create-project-error">{error}</p>}
          {success && <p className="create-project-success">{success}</p>}

          <div className="form-actions create-project-actions">
            <button type="submit" className="btn">
              {editId ? "Save changes" : "Submit"}
            </button>
            {editId && (
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => navigate("/faculty/my-postings")}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

export default CreatePosting;
