import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    role: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    major: "",
    year: "",
    gpa: "",
    skills: "",
    department: "",
    position: "",
    researchAreas: ""
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.role) newErrors.role = "Please select your role.";
    if (!formData.firstName) newErrors.firstName = "First name is required.";
    if (!formData.lastName) newErrors.lastName = "Last name is required.";
    if (!formData.email) newErrors.email = "Email is required.";
    else if (!/^\S+@\S+\.edu$/.test(formData.email)) newErrors.email = "Enter a valid .edu email.";
    if (!formData.password) newErrors.password = "Password is required.";
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters.";
    else if (!/[!@#$%^&*]/.test(formData.password)) newErrors.password = "Password must include a special character.";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match.";

    if (formData.role === "student") {
      if (!formData.major) newErrors.major = "Major is required.";
      if (!formData.year) newErrors.year = "Year/Level is required.";
      if (!formData.gpa || isNaN(formData.gpa) || formData.gpa < 0 || formData.gpa > 4) newErrors.gpa = "GPA must be 0.0–4.0";
    }

    if (formData.role === "faculty") {
      if (!formData.department) newErrors.department = "Department is required.";
      if (!formData.position) newErrors.position = "Position/Title is required.";
      if (!formData.researchAreas) newErrors.researchAreas = "Research areas required.";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});

    try {
      const response = await fetch("http://127.0.0.1:8000/api/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        alert("Registration successful!");
        navigate("/login");
      } else {
        alert(data.error || "Registration failed");
      }
    } catch (err) {
      console.error(err);
      alert("Server error. Try again later.");
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h1 className="register-title">Mentor Match</h1>
        <p className="register-subtitle">Research Collaboration Platform</p>

        <form onSubmit={handleSubmit} className="register-form">

          <div className="input-group">
            <label>Role</label>
            <select name="role" value={formData.role} onChange={handleChange}>
              <option value="">Select role</option>
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
            </select>
            {errors.role && <p className="error">{errors.role}</p>}
          </div>

          <div className="input-group">
            <label>First Name</label>
            <input type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} />
            {errors.firstName && <p className="error">{errors.firstName}</p>}
          </div>

          <div className="input-group">
            <label>Last Name</label>
            <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} />
            {errors.lastName && <p className="error">{errors.lastName}</p>}
          </div>

          <div className="input-group">
            <label>University Email</label>
            <input type="email" name="email" placeholder="name@university.edu" value={formData.email} onChange={handleChange} />
            {errors.email && <p className="error">{errors.email}</p>}
          </div>

          <div className="input-group">
            <label>Password</label>
            <input type="password" name="password" placeholder="Create a password" value={formData.password} onChange={handleChange} />
            {errors.password && <p className="error">{errors.password}</p>}
          </div>

          <div className="input-group">
            <label>Confirm Password</label>
            <input type="password" name="confirmPassword" placeholder="Confirm your password" value={formData.confirmPassword} onChange={handleChange} />
            {errors.confirmPassword && <p className="error">{errors.confirmPassword}</p>}
          </div>

          {formData.role === "student" && (
            <>
              <div className="input-group">
                <label>Major</label>
                <input type="text" name="major" placeholder="Your Major" value={formData.major} onChange={handleChange} />
                {errors.major && <p className="error">{errors.major}</p>}
              </div>

              <div className="input-group">
                <label>Year/Level</label>
                <select name="year" value={formData.year} onChange={handleChange}>
                  <option value="">Select year/level</option>
                  <option value="Freshman">Freshman</option>
                  <option value="Sophomore">Sophomore</option>
                  <option value="Junior">Junior</option>
                  <option value="Senior">Senior</option>
                  <option value="Graduate">Graduate</option>
                  <option value="Postgraduate">Postgraduate</option>
                </select>
                {errors.year && <p className="error">{errors.year}</p>}
              </div>

              <div className="input-group">
                <label>GPA</label>
                <input type="number" step="0.01" min="0" max="4" name="gpa" placeholder="e.g., 3.75" value={formData.gpa} onChange={handleChange} />
                {errors.gpa && <p className="error">{errors.gpa}</p>}
              </div>

              <div className="input-group">
                <label>Skills</label>
                <input type="text" name="skills" placeholder="e.g., Python, Data Analysis" value={formData.skills} onChange={handleChange} />
              </div>
            </>
          )}

          {formData.role === "faculty" && (
            <>
              <div className="input-group">
                <label>Department</label>
                <input type="text" name="department" placeholder="Your Department" value={formData.department} onChange={handleChange} />
                {errors.department && <p className="error">{errors.department}</p>}
              </div>

              <div className="input-group">
                <label>Position/Title</label>
                <input type="text" name="position" placeholder="Your Position/Title" value={formData.position} onChange={handleChange} />
                {errors.position && <p className="error">{errors.position}</p>}
              </div>

              <div className="input-group">
                <label>Areas of Research</label>
                <input type="text" name="researchAreas" placeholder="Your Research Areas" value={formData.researchAreas} onChange={handleChange} />
                {errors.researchAreas && <p className="error">{errors.researchAreas}</p>}
              </div>
            </>
          )}

          <button type="submit" className="register-button">Create Account</button>
        </form>

        <p className="footer-text">
          Already have an account?{" "}
          <span onClick={() => navigate("/login")} style={{ color: "#1a2b4c", cursor: "pointer", textDecoration: "underline" }}>
            Sign in
          </span>.
        </p>
      </div>
    </div>
  );
}

export default Register;