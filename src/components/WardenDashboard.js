// Warden Dashboard - View and resolve hostel complaints
import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { auth } from "../firebase";
import { useTranslation } from "../hooks/useTranslation";
import "./Dashboard.css";

const WardenDashboard = ({ user }) => {
  console.log("🏠 WardenDashboard rendering for:", user?.email);
  const { t } = useTranslation();
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [resolutionNote, setResolutionNote] = useState("");

  useEffect(() => {
    // Fetch ALL complaints (we'll filter by category for hostel-related)
    const q = query(collection(db, "grievances"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const complaintData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Filter for hostel-related complaints by category or department
      const hostelComplaints = complaintData.filter((complaint) => {
        const category = complaint.category?.toLowerCase() || '';
        const department = complaint.department?.toLowerCase() || '';
        return (
          department === 'hostel' ||
          category.includes('hostel') ||
          category.includes('mess') ||
          category.includes('room') ||
          category.includes('accommodation')
        );
      });

      // Sort by created_at
      hostelComplaints.sort((a, b) => {
        const aTime = a.created_at?.toMillis?.() || 0;
        const bTime = b.created_at?.toMillis?.() || 0;
        return bTime - aTime;
      });

      setComplaints(hostelComplaints);
      setFilteredComplaints(hostelComplaints);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (statusFilter) {
      setFilteredComplaints(
        complaints.filter((c) => c.status === statusFilter)
      );
    } else {
      setFilteredComplaints(complaints);
    }
  }, [statusFilter, complaints]);

  const handleUpdateStatus = async (complaintId, newStatus) => {
    try {
      await updateDoc(doc(db, "grievances", complaintId), {
        status: newStatus,
        updated_at: serverTimestamp(),
        resolved_by: user.email,
        resolution_note: resolutionNote || null,
      });
      setResolutionNote("");
      setSelectedComplaint(null);
      alert("Status updated successfully!");
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Error updating status: " + error.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "#f59e0b";
      case "In Progress":
        return "#3b82f6";
      case "Resolved":
        return "#10b981";
      default:
        return "#6b7280";
    }
  };

  return (
    <div className="dashboard-layout">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>🏠 Warden Portal</h2>
          <p>Hostel Management</p>
        </div>
        <ul className="sidebar-menu">
          <li className="sidebar-item">
            <div className="sidebar-link active">
              <svg className="sidebar-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
              </svg>
              Triage / Resolution
            </div>
          </li>
        </ul>
      </div>

      <div className="main-content">
        <div className="header" style={{
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          padding: '24px 32px',
          borderRadius: '12px',
          marginBottom: '24px',
          boxShadow: '0 4px 20px rgba(245, 158, 11, 0.3)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ color: 'white', fontSize: '1.8rem', fontWeight: '700', margin: '0 0 8px 0' }}>
                🏠 Warden Dashboard
              </h1>
              <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '1rem', margin: '0' }}>
                {user.email}
              </p>
              <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem', margin: '4px 0 0 0' }}>
                📋 Hostel Department Complaints
              </p>
            </div>
            <button 
              onClick={() => auth.signOut()} 
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                padding: '10px 24px',
                borderRadius: '8px',
                fontSize: '0.95rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              🚪 Logout
            </button>
          </div>
        </div>

        <div className="dashboard-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Hostel Complaints ({filteredComplaints.length})</h2>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: '2px solid #e5e7eb',
                fontSize: '0.9rem'
              }}
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          <div className="complaints-list">
            {filteredComplaints.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                <p>No hostel complaints found</p>
              </div>
            ) : (
              filteredComplaints.map((complaint) => (
                <div key={complaint.id} className="complaint-card" style={{
                  background: 'white',
                  padding: '20px',
                  borderRadius: '12px',
                  marginBottom: '16px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  border: '2px solid #e5e7eb'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', color: '#1f2937' }}>
                        {complaint.title}
                      </h3>
                      <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: '0 0 8px 0' }}>
                        📧 {complaint.student_name}
                      </p>
                      <p style={{ color: '#374151', margin: '0 0 12px 0' }}>
                        {complaint.description}
                      </p>
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <span style={{
                          background: '#f3f4f6',
                          padding: '4px 12px',
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                          color: '#4b5563'
                        }}>
                          📁 {complaint.category}
                        </span>
                        <span style={{
                          background: '#fef3c7',
                          padding: '4px 12px',
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                          color: '#92400e'
                        }}>
                          🏠 Hostel
                        </span>
                        <span style={{
                          background: getStatusColor(complaint.status) + '20',
                          color: getStatusColor(complaint.status),
                          padding: '4px 12px',
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                          fontWeight: '600'
                        }}>
                          {complaint.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedComplaint === complaint.id ? (
                    <div style={{ marginTop: '16px', padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
                      <textarea
                        placeholder="Add resolution note..."
                        value={resolutionNote}
                        onChange={(e) => setResolutionNote(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: '6px',
                          border: '2px solid #e5e7eb',
                          fontSize: '0.9rem',
                          marginBottom: '12px',
                          minHeight: '80px'
                        }}
                      />
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleUpdateStatus(complaint.id, "In Progress")}
                          style={{
                            background: '#3b82f6',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                          }}
                        >
                          Mark In Progress
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(complaint.id, "Resolved")}
                          style={{
                            background: '#10b981',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                          }}
                        >
                          Mark Resolved
                        </button>
                        <button
                          onClick={() => {
                            setSelectedComplaint(null);
                            setResolutionNote("");
                          }}
                          style={{
                            background: '#6b7280',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedComplaint(complaint.id)}
                      style={{
                        marginTop: '12px',
                        background: '#f59e0b',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: '600'
                      }}
                    >
                      Update Status
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WardenDashboard;
