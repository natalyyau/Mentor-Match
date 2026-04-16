import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "./Dashboard.css";
import "./FacultyApplications.css";

const API_BASE = "http://127.0.0.1:8000/api";

const STATUS_STYLES = {
  New: "status-new",
  "Under Review": "status-review",
  Shortlisted: "status-shortlisted",
  Accepted: "status-accepted",
  Rejected: "status-rejected",
};

const STATUS_OPTIONS = ["New", "Under Review", "Shortlisted", "Accepted", "Rejected"];

function FacultyApplications() {
  const [searchParams, setSearchParams] = useSearchParams();
  const projectId = searchParams.get("projectId");
  const userID = localStorage.getItem("userID");

  const [profileModal, setProfileModal] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [facultyPostings, setFacultyPostings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");
  const [gradingDraft, setGradingDraft] = useState({});

  useEffect(() => {
    const fetchPostings = async () => {
      if (!userID) return;
      try {
        const res = await fetch(`${API_BASE}/my-postings/?userID=${userID}`);
        const data = await res.json();
        setFacultyPostings(Array.isArray(data.postings) ? data.postings : []);
      } catch {
        setFacultyPostings([]);
      }
    };

    fetchPostings();
  }, [userID]);

  useEffect(() => {
    const fetchApplicants = async () => {
      if (!userID) {
        setApplicants([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const url = projectId
          ? `${API_BASE}/faculty-applications/?userID=${userID}&projectId=${projectId}`
          : `${API_BASE}/faculty-applications/?userID=${userID}`;

        const res = await fetch(url);
        const data = await res.json();
        setApplicants(Array.isArray(data.applications) ? data.applications : []);
      } catch {
        setApplicants([]);
      } finally {
        setLoading(false);
      }
    };

    fetchApplicants();
  }, [userID, projectId]);

  const project = facultyPostings.find((p) => String(p.id) === String(projectId)) || null;

  const handleStatusChange = async (applicationId, nextStatus) => {
    setStatusMessage("");

    try {
      const res = await fetch(`${API_BASE}/faculty-applications/status/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userID: parseInt(userID, 10),
          applicationId,
          status: nextStatus,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatusMessage(data.error || "Could not update status.");
        return;
      }

      setApplicants((prev) =>
        prev.map((app) =>
          app.applicationId === applicationId ? { ...app, status: nextStatus } : app
        )
      );
      setStatusMessage("Application status updated.");
    } catch {
      setStatusMessage("Could not update status.");
    }
  };

  const renderAssessment = (assessment) => {
    if (!assessment) return "—";
    if (assessment.gradingStatus === "pending") {
      return <span className="assessment-score-badge pending">Pending review</span>;
    }
    if (assessment.score === null || assessment.score === undefined) return "—";

    const score = Number(assessment.score);
    const { passed } = assessment;

    return (
      <span
        className={`assessment-score-badge ${
          passed === true ? "pass" : passed === false ? "fail" : ""
        }`}
      >
        {score.toFixed(1)}%
      </span>
    );
  };

  const openProfileModal = (app) => {
    const initialDraft = {};
    const answers = app.assessment?.answers || [];

    answers.forEach((answer) => {
      if (answer.questionType === "short") {
        initialDraft[answer.answerID] = {
          awardedPoints:
            answer.awardedPoints === null || answer.awardedPoints === undefined
              ? ""
              : String(answer.awardedPoints),
          instructorFeedback: answer.instructorFeedback || "",
        };
      }
    });

    setGradingDraft(initialDraft);
    setProfileModal(app);
  };

  const updateGradeDraft = (answerID, field, value) => {
    setGradingDraft((prev) => ({
      ...prev,
      [answerID]: {
        ...(prev[answerID] || {}),
        [field]: value,
      },
    }));
  };

  const submitGrades = async () => {
    if (!profileModal?.assessment?.attemptID) return;

    const answersPayload = (profileModal.assessment.answers || [])
      .filter((answer) => answer.questionType === "short")
      .map((answer) => ({
        answerID: answer.answerID,
        awardedPoints: gradingDraft[answer.answerID]?.awardedPoints ?? "",
        instructorFeedback: gradingDraft[answer.answerID]?.instructorFeedback ?? "",
      }));

    try {
      const res = await fetch(`${API_BASE}/assessment/grade/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userID: parseInt(userID, 10),
          attemptID: profileModal.assessment.attemptID,
          answers: answersPayload,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setStatusMessage(data.error || "Could not save grades.");
        return;
      }

      const updatedAttempt = data.attempt;

      setApplicants((prev) =>
        prev.map((app) =>
          app.applicationId === profileModal.applicationId
            ? { ...app, assessment: updatedAttempt }
            : app
        )
      );

      setProfileModal((prev) => prev ? { ...prev, assessment: updatedAttempt } : prev);
      setStatusMessage("Grades saved successfully.");
    } catch {
      setStatusMessage("Could not save grades.");
    }
  };

  const statusCounts = useMemo(
    () =>
      applicants.reduce((acc, a) => {
        acc[a.status] = (acc[a.status] || 0) + 1;
        return acc;
      }, {}),
    [applicants]
  );

  const stats = [
    { label: "Total Applicants", value: String(applicants.length) },
    { label: "New", value: String(statusCounts.New || 0) },
    { label: "Under Review", value: String(statusCounts["Under Review"] || 0) },
    { label: "Shortlisted", value: String(statusCounts.Shortlisted || 0) },
    { label: "Accepted", value: String(statusCounts.Accepted || 0) },
    { label: "Rejected", value: String(statusCounts.Rejected || 0) },
  ];

  return (
    <div className="dashboard-page faculty-applicants-page">
      <h1 className="dashboard-title">Applicant List</h1>
      <p className="dashboard-subtitle">
        Students who applied to your projects — review skills, application details, and assessments
      </p>

      {project && (
        <div className="faculty-app-project-banner">
          Filtering by project: <strong>{project.title}</strong>
        </div>
      )}

      {statusMessage && <div className="faculty-app-project-banner">{statusMessage}</div>}

      <div className="stats-row faculty-app-stats">
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="stat-card-label">{s.label}</div>
            <div className="stat-card-value">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="faculty-app-toolbar">
        <select className="filter-select" value={projectId || ""} onChange={(e) => {
          const next = e.target.value;
          setSearchParams(next ? { projectId: next } : {});
        }}>
          <option value="">All projects</option>
          {facultyPostings.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>

        <span className="sort-label">Sort: Most recent</span>
      </div>

      {loading && <div className="applicants-empty">Loading...</div>}

      {!loading && applicants.length === 0 && (
        <div className="applicants-empty">No applicants for this project yet.</div>
      )}

      {!loading && applicants.length > 0 && (
        <div className="applications-table-wrapper">
          <table className="applications-table applicants-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Project</th>
                <th>Skills</th>
                <th>Application Status</th>
                <th>Assessment</th>
                <th>GPA</th>
                <th>Applied</th>
                <th>Prereq Check</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {applicants.map((app) => (
                <tr key={app.id}>
                  <td>
                    <div className="student-cell">
                      <span className="student-name">{app.student}</span>
                      <span className="student-email">{app.email}</span>
                    </div>
                  </td>

                  <td>
                    <div className="position-cell">{app.position}</div>
                  </td>

                  <td>
                    <div className="skills-preview">
                      {(Array.isArray(app.skills) ? app.skills : []).slice(0, 2).map((s) => (
                        <span key={s} className="skill-pill">
                          {s}
                        </span>
                      ))}
                      {(Array.isArray(app.skills) ? app.skills : []).length > 2 && <span className="skills-more">+{(Array.isArray(app.skills) ? app.skills : []).length - 2}</span>}
                    </div>
                  </td>

                  <td>
                    <select
                      value={app.status}
                      className={`filter-select ${STATUS_STYLES[app.status] || "status-review"}`}
                      onChange={(e) => handleStatusChange(app.applicationId, e.target.value)}
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td>{renderAssessment(app.assessment)}</td>
                  <td>{app.gpa ?? "—"}</td>
                  <td>{app.appliedDate}</td>
                  <td>{app.prerequisitesVerified ? "Passed" : "Failed"}</td>

                  <td>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => openProfileModal(app)}
                    >
                      View profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {profileModal && (
        <div className="skills-modal-overlay" aria-labelledby="skills-modal-title">
          <section className="skills-modal wide">
            <h2 id="skills-modal-title" className="skills-modal-title">
              {profileModal.student}
            </h2>

            <p className="skills-modal-meta">{profileModal.position}</p>
            <p><strong>Email:</strong> {profileModal.email}</p>
            <p><strong>Statement of interest:</strong> {profileModal.statementOfInterest || "—"}</p>
            <p><strong>Prerequisites verified:</strong> {profileModal.prerequisitesVerified ? "Yes" : "No"}</p>

            <h3 className="modal-section-title">Skills</h3>
            <ul className="skills-modal-list">
              {(Array.isArray(profileModal.skills) ? profileModal.skills : []).map((skill) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>

            {profileModal.assessment && (
              <>
                <h3 className="modal-section-title">Assessment</h3>
                <p>
                  <strong>Status:</strong>{" "}
                  {profileModal.assessment.gradingStatus === "pending" ? "Pending review" : "Graded"}
                </p>
                <p>
                  <strong>Score:</strong>{" "}
                  {profileModal.assessment.score === null || profileModal.assessment.score === undefined
                    ? "Pending"
                    : `${Number(profileModal.assessment.score).toFixed(1)}%`}
                </p>

                <div className="assessment-review-list">
                  {(profileModal.assessment.answers || []).map((answer) => (
                    <div key={answer.answerID} className="assessment-review-card">
                      <p className="assessment-review-question">
                        {answer.questionText}
                      </p>

                      {answer.questionType === "mcq" ? (
                        <p>
                          <strong>Selected answer:</strong> {answer.selectedChoiceText || "No response"}
                        </p>
                      ) : (
                        <>
                          <p>
                            <strong>Student response:</strong> {answer.textAnswer || "No response"}
                          </p>

                          <div className="manual-grade-row">
                            <div className="manual-grade-field">
                              <label>Points (max {answer.maxPoints})</label>
                              <input
                                type="number"
                                min="0"
                                max={answer.maxPoints}
                                step="0.5"
                                value={gradingDraft[answer.answerID]?.awardedPoints ?? ""}
                                onChange={(e) =>
                                  updateGradeDraft(answer.answerID, "awardedPoints", e.target.value)
                                }
                              />
                            </div>

                            <div className="manual-grade-field">
                              <label>Feedback</label>
                              <textarea
                                rows={2}
                                value={gradingDraft[answer.answerID]?.instructorFeedback ?? ""}
                                onChange={(e) =>
                                  updateGradeDraft(answer.answerID, "instructorFeedback", e.target.value)
                                }
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>

                {(profileModal.assessment.answers || []).some((a) => a.questionType === "short") && (
                  <button type="button" className="btn" onClick={submitGrades}>
                    Save grades
                  </button>
                )}
              </>
            )}

            <button
              type="button"
              className="btn skills-modal-close"
              onClick={() => setProfileModal(null)}
            >
              Close
            </button>
          </section>
        </div>
      )}
    </div>
  );
}

export default FacultyApplications;
