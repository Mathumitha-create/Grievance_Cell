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
  serverTimestamp,
} from "firebase/firestore";
import GrievanceForm from "./GrievanceForm";
import { auth } from "../firebase";
import { storage } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useTranslation } from "../hooks/useTranslation";
import TranslatedText from "./TranslatedText";
import SpeakButton from "./SpeakButton";
import TextToSpeech from "./TextToSpeech";
import { useTranslatedText } from "../hooks/useTranslation";
import "./Dashboard.css";

const StudentDashboard = ({ user }) => {
  console.log("📚 STUDENT DASHBOARD loaded for:", user?.email);
  console.log("⚠️ If you expected ADMIN dashboard, your account role is 'student'");
  
  const { t, currentLanguage } = useTranslation();
  const [activeTab, setActiveTab] = useState("summary");
  const [grievances, setGrievances] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [filteredGrievances, setFilteredGrievances] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    resolved: 0,
    open: 0,
    avgResolutionDays: 0,
  });

  // Component for translated text with TTS
  const TranslatedSpeakButton = ({ text }) => {
    const { translatedText } = useTranslatedText(text);
    return <SpeakButton text={translatedText} />;
  };

  useEffect(() => {
    const q = query(
      collection(db, "grievances"),
      where("student_name", "==", user.email)
    );
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const grievanceData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        
        // Sort by created_at on client side to avoid index requirement
        grievanceData.sort((a, b) => {
          const aTime = a.created_at?.toMillis?.() || 0;
          const bTime = b.created_at?.toMillis?.() || 0;
          return bTime - aTime; // descending order
        });
        
        console.log("Fetched grievances:", grievanceData.length);
        setGrievances(grievanceData);
        setFilteredGrievances(grievanceData);

      // Calculate statistics
      const total = grievanceData.length;
      const resolved = grievanceData.filter(
        (g) => g.status === "Resolved"
      ).length;
      const open = grievanceData.filter(
        (g) => g.status === "Pending" || g.status === "In Progress"
      ).length;

      // Calculate average resolution time for resolved grievances
      const resolvedGrievances = grievanceData.filter(
        (g) => g.status === "Resolved"
      );
      let totalDays = 0;
      resolvedGrievances.forEach((g) => {
        const created = g.created_at?.toDate?.();
        const updated = g.updated_at?.toDate?.();
        if (created && updated) {
          const diffTime = Math.abs(updated - created);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          totalDays += diffDays;
        }
      });
      const avgDays =
        resolvedGrievances.length > 0
          ? Math.round(totalDays / resolvedGrievances.length)
          : 0;

      setStats({
        total,
        resolved,
        open,
        avgResolutionDays: avgDays,
      });
    },
    (error) => {
      console.error("Error fetching grievances:", error);
      alert("Error loading grievances. Please refresh the page.");
    });
    return unsubscribe;
  }, [user]);

  useEffect(() => {
    let filtered = grievances;

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (g) =>
          g.title?.toLowerCase().includes(term) ||
          g.description?.toLowerCase().includes(term)
      );
    }

    // Apply category filter
    if (categoryFilter) {
      filtered = filtered.filter((g) => g.category === categoryFilter);
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter((g) => g.status === statusFilter);
    }

    setFilteredGrievances(filtered);
  }, [categoryFilter, statusFilter, searchTerm, grievances]);

  const handleSubmit = async (data) => {
    try {
      let attachmentUrl = null;
      let attachmentMeta = null;

      // Optional upload to Storage if an attachment is present
      if (data.attachment) {
        const file = data.attachment;
        // Enforce 500KB limit (as per UI hint)
        if (file.size > 500 * 1024) {
          alert("Attachment exceeds 500KB limit. Please upload a smaller file.");
          throw new Error("File size exceeds limit");
        }
        const path = `grievances/${user.uid}/${Date.now()}_${file.name}`;
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, file);
        attachmentUrl = await getDownloadURL(storageRef);
        attachmentMeta = {
          name: file.name,
          type: file.type,
          size: file.size,
          path,
        };
      }

      // Normalize and save document
      const grievanceData = {
        title: data.title,
        description: data.description,
        category: data.category,
        status: "Pending",
        student_name: user.email,
        student_uid: user.uid,
        attachmentUrl: attachmentUrl || null,
        attachmentMeta: attachmentMeta || null,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      };
      
      console.log("Submitting grievance data:", grievanceData);
      const docRef = await addDoc(collection(db, "grievances"), grievanceData);
      
      console.log("Grievance submitted successfully with ID:", docRef.id);
      console.log("User email:", user.email);
      
      // Switch to My Grievances tab after successful submission
      setTimeout(() => {
        setActiveTab("myGrievances");
      }, 1500);
      
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error("Error submitting grievance:", error);
      alert("Error submitting grievance. Please try again. Error: " + error.message);
      throw error;
    }
  };

  const renderSummary = () => (
    <div className="dashboard-content">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <h2 className="page-title" style={{ margin: 0 }}>{t('dashboard')} {t('welcome')}</h2>
        <TextToSpeech text={`${t('dashboard')} ${t('welcome')}`} />
      </div>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>{t('my_complaints')}</h3>
          <div className="stat-value">{stats.total}</div>
        </div>
        <div className="stat-card">
          <h3>{t('resolved_complaints')}</h3>
          <div className="stat-value">{stats.resolved}</div>
        </div>
        <div className="stat-card">
          <h3>{t('pending_complaints')}</h3>
          <div className="stat-value">{stats.open}</div>
        </div>
        <div className="stat-card">
          <h3>Avg. Resolution Time</h3>
          <div className="stat-value">{stats.avgResolutionDays} Days</div>
        </div>
      </div>

      <div className="chart-section">
        <h3>{t('statistics')}</h3>
        <div className="breakdown-info">
          <h4>{t('category')}</h4>
          <div>
            {Object.entries(
              grievances.reduce((acc, g) => {
                acc[g.category] = (acc[g.category] || 0) + 1;
                return acc;
              }, {})
            ).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A"}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSubmitGrievance = () => <GrievanceForm onSubmit={handleSubmit} />;

  const renderMyGrievances = () => (
    <div className="grievances-list">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h2 className="page-title" style={{ margin: 0 }}>{t('my_complaints')}</h2>
          <TextToSpeech text={t('my_complaints')} />
        </div>
        <button 
          onClick={() => window.location.reload()} 
          className="filter-btn"
          style={{ marginLeft: 'auto' }}
        >
          🔄 {t('loading')}
        </button>
      </div>
      <div className="search-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder={t('search') + "..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-buttons">
          <button
            className={`filter-btn ${!statusFilter && "active"}`}
            onClick={() => setStatusFilter("")}
          >
            {t('all_complaints')}
          </button>
          <button
            className={`filter-btn ${statusFilter === "Pending" && "active"}`}
            onClick={() => setStatusFilter("Pending")}
          >
            {t('pending')}
          </button>
          <button
            className={`filter-btn ${
              statusFilter === "In Progress" && "active"
            }`}
            onClick={() => setStatusFilter("In Progress")}
          >
            {t('in_progress')}
          </button>
          <button
            className={`filter-btn ${statusFilter === "Resolved" && "active"}`}
            onClick={() => setStatusFilter("Resolved")}
          >
            {t('resolved')}
          </button>
          <button
            className={`filter-btn ${statusFilter === "Escalated" && "active"}`}
            onClick={() => setStatusFilter("Escalated")}
          >
            Escalated
          </button>
        </div>
      </div>

      <div className="grievance-table">
        <div className="table-header">
          <div>ID</div>
          <div>{t('title')}</div>
          <div>{t('category')}</div>
          <div>{t('date')}</div>
          <div>{t('status')}</div>
        </div>
        {filteredGrievances.length === 0 ? (
          <div className="empty-state">
            <p>{t('no_complaints')}</p>
          </div>
        ) : (
          filteredGrievances.map((g) => (
            <div key={g.id} className="table-row">
              <div>GR-{g.id.substring(0, 4)}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TranslatedText text={g.title} />
                <TranslatedSpeakButton text={g.title} />
              </div>
              <div><TranslatedText text={g.category} /></div>
              <div>
                {g.created_at?.toDate
                  ? g.created_at.toDate().toLocaleDateString()
                  : "-"}
              </div>
              <div>
                <span className={`status-badge status-${g.status.toLowerCase()}`}>
                  <TranslatedText text={g.status} />
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <div className="sidebar-brand">GRIEVANCE CELL</div>
        <ul className="sidebar-menu">
          <li className="sidebar-item">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab("summary");
              }}
              className={`sidebar-link ${
                activeTab === "summary" ? "active" : ""
              }`}
            >
              <svg
                className="sidebar-icon"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
              </svg>
              {t('dashboard')}
            </a>
          </li>
          <li className="sidebar-item">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab("submitGrievance");
              }}
              className={`sidebar-link ${
                activeTab === "submitGrievance" ? "active" : ""
              }`}
            >
              <svg
                className="sidebar-icon"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
              </svg>
              {t('submit_grievance')}
            </a>
          </li>
          <li className="sidebar-item">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab("myGrievances");
              }}
              className={`sidebar-link ${
                activeTab === "myGrievances" ? "active" : ""
              }`}
            >
              <svg
                className="sidebar-icon"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
              </svg>
              {t('my_grievances')}
            </a>
          </li>
        </ul>
      </div>
      <div className="main-content">
        <div className="header" style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '24px 32px',
          borderRadius: '12px',
          marginBottom: '24px',
          boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div style={{ flex: 1 }}>
              <h1 style={{
                color: 'white',
                fontSize: '1.8rem',
                fontWeight: '700',
                margin: '0 0 8px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                👋 {t('welcome')}!
              </h1>
              <p style={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '1rem',
                margin: '0 0 4px 0',
                fontWeight: '500'
              }}>
                {user.email}
              </p>
              <p style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '0.9rem',
                margin: '0',
                fontStyle: 'italic'
              }}>
                💬 {t('submit_grievance')} • {t('track_status')} • {t('get_help')}
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
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)'
              }}
              onMouseOver={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              🚪 {t('logout')}
            </button>
          </div>
        </div>

        {activeTab === "summary" && renderSummary()}
        {activeTab === "submitGrievance" && renderSubmitGrievance()}
        {activeTab === "myGrievances" && renderMyGrievances()}
      </div>
    </div>
  );
};

export default StudentDashboard;
