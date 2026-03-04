import { useState } from "react";
import "./Dashboard.css";
import "./CreatePosting.css";

function CreatePosting() {
  const [formData, setFormData] = useState({
    positionTitle: "",
    department: "",
    compensation: "",
    compensationType: "",
    compensationDetail: "",
    researchArea: "",
    startDate: "",
    endDate: "",
    overview: "",
    detailedDescription: "",
    numPositions: "",
    requiredSkills: "",
    minGpa: "",
    requiredCourses: "",
    additionalRequirements: "",
    assessmentType: "",
    applicationDeadline: "",
    timeLimit: "",
    passingScore: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="dashboard-page create-posting-page">
      <h1 className="dashboard-title">Create Research Posting</h1>
      <p className="dashboard-subtitle">
        Fill out the details for your research opportunity
      </p>

      <form className="create-posting-form" onSubmit={(e) => e.preventDefault()}>
        <div className="form-section">
          <h3 className="form-section-title">Basic Information</h3>
          <div className="form-row">
            <div className="input-group">
              <label>Position Title</label>
              <input
                name="positionTitle"
                value={formData.positionTitle}
                onChange={handleChange}
                placeholder="e.g. Machine Learning Research Assistant"
              />
            </div>
            <div className="input-group">
              <label>Department</label>
              <input
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="e.g. Computer Science"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="input-group">
              <label>Compensation</label>
              <input
                name="compensation"
                value={formData.compensation}
                onChange={handleChange}
                placeholder="e.g. $15/hr"
              />
            </div>
            <div className="input-group">
              <label>Compensation Type</label>
              <select
                name="compensationType"
                value={formData.compensationType}
                onChange={handleChange}
              >
                <option value="">Select type</option>
                <option value="hourly">Hourly</option>
                <option value="stipend">Stipend</option>
                <option value="credit">Credit</option>
                <option value="volunteer">Volunteer</option>
              </select>
            </div>
          </div>
          <div className="input-group">
            <label>Compensation Detail</label>
            <input
              name="compensationDetail"
              value={formData.compensationDetail}
              onChange={handleChange}
              placeholder="Additional compensation details"
            />
          </div>
          <div className="input-group">
            <label>Research Area</label>
            <input
              name="researchArea"
              value={formData.researchArea}
              onChange={handleChange}
              placeholder="e.g. Machine Learning, NLP"
            />
          </div>
        </div>

        <div className="form-section">
          <h3 className="form-section-title">Position Details</h3>
          <div className="form-row">
            <div className="input-group">
              <label>Start Date</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
              />
            </div>
            <div className="input-group">
              <label>End Date</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="input-group">
            <label>Overview</label>
            <textarea
              name="overview"
              value={formData.overview}
              onChange={handleChange}
              placeholder="Brief overview of the position"
              rows={2}
            />
          </div>
          <div className="input-group">
            <label>Detailed Description</label>
            <textarea
              name="detailedDescription"
              value={formData.detailedDescription}
              onChange={handleChange}
              placeholder="Full description of responsibilities and expectations"
              rows={4}
            />
          </div>
          <div className="input-group">
            <label>Number of Positions</label>
            <input
              type="number"
              name="numPositions"
              value={formData.numPositions}
              onChange={handleChange}
              placeholder="e.g. 2"
              min="1"
            />
          </div>
        </div>

        <div className="form-section">
          <h3 className="form-section-title">Requirements and Prerequisites</h3>
          <div className="input-group">
            <label>Required Skills</label>
            <input
              name="requiredSkills"
              value={formData.requiredSkills}
              onChange={handleChange}
              placeholder="e.g. Python, Statistics"
            />
          </div>
          <div className="input-group">
            <label>Minimum GPA</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="4"
              name="minGpa"
              value={formData.minGpa}
              onChange={handleChange}
              placeholder="e.g. 3.0"
            />
          </div>
          <div className="input-group">
            <label>Required Courses</label>
            <input
              name="requiredCourses"
              value={formData.requiredCourses}
              onChange={handleChange}
              placeholder="e.g. CS 101, MATH 200"
            />
          </div>
          <div className="input-group">
            <label>Additional Requirements</label>
            <textarea
              name="additionalRequirements"
              value={formData.additionalRequirements}
              onChange={handleChange}
              placeholder="Any other requirements"
              rows={2}
            />
          </div>
        </div>

        <div className="form-section">
          <h3 className="form-section-title">Technical Assessment</h3>
          <div className="input-group">
            <label>Create or Select Assessment Question</label>
            <input
              name="assessmentType"
              value={formData.assessmentType}
              onChange={handleChange}
              placeholder="Assessment configuration"
            />
          </div>
        </div>

        <div className="form-section">
          <h3 className="form-section-title">Application Settings</h3>
          <div className="form-row">
            <div className="input-group">
              <label>Application Deadline</label>
              <input
                type="date"
                name="applicationDeadline"
                value={formData.applicationDeadline}
                onChange={handleChange}
              />
            </div>
            <div className="input-group">
              <label>Time Limit (minutes)</label>
              <input
                type="number"
                name="timeLimit"
                value={formData.timeLimit}
                onChange={handleChange}
                placeholder="e.g. 60"
              />
            </div>
            <div className="input-group">
              <label>Passing Score (%)</label>
              <input
                type="number"
                name="passingScore"
                value={formData.passingScore}
                onChange={handleChange}
                placeholder="e.g. 70"
                min="0"
                max="100"
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn">Publish Posting</button>
          <button type="button" className="btn btn-outline">Save Draft</button>
          <button type="button" className="btn btn-outline">Preview</button>
        </div>
      </form>
    </div>
  );
}

export default CreatePosting;
