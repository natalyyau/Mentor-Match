// TakeAssessment.jsx — add route: /assessment/:postingId
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Dashboard.css";
import "./TakeAssessment.css";

const API_BASE = "http://127.0.0.1:8000/api";

export default function TakeAssessment() {
  const { postingId } = useParams();
  const navigate = useNavigate();
  const userID = localStorage.getItem("userID");

  const [assessment, setAssessment] = useState(null);
  const [answers, setAnswers] = useState({});     // { questionID: { selectedChoiceID | textAnswer } }
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);     // { score, passed, earnedPoints, totalPoints }
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      // Check if already attempted
      const aRes = await fetch(`${API_BASE}/assessment/attempt/?userID=${userID}&postingID=${postingId}`);
      const aData = await aRes.json();

      if (aData.attempt) {
        setResult(aData.attempt);
        setLoading(false);
        return;
      }

      // Load questions
      const res = await fetch(`${API_BASE}/assessment/${postingId}/`);
      const data = await res.json();
      setAssessment(data.assessment);
      setLoading(false);
    };
    if (userID && postingId) load();
  }, [userID, postingId]);

  const handleMCQ = (questionID, choiceID) => {
    setAnswers((prev) => ({ ...prev, [questionID]: { selectedChoiceID: choiceID } }));
  };

  const handleShort = (questionID, text) => {
    setAnswers((prev) => ({ ...prev, [questionID]: { textAnswer: text } }));
  };

  const handleSubmit = async () => {
    setError("");

    // Validate all answered
    const unanswered = assessment.questions.filter((q) => !answers[q.questionID]);
    if (unanswered.length > 0) {
      setError(`Please answer all questions. (${unanswered.length} remaining)`);
      return;
    }

    const payload = {
      userID: parseInt(userID, 10),
      assessmentID: assessment.assessmentID,
      answers: Object.entries(answers).map(([questionID, ans]) => ({
        questionID: parseInt(questionID, 10),
        ...ans,
      })),
    };

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/assessment/submit/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Submission failed."); return; }
      setResult(data);
    } catch {
      setError("Could not submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="dashboard-page"><p>Loading assessment...</p></div>;

  // Already completed — show score
  if (result) {
    const passed = result.passed;
    return (
      <div className="dashboard-page ta-result-page">
        <div className="ta-result-card">
          <div className={`ta-result-icon ${passed === true ? "pass" : passed === false ? "fail" : "neutral"}`}>
            {passed === true ? "✓" : passed === false ? "✗" : "✓"}
          </div>
          <h1 className="ta-result-title">Assessment Complete</h1>
          <div className="ta-score-display">
            <span className="ta-score-number">{typeof result.score === "number" ? result.score.toFixed(1) : result.score}%</span>
          </div>
          {passed === true && <p className="ta-result-msg pass-msg">You passed! The faculty will review your application.</p>}
          {passed === false && <p className="ta-result-msg fail-msg">You didn't meet the minimum score, but your application is still on record.</p>}
          {passed === null && <p className="ta-result-msg">Your responses have been recorded.</p>}
          <button className="btn" onClick={() => navigate("/student/applications")}>
            Back to my applications
          </button>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="dashboard-page">
        <p>No assessment found for this posting.</p>
        <button className="btn btn-outline" onClick={() => navigate(-1)}>Go back</button>
      </div>
    );
  }

  const totalPoints = assessment.questions.reduce((sum, q) => sum + q.points, 0);
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="dashboard-page take-assessment-page">
      <div className="ta-header">
        <h1 className="dashboard-title">{assessment.title}</h1>
        <p className="dashboard-subtitle">
          {assessment.questions.length} questions · {totalPoints} points total
        </p>
        <div className="ta-progress-bar">
          <div
            className="ta-progress-fill"
            style={{ width: `${(answeredCount / assessment.questions.length) * 100}%` }}
          />
        </div>
        <p className="ta-progress-label">{answeredCount} / {assessment.questions.length} answered</p>
      </div>

      <div className="ta-questions">
        {assessment.questions.map((q, idx) => (
          <div key={q.questionID} className={`ta-question-card ${answers[q.questionID] ? "answered" : ""}`}>
            <div className="ta-question-meta">
              <span className="ta-q-number">Q{idx + 1}</span>
              <span className="ta-q-points">{q.points} pt{q.points !== 1 ? "s" : ""}</span>
            </div>
            <p className="ta-question-text">{q.questionText}</p>

            {q.questionType === "mcq" && (
              <div className="ta-choices">
                {q.choices.map((c) => (
                  <label
                    key={c.choiceID}
                    className={`ta-choice ${answers[q.questionID]?.selectedChoiceID === c.choiceID ? "selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name={`q-${q.questionID}`}
                      value={c.choiceID}
                      checked={answers[q.questionID]?.selectedChoiceID === c.choiceID}
                      onChange={() => handleMCQ(q.questionID, c.choiceID)}
                    />
                    <span>{c.choiceText}</span>
                  </label>
                ))}
              </div>
            )}

            {q.questionType === "short" && (
              <textarea
                className="ta-short-input"
                rows={3}
                placeholder="Type your answer here..."
                value={answers[q.questionID]?.textAnswer || ""}
                onChange={(e) => handleShort(q.questionID, e.target.value)}
              />
            )}
          </div>
        ))}
      </div>

      {error && <p className="create-project-error">{error}</p>}

      <div className="ta-submit-row">
        <button
          className="btn btn-outline"
          type="button"
          onClick={() => navigate(-1)}
        >
          Cancel
        </button>
        <button
          className="btn"
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? "Submitting..." : "Submit assessment"}
        </button>
      </div>
    </div>
  );
}
