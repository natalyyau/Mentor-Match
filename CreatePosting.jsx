import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "./Dashboard.css";
import "./CreatePosting.css";
import QuizBuilder from "./QuizBuilder";

const API_BASE = "http://127.0.0.1:8000/api";

const AVAILABLE_SKILLS = [
  "Python", "Java", "C++", "R", "Machine Learning", "Statistics",
  "Data Analysis", "Natural Language Processing", "Computer Vision",
  "Research Writing", "Linear Algebra", "Physics", "Biology", "Chemistry",
];

export default function CreatePosting() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const editId = searchParams.get("edit");
  const userID = localStorage.getItem("userID");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Assessment
  const [requireAssessment, setRequireAssessment] = useState(false);
  const [quizTitle, setQuizTitle] = useState("Qualification Quiz");
  const [questions, setQuestions] = useState([]);
  const [minScore, setMinScore] = useState("");

  useEffect(() => {
    if (!editId) return;
    const fetchExisting = async () => {
      try {
        const res = await fetch(`${API_BASE}/opportunities/${editId}/`);
        const data = await res.json();
        if (res.ok && data.opportunity) {
          setTitle(data.opportunity.title || "");
          setDescription(data.opportunity.description || "");
          setSelectedSkills(Array.isArray(data.opportunity.skills) ? data.opportunity.skills : []);
        }
        // Load existing assessment if any
        const aRes = await fetch(`${API_BASE}/assessment/${editId}/faculty/?userID=${userID}`);
        const aData = await aRes.json();
        if (aData.assessment) {
          setRequireAssessment(true);
          setQuizTitle(aData.assessment.title || "Qualification Quiz");
          setQuestions(aData.assessment.questions || []);
      }
      } catch {
        // keep form empty
      }
    };
    fetchExisting();
  }, [editId]);

  const toggleSkill = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
    setError("");
  };

  const validateQuiz = () => {
    if (!requireAssessment) return true;
    if (questions.length === 0) {
      setError("Add at least one question to the quiz.");
      return false;
    }
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        setError(`Question ${i + 1} is missing text.`);
        return false;
      }
      if (q.questionType === "mcq") {
        const filled = q.choices.filter((c) => c.choiceText.trim());
        if (filled.length < 2) {
          setError(`Question ${i + 1} needs at least 2 answer choices.`);
          return false;
        }
        if (!q.choices.some((c) => c.isCorrect)) {
          setError(`Question ${i + 1} needs a correct answer selected.`);
          return false;
        }
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!title.trim()) { setError("Please enter a project title."); return; }
    if (!description.trim()) { setError("Please enter a description."); return; }
    if (selectedSkills.length === 0) { setError("Select at least one required skill."); return; }
    if (!userID) { setError("Please log in as faculty."); return; }
    if (!validateQuiz()) return;

    const payload = {
      userID: parseInt(userID, 10),
      title: title.trim(),
      description: description.trim(),
      skills: selectedSkills,
      ...(requireAssessment && minScore !== "" ? { minAssessmentScore: Number.parseInt(minScore, 10) } : {}),
      ...(editId ? { postingID: parseInt(editId, 10) } : {}),
    };

    try {
      // 1. Save the posting
      const res = await fetch(`${API_BASE}/opportunities/create/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to save opportunity."); return; }

      const postingID = data.opportunity?.id;

      // 2. Save assessment if required
      if (requireAssessment && postingID) {
        const aRes = await fetch(`${API_BASE}/assessment/create/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userID: parseInt(userID, 10),
            postingID,
            title: quizTitle.trim() || "Qualification Quiz",
            questions,
          }),
        });
        const aData = await aRes.json();
        if (!aRes.ok) { setError(aData.error || "Posting saved but quiz failed."); return; }
      }

      setSuccess(editId ? "Project updated successfully." : "Project created successfully.");
      navigate("/faculty/my-postings");
    } catch {
      setError("Unable to connect. Please try again later.");
    }
  };

  return (
    <div className="dashboard-page create-posting-page create-project-page">
      <h1 className="dashboard-title">{editId ? "Edit Project" : "Create Project"}</h1>
      <p className="dashboard-subtitle">
        {editId ? "Update your research opportunity" : "Add a new research opportunity for students"}
      </p>

      <form className="create-project-form" onSubmit={handleSubmit}>
        <div className="form-section">

          <div className="input-group">
            <label htmlFor="project-title">Title</label>
            <input
              id="project-title"
              type="text"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setError(""); }}
              placeholder="e.g. Machine Learning Research Assistant"
              maxLength={200}
            />
          </div>

          <div className="input-group">
            <label htmlFor="project-description">Description</label>
            <textarea
              id="project-description"
              value={description}
              onChange={(e) => { setDescription(e.target.value); setError(""); }}
              placeholder="Describe the project, responsibilities, and expectations."
              rows={8}
            />
          </div>

          <fieldset className="input-group skills-field">
            <legend>Required skills</legend>
            <p className="skills-hint">Select all skills students should have.</p>
            <div className="skill-select-grid">
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
          </fieldset>

          {/* ── Assessment toggle ── */}
          <div className="input-group assessment-toggle-group">
            <label className="assessment-toggle-label">
              <input
                type="checkbox"
                checked={requireAssessment}
                onChange={(e) => {
                  setRequireAssessment(e.target.checked);
                  if (e.target.checked && questions.length === 0) {
                    setQuestions([{
                      questionText: "",
                      questionType: "mcq",
                      points: 1,
                      correctAnswer: "",
                      choices: [
                        { choiceText: "", isCorrect: false },
                        { choiceText: "", isCorrect: false },
                        { choiceText: "", isCorrect: false },
                        { choiceText: "", isCorrect: false },
                      ],
                    }]);
                  }
                }}
              />
              Require students to complete a quiz before their application is reviewed
            </label>
          </div>

          {requireAssessment && (
            <div className="quiz-section">
              <div className="input-group">
                <label>Quiz title</label>
                <input
                  type="text"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  placeholder="e.g. Qualification Quiz"
                  maxLength={200}
                />
              </div>
            <div className="input-group">
              <label>Minimum passing score (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                step={1}
                value={minScore}
                onChange={(e) => setMinScore(e.target.value)}
                placeholder="e.g. 70"
              />
            </div>
              <QuizBuilder questions={questions} onChange={setQuestions} />
            </div>
          )}

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