// Main app component handling routing and auth state
import React, { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import Login from "./components/login";
import StudentDashboard from "./components/StudentDashboard";
import AdminDashboard from "./components/AdminDashboard";
import WardenDashboard from "./components/SimpleWardenDashboard";
import FacultyDashboard from "./components/SimpleFacultyDashboard";
import DebugPanel from "./components/DebugPanel";
import { LanguageProvider } from "./contexts/LanguageContext";
import LanguageSelector from "./components/LanguageSelector";
import TranslationDemo from "./components/TranslationDemo";

function App() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [debugMode, setDebugMode] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  
  // Enable debug mode with Ctrl+Shift+D
  // Enable demo mode with Ctrl+Shift+T (Translation demo)
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        setDebugMode(prev => !prev);
        console.log("Debug mode:", !debugMode ? "ENABLED" : "DISABLED");
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'T') {
        setShowDemo(prev => !prev);
        console.log("Translation Demo:", !showDemo ? "ENABLED" : "DISABLED");
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [debugMode, showDemo]);

  useEffect(() => {
    console.log("🔧 Setting up auth listener...");
    let isSubscribed = true;
    
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!isSubscribed) {
        console.log("⏭️ Component unmounted, skipping auth update");
        return;
      }
      
      console.log("🔄 Auth state changed:", user?.email || "No user");
      console.log("🔄 Auth state change timestamp:", new Date().toISOString());
      
      if (user) {
        console.log("✅ User authenticated, fetching role...");
        console.log("✅ User UID:", user.uid);
        console.log("✅ User email verified:", user.emailVerified);
        
        setUser(user);
        
        // ALWAYS use email-based detection first for immediate response
        let role = "student";
        const email = user.email.toLowerCase();
        if (email.includes("admin")) role = "admin";
        else if (email.includes("warden")) role = "warden";
        else if (email.includes("hod")) role = "hod";
        else if (email.includes("faculty")) role = "faculty";
        
        console.log("✅ User role detected from email:", role);
        console.log("✅ Setting user role to:", role);
        setUserRole(role);
        console.log("✅ User role set successfully");
        
        // Skip Firestore check for now - use email-based role only
        console.log("✅ Using email-based role (Firestore check disabled):", role);
        setLoading(false);
      } else {
        console.log("❌ User logged out or not authenticated");
        console.log("❌ Setting user and role to null");
        setUser(null);
        setUserRole(null);
        setLoading(false);
      }
    });
    
    return () => {
      console.log("🧹 Cleaning up auth listener");
      isSubscribed = false;
      unsubscribe();
    };
  }, []); // Empty dependency array - only run once

  const renderContent = () => {
    console.log("🔄 renderContent called - loading:", loading, "user:", user?.email, "userRole:", userRole);
    
    if (loading) {
      console.log("📊 Rendering: Loading screen");
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
      console.log("📊 Rendering: Login page (no user)");
      return <Login />;
    }
    
    // Wait for role to be loaded before rendering dashboard
    if (user && userRole === null) {
      console.log("⏳ User authenticated but role not loaded yet...");
      console.log("📊 Rendering: Loading Dashboard screen");
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
    
    // Translation Demo mode - show translation demo
    if (showDemo) {
      return (
        <div>
          <div style={{
            position: 'fixed',
            top: '10px',
            right: '10px',
            backgroundColor: '#8b5cf6',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            fontWeight: 'bold',
            zIndex: 9999,
            cursor: 'pointer'
          }} onClick={() => setShowDemo(false)}>
            🌐 TRANSLATION DEMO - Click to Exit
          </div>
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 1000
          }}>
            <LanguageSelector />
          </div>
          <TranslationDemo />
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
    console.log("User object:", user);
    console.log("Loading:", loading);
    console.log("=========================");

    // Language selector positioned at top right
    const languageSelectorStyle = {
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 1000
    };

    // Route to appropriate dashboard based on role
    if (userRole === "admin") {
      console.log("✅ Rendering AdminDashboard for:", user?.email);
      return (
        <>
          <div style={languageSelectorStyle}>
            <LanguageSelector />
          </div>
          <AdminDashboard user={user} />
        </>
      );
    } else if (userRole === "warden") {
      console.log("✅ Rendering WardenDashboard for:", user?.email);
      return (
        <>
          <div style={languageSelectorStyle}>
            <LanguageSelector />
          </div>
          <WardenDashboard user={user} />
        </>
      );
    } else if (userRole === "faculty" || userRole === "hod") {
      console.log(`✅ Rendering FacultyDashboard for ${userRole}:`, user?.email);
      return (
        <>
          <div style={languageSelectorStyle}>
            <LanguageSelector />
          </div>
          <FacultyDashboard user={user} />
        </>
      );
    } else {
      console.log("✅ Rendering StudentDashboard for:", user?.email);
      return (
        <>
          <div style={languageSelectorStyle}>
            <LanguageSelector />
          </div>
          <StudentDashboard user={user} />
        </>
      );
    }
  };

  return (
    <LanguageProvider>
      {renderContent()}
    </LanguageProvider>
  );
}

export default App;
