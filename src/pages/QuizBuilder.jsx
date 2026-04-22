// QuizBuilder.jsx  — drop this in the same folder as CreatePosting.jsx
// Import and use inside CreatePosting when faculty toggles "Require Assessment"

import { useState } from "react";

const EMPTY_CHOICE = () => ({ choiceText: "", isCorrect: false });
const EMPTY_QUESTION = () => ({
  questionText: "",
  questionType: "mcq",
  points: 1,
  correctAnswer: "",
  choices: [EMPTY_CHOICE(), EMPTY_CHOICE(), EMPTY_CHOICE(), EMPTY_CHOICE()],
});

export default function QuizBuilder({ questions, onChange }) {
  const addQuestion = () => onChange([...questions, EMPTY_QUESTION()]);

  const removeQuestion = (qi) =>
    onChange(questions.filter((_, i) => i !== qi));

  const updateQuestion = (qi, field, value) => {
    const updated = questions.map((q, i) =>
      i === qi ? { ...q, [field]: value } : q
    );
    onChange(updated);
  };

  const updateChoice = (qi, ci, field, value) => {
    const updated = questions.map((q, i) => {
      if (i !== qi) return q;
      const choices = q.choices.map((c, j) => {
        if (j !== ci) return field === "isCorrect" ? { ...c, isCorrect: false } : c;
        return { ...c, [field]: value };
      });
      return { ...q, choices };
    });
    onChange(updated);
  };

  const addChoice = (qi) => {
    const updated = questions.map((q, i) =>
      i === qi ? { ...q, choices: [...q.choices, EMPTY_CHOICE()] } : q
    );
    onChange(updated);
  };

  const removeChoice = (qi, ci) => {
    const updated = questions.map((q, i) =>
      i === qi
        ? { ...q, choices: q.choices.filter((_, j) => j !== ci) }
        : q
    );
    onChange(updated);
  };

  return (
    <div className="quiz-builder">
      <h3 className="quiz-builder-heading">Quiz Questions</h3>

      {questions.map((q, qi) => (
        <div key={qi} className="quiz-question-card">
          <div className="quiz-question-header">
            <span className="quiz-question-number">Q{qi + 1}</span>
            <button
              type="button"
              className="btn btn-outline btn-sm quiz-remove-btn"
              onClick={() => removeQuestion(qi)}
            >
              Remove
            </button>
          </div>

          {/* Question text */}
          <div className="input-group">
            <label>Question</label>
            <textarea
              rows={2}
              placeholder="Enter your question..."
              value={q.questionText}
              onChange={(e) => updateQuestion(qi, "questionText", e.target.value)}
            />
          </div>

          {/* Type + Points */}
          <div className="quiz-meta-row">
            <div className="input-group">
              <label>Type</label>
              <select
                value={q.questionType}
                onChange={(e) => updateQuestion(qi, "questionType", e.target.value)}
              >
                <option value="mcq">Multiple Choice</option>
                <option value="short">Short Answer</option>
              </select>
            </div>
            <div className="input-group">
              <label>Points</label>
              <input
                type="number"
                min={1}
                max={100}
                value={q.points}
                onChange={(e) => updateQuestion(qi, "points", parseInt(e.target.value) || 1)}
              />
            </div>
          </div>

          {/* MCQ choices */}
          {q.questionType === "mcq" && (
            <div className="quiz-choices">
              <label>Answer choices — mark the correct one</label>
              {q.choices.map((c, ci) => (
                <div key={ci} className="quiz-choice-row">
                  <input
                    type="radio"
                    name={`correct-${qi}`}
                    checked={c.isCorrect}
                    onChange={() => updateChoice(qi, ci, "isCorrect", true)}
                    title="Mark as correct"
                  />
                  <input
                    type="text"
                    placeholder={`Choice ${ci + 1}`}
                    value={c.choiceText}
                    onChange={(e) => updateChoice(qi, ci, "choiceText", e.target.value)}
                    className="quiz-choice-input"
                  />
                  {q.choices.length > 2 && (
                    <button
                      type="button"
                      className="quiz-remove-choice"
                      onClick={() => removeChoice(qi, ci)}
                      title="Remove choice"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              {q.choices.length < 6 && (
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => addChoice(qi)}
                >
                  + Add choice
                </button>
              )}
            </div>
          )}

          {/* Short answer */}
          {q.questionType === "short" && (
            <div className="input-group">
              <label>Expected answer (optional — used for auto-grading)</label>
              <input
                type="text"
                placeholder="Leave blank if manually reviewed"
                value={q.correctAnswer}
                onChange={(e) => updateQuestion(qi, "correctAnswer", e.target.value)}
              />
            </div>
          )}
        </div>
      ))}

      <button
        type="button"
        className="btn btn-outline"
        onClick={addQuestion}
      >
        + Add question
      </button>
    </div>
  );
}
