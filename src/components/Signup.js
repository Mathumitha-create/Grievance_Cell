// Signup component using Firebase Auth
import React, { useState } from "react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import "./login.css";

const Signup = ({ onBackToLogin }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const role = "student"; // Fixed to student only - admins cannot signup

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate email is from sece.ac.in domain
    if (!email.toLowerCase().endsWith("@sece.ac.in")) {
      setError("Please use your @sece.ac.in email address");
      return;
    }

    // Prevent admin signup
    if (email.toLowerCase().includes("admin")) {
      setError("Admin accounts cannot be created through signup. Please contact system administrator.");
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
        name: name || user.email.split('@')[0], // Use provided name or extract from email
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
        <h2 className="login-title">🎓 Student Sign Up</h2>
        <p className="login-subtitle">Sri Eshwar College of Engineering</p>
        <p className="email-domain-notice">
          Please use your @sece.ac.in email address
        </p>
        <p className="info-notice" style={{ 
          fontSize: '0.85rem', 
          color: '#6b7280', 
          marginBottom: '1rem',
          textAlign: 'center'
        }}>
          Note: Admin accounts cannot be created through signup. Please contact the system administrator.
        </p>
        
        <div className="form-group">
          <input
            type="text"
            placeholder="Your Name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="form-input"
            style={{
              background: 'rgba(59, 130, 246, 0.05)',
              border: '2px solid rgba(59, 130, 246, 0.2)'
            }}
          />
        </div>
        <div className="form-group">
          <input
            type="email"
            placeholder="yourname@sece.ac.in"
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
