import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value,
    });
  }

  function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setSuccess("");

    // Validation
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError("All fields are required!");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(form.email)) {
      setError("Please enter a valid email address!");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters!");
      return;
    }

    // Check existing user
    const existingUser = JSON.parse(
      localStorage.getItem("registeredUser") || "null"
    );

    if (existingUser && existingUser.email === form.email.trim().toLowerCase()) {
      setError("This email is already registered!");
      return;
    }

    // Save user details
    const user = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
    };

    localStorage.setItem("registeredUser", JSON.stringify(user));

    setSuccess("Registration successful! Redirecting to Login...");

    setTimeout(() => {
      navigate("/login");
    }, 1000);
  }

  return (
    <div className="auth-container">
      <div className="auth-card">

        <div className="auth-heading">
          <h1>Create Account</h1>
          <p>Sign up to get started</p>
        </div>

        {error && <div className="message error">{error}</div>}
        {success && <div className="message success">{success}</div>}

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Create a password"
              value={form.password}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="auth-button">
            Create Account
          </button>

        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>

      </div>
    </div>
  );
}

export default Signup;