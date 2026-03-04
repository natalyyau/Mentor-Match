import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError("Please enter both email and password.");
      return;
    }
    setError("");
    console.log("Login submitted:", formData);
    navigate("/student/dashboard");
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Mentor Match</h1>
        <p className="login-subtitle">Research Collaboration Platform</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label>University Email</label>
            <input
              type="email"
              name="email"
              placeholder="name@university.edu"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          {error && <p className="error">{error}</p>}

          <button type="submit" className="login-button">
            Sign In
          </button>
        </form>

        <p className="footer-text">
          New to Mentor Match?{" "}
          <span
            onClick={() => navigate("/register")}
            style={{
              color: "#1a2b4c",
              cursor: "pointer",
              textDecoration: "underline"
            }}
          >
            Create an account
          </span>.
        </p>
      </div>
    </div>
  );
}

export default Login;