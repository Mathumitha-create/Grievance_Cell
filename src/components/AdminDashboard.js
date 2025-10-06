// Admin dashboard: View all and update status
import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  orderBy,
  query,
} from "firebase/firestore";
import { auth } from "../firebase";

const AdminDashboard = ({ user }) => {
  const [grievances, setGrievances] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "grievances"),
      orderBy("created_at", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setGrievances(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    });
    return unsubscribe;
  }, []);

  const updateStatus = async (id, newStatus) => {
    await updateDoc(doc(db, "grievances", id), {
      status: newStatus,
      updated_at: new Date(),
    });
  };

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-blue-50 to-blue-200">
      <h1 className="text-4xl font-bold text-blue-800 mb-4">Admin Dashboard</h1>
      <h2 className="text-2xl text-blue-700 mb-4">All Grievances</h2>
      <ul>
        {grievances.map((g) => (
          <li
            key={g.id}
            className="border border-blue-200 bg-white rounded-lg shadow p-4 mb-4"
          >
            <p className="mb-1">
              <span className="font-semibold text-blue-700">Student:</span>{" "}
              {g.student_name}
            </p>
            <p className="mb-1">
              <span className="font-semibold text-blue-700">Category:</span>{" "}
              {g.category}
            </p>
            <p className="mb-1">
              <span className="font-semibold text-blue-700">Description:</span>{" "}
              {g.description}
            </p>
            <p className="mb-2">
              <span className="font-semibold text-blue-700">Status:</span>{" "}
              {g.status}
            </p>
            <select
              onChange={(e) => updateStatus(g.id, e.target.value)}
              value={g.status}
              className="border border-blue-300 rounded p-2 focus:outline-none focus:border-blue-700 bg-blue-50"
            >
              <option>Pending</option>
              <option>In Progress</option>
              <option>Resolved</option>
            </select>
          </li>
        ))}
      </ul>
      <button
        onClick={() => auth.signOut()}
        className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-6 rounded-md mt-6 transition-colors"
      >
        Logout
      </button>
    </div>
  );
};

export default AdminDashboard;
