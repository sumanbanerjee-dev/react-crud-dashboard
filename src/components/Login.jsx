import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleLogin(e) {
    e.preventDefault();

    setError("");

    // Validation
    if (!email.trim() || !password) {
      setError("Please enter email and password!");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      setError("Please enter a valid email address!");
      return;
    }

    // Get registered user
    const registeredUser = JSON.parse(
      localStorage.getItem("registeredUser") || "null"
    );

    // Check credentials
    if (
      !registeredUser ||
      registeredUser.email !== email.trim().toLowerCase() ||
      registeredUser.password !== password
    ) {
      setError("Invalid email or password!");
      return;
    }

    // Generate demo token
    const demoToken = "demo-token-" + Date.now();

    localStorage.setItem("authToken", demoToken);
    localStorage.setItem("loggedInUser", registeredUser.name);

    // Navigate to dashboard
    navigate("/dashboard");
  }

  return (
    <div className="auth-container">
      <div className="auth-card">

        <div className="auth-heading">
          <h1>Welcome Back!</h1>
          <p>Login to access your dashboard</p>
        </div>

        {error && <div className="message error">{error}</div>}

        <form onSubmit={handleLogin}>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="auth-button">
            Login
          </button>

        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>

      </div>
    </div>
  );
}

export default Login;