// Signup component using Firebase Auth
import React, { useState } from "react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import "./login.css";

const Signup = ({ onBackToLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [role, setRole] = useState("student");

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate email is from sece.ac.in domain
    if (!email.toLowerCase().endsWith("@sece.ac.in")) {
      setError("Please use your @sece.ac.in email address");
      return;
    }

    // Validate admin email contains "admin"
    if (role === "admin" && !email.toLowerCase().includes("admin")) {
      setError("Admin accounts must contain 'admin' in the email (e.g., admin@sece.ac.in)");
      return;
    }

    // Validate password match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError("Password should be at least 6 characters");
      return;
    }

    try {
      console.log("Creating account with role:", role);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Store user role in Firestore
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        role: role,
        createdAt: new Date(),
      });
      console.log("User created successfully with role:", role);
      
      // Signup successful, will automatically log in
    } catch (err) {
      console.error("Signup error:", err);
      if (err.code === "auth/email-already-in-use") {
        setError("An account with this email already exists");
      } else {
        setError(err.message);
      }
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSignup} className="login-card">
        <h2 className="login-title">🎓 Sign Up</h2>
        <p className="login-subtitle">Sri Eshwar College of Engineering</p>
        <p className="email-domain-notice">
          Please use your @sece.ac.in email address
        </p>
        
        {/* Role Selection */}
        <div className="role-selector">
          <button
            type="button"
            className={`role-button ${role === "student" ? "active" : ""}`}
            onClick={() => setRole("student")}
          >
            👨‍🎓 Student Account
          </button>
          <button
            type="button"
            className={`role-button ${role === "admin" ? "active" : ""}`}
            onClick={() => setRole("admin")}
          >
            👨‍💼 Admin Account
          </button>
        </div>
        
        <div className="form-group">
          <input
            type="email"
            placeholder={role === "admin" ? "admin@sece.ac.in" : "yourname@sece.ac.in"}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-input"
            required
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-input"
            minLength="6"
            required
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="form-input"
            minLength="6"
            required
          />
        </div>
        <button type="submit" className="login-button">
          Sign Up
        </button>
        {error && <p className="error-message">{error}</p>}
        <button type="button" onClick={onBackToLogin} className="back-to-login">
          Already have an account? Log In
        </button>
      </form>
    </div>
  );
};

export default Signup;
