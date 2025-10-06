// Main app component handling routing and auth state
import React, { useState, useEffect } from "react";
import { auth } from "./firebase";
import Login from "./components/login";
import StudentDashboard from "./components/StudentDashboard";
import AdminDashboard from "./components/AdminDashboard";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return unsubscribe;
  }, []);

  if (!user) {
    return <Login />;
  }

  const isAdmin = user.email.includes("admin");
  return isAdmin ? (
    <AdminDashboard user={user} />
  ) : (
    <StudentDashboard user={user} />
  );
}

export default App;
