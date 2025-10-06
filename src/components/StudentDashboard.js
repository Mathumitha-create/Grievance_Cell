// Student dashboard: Submit form and list grievances
import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import GrievanceForm from "./GrievanceForm";
import { auth } from "../firebase";

const StudentDashboard = ({ user }) => {
  const [grievances, setGrievances] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "grievances"),
      where("student_name", "==", user.email),
      orderBy("created_at", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setGrievances(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    });
    return unsubscribe;
  }, [user]);

  const handleSubmit = async (data) => {
    await addDoc(collection(db, "grievances"), {
      ...data,
      student_name: user.email,
      status: "Pending",
      created_at: new Date(),
      updated_at: new Date(),
    });
  };

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-blue-50 to-blue-200">
      <h1 className="text-4xl font-bold text-blue-800 mb-4">
        Student Dashboard
      </h1>
      <GrievanceForm onSubmit={handleSubmit} />
      <h2 className="text-2xl text-blue-700 mt-8 mb-4">Your Grievances</h2>
      <ul>
        {grievances.map((g) => (
          <li
            key={g.id}
            className="border border-blue-200 bg-white rounded-lg shadow p-4 mb-4"
          >
            <p className="mb-1">
              <span className="font-semibold text-blue-700">Category:</span>{" "}
              {g.category}
            </p>
            <p className="mb-1">
              <span className="font-semibold text-blue-700">Description:</span>{" "}
              {g.description}
            </p>
            <p className="mb-1">
              <span className="font-semibold text-blue-700">Status:</span>{" "}
              {g.status}
            </p>
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

export default StudentDashboard;
