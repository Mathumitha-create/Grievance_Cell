// Main app component handling routing and auth state
import React, { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import Login from "./components/login";
import StudentDashboard from "./components/StudentDashboard";
import AdminDashboard from "./components/AdminDashboard";
import DebugPanel from "./components/DebugPanel";

function App() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [debugMode, setDebugMode] = useState(false);
  
  // Enable debug mode with Ctrl+Shift+D
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        setDebugMode(prev => !prev);
        console.log("Debug mode:", !debugMode ? "ENABLED" : "DISABLED");
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [debugMode]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      console.log("🔄 Auth state changed:", user?.email || "No user");
      
      if (user) {
        console.log("✅ User authenticated, fetching role...");
        setUser(user);
        
        // Fetch user role from Firestore
        try {
          const userRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userRef);
          
          if (userDoc.exists()) {
            const role = userDoc.data().role;
            console.log("✅ User role from Firestore:", role);
            setUserRole(role);
          } else {
            // Fallback to email-based detection for existing users
            const role = user.email.includes("admin") ? "admin" : "student";
            console.log("⚠️ User role from email fallback:", role);
            setUserRole(role);
          }
        } catch (error) {
          console.error("❌ Error fetching user role:", error);
          // Fallback to email-based detection
          const role = user.email.includes("admin") ? "admin" : "student";
          console.log("⚠️ User role from error fallback:", role);
          setUserRole(role);
        }
      } else {
        console.log("❌ User logged out or not authenticated");
        setUser(null);
        setUserRole(null);
      }
      
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
        color: 'white',
        fontSize: '1.5rem',
        fontWeight: 'bold'
      }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }
  
  // Wait for role to be loaded before rendering dashboard
  if (user && userRole === null) {
    console.log("⏳ User authenticated but role not loaded yet...");
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
        color: 'white',
        fontSize: '1.5rem',
        fontWeight: 'bold'
      }}>
        Loading Dashboard...
      </div>
    );
  }
  
  // Debug mode - show debug panel
  if (debugMode) {
    return (
      <div>
        <div style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          backgroundColor: '#ef4444',
          color: 'white',
          padding: '0.5rem 1rem',
          borderRadius: '6px',
          fontWeight: 'bold',
          zIndex: 9999,
          cursor: 'pointer'
        }} onClick={() => setDebugMode(false)}>
          🔍 DEBUG MODE - Click to Exit
        </div>
        <DebugPanel />
      </div>
    );
  }

  console.log("=== RENDERING DECISION ===");
  console.log("User:", user?.email);
  console.log("User Role:", userRole);
  console.log("Role type:", typeof userRole);
  console.log("Is admin?", userRole === "admin");
  console.log("Will render:", userRole === "admin" ? "AdminDashboard" : "StudentDashboard");
  console.log("=========================");

  if (userRole === "admin") {
    console.log("✅ Rendering AdminDashboard for:", user?.email);
    return <AdminDashboard user={user} />;
  } else {
    console.log("✅ Rendering StudentDashboard for:", user?.email);
    return <StudentDashboard user={user} />;
  }
}

export default App;
