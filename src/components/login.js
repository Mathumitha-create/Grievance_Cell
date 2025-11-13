// Login component using Firebase Auth
import React, { useState } from "react";
import { auth, googleProvider, db } from "../firebase";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Signup from "./Signup";
import "./login.css";

const Login = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isSignup, setIsSignup] = useState(false);
  const [loginMode, setLoginMode] = useState("student"); // "student", "warden", "faculty", "hod", "admin"

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Email validation based on role
    if (!email.toLowerCase().endsWith("@sece.ac.in")) {
      setError("Please use your @sece.ac.in email address");
      return;
    }
    
    // Role-specific email validation
    const roleKeywords = {
      admin: 'admin',
      warden: 'warden',
      faculty: 'faculty',
      hod: 'hod'
    };
    
    if (loginMode !== "student" && roleKeywords[loginMode]) {
      if (!email.toLowerCase().includes(roleKeywords[loginMode])) {
        setError(`${loginMode.charAt(0).toUpperCase() + loginMode.slice(1)} accounts must contain '${roleKeywords[loginMode]}' in the email`);
        return;
      }
    }
    
    try {
      console.log("Attempting login as:", loginMode);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("Login successful for:", user.email);
      
      // Store/update user role in Firestore
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        // For non-student roles, create document with selected role
        console.log("Creating new user document with role:", loginMode);
        await setDoc(userRef, {
          name: name || user.email.split('@')[0],
          email: user.email,
          role: loginMode, // Use the selected login mode
          createdAt: new Date(),
        });
        console.log("User document created successfully with role:", loginMode);
      } else {
        // User document exists - just log it, don't verify role
        const userData = userDoc.data();
        console.log("Existing user found - role:", userData.role, "Login mode:", loginMode);
        // Don't sign out - let email-based detection in App.js handle the role
      }
    } catch (err) {
      console.error("Login error:", err);
      if (err.code === "auth/user-not-found") {
        setError("No account found with this email. Please sign up first.");
      } else if (err.code === "auth/wrong-password") {
        setError("Incorrect password. Please try again.");
      } else {
        setError(err.message);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      // Block non-student signup via Google
      if (loginMode !== "student") {
        setError(`${loginMode.charAt(0).toUpperCase() + loginMode.slice(1)} accounts cannot be created through Google Sign-In. Please use email/password login with pre-created credentials.`);
        return;
      }

      const userCredential = await signInWithPopup(auth, googleProvider);
      const user = userCredential.user;
      
      // Store/update user role in Firestore
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        // Create user document with role (only student allowed)
        await setDoc(userRef, {
          name: user.displayName || user.email.split('@')[0], // Use Google display name or extract from email
          email: user.email,
          role: "student", // Force student role for new Google sign-ins
          createdAt: new Date(),
        });
      } else {
        // Verify role matches
        const userData = userDoc.data();
        if (userData.role !== loginMode) {
          await auth.signOut();
          setError(`This account is registered as ${userData.role}. Please select the correct login type.`);
          return;
        }
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (isSignup) {
    return <Signup onBackToLogin={() => setIsSignup(false)} />;
  }

  return (
    <div className="login-container">
      <form onSubmit={handleLogin} className="login-card">
        <h2 className="login-title">🎓 Grievance Cell</h2>
        <p className="login-subtitle">Sri Eshwar College of Engineering</p>
        
        {/* Role Selection Dropdown */}
        <div className="form-group">
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            color: '#374151', 
            fontWeight: '600',
            fontSize: '0.95rem'
          }}>
            Select Your Role
          </label>
          <select
            value={loginMode}
            onChange={(e) => setLoginMode(e.target.value)}
            className="form-input"
            style={{
              padding: '12px',
              fontSize: '1rem',
              cursor: 'pointer',
              background: 'white',
              border: '2px solid #e5e7eb',
              borderRadius: '8px'
            }}
          >
            <option value="student">👨‍🎓 Student</option>
            <option value="warden">🏠 Warden</option>
            <option value="faculty">👨‍🏫 Faculty</option>
            <option value="hod">👔 HOD</option>
            <option value="admin">👨‍💼 Admin</option>
          </select>
        </div>
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
        <button type="submit" className="login-button">
          Log In
        </button>
        
        {/* Only show signup button for students */}
        {loginMode === "student" && (
          <button
            type="button"
            onClick={() => setIsSignup(true)}
            className="signup-link"
            style={{
              background: '#2563eb',
              color: 'white',
              fontWeight: '600',
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
              fontSize: '0.95rem',
              marginTop: '0.5rem'
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#1e4b9e';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 16px rgba(37, 99, 235, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = '#2563eb';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.3)';
            }}
          >
            ✨ New Student? Sign Up Here
          </button>
        )}
        
        {/* Show message for staff roles */}
        {loginMode !== "student" && (
          <p style={{
            textAlign: 'center',
            color: '#6b7280',
            fontSize: '0.9rem',
            marginTop: '1rem',
            fontStyle: 'italic'
          }}>
            {loginMode.charAt(0).toUpperCase() + loginMode.slice(1)} accounts must be pre-created by the system administrator.
          </p>
        )}
        <div className="divider">
          <div className="divider-line"></div>
          <span className="divider-text">or</span>
          <div className="divider-line"></div>
        </div>
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="google-button"
        >
          <svg
            className="google-icon"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clipPath="url(#clip0_17_40)">
              <path
                d="M47.5 24.5C47.5 22.6 47.3 20.8 47 19H24V29.1H37.4C36.7 32.2 34.7 34.7 31.8 36.4V42H39.5C44 38.1 47.5 32.1 47.5 24.5Z"
                fill="#4285F4"
              />
              <path
                d="M24 48C30.6 48 36.1 45.9 39.5 42L31.8 36.4C29.9 37.6 27.6 38.3 24 38.3C17.7 38.3 12.2 34.2 10.3 28.7H2.3V34.4C5.7 41.1 14.1 48 24 48Z"
                fill="#34A853"
              />
              <path
                d="M10.3 28.7C9.7 26.9 9.4 24.9 9.4 23C9.4 21.1 9.7 19.1 10.3 17.3V11.6H2.3C0.8 14.4 0 17.6 0 21C0 24.4 0.8 27.6 2.3 30.4L10.3 28.7Z"
                fill="#FBBC05"
              />
              <path
                d="M24 9.7C27.1 9.7 29.7 10.8 31.7 12.7L39.6 5.1C36.1 1.9 30.6 0 24 0C14.1 0 5.7 6.9 2.3 13.6L10.3 19.3C12.2 13.8 17.7 9.7 24 9.7Z"
                fill="#EA4335"
              />
            </g>
            <defs>
              <clipPath id="clip0_17_40">
                <rect width="48" height="48" fill="white" />
              </clipPath>
            </defs>
          </svg>
          Sign in with Google
        </button>
        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  );
};

export default Login;
