// Reusable form for submitting grievances
import React, { useState, useEffect } from "react";
import { useTranslation } from "../hooks/useTranslation";
import TextToSpeech from "./TextToSpeech";
import SpeechToText from "./SpeechToText";
import "./Dashboard.css";

const GrievanceForm = ({ onSubmit }) => {
  const { t, currentLanguage } = useTranslation();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Category keywords mapping
  const categoryKeywords = {
    Academic: [
      "grade",
      "exam",
      "professor",
      "class",
      "course",
      "lecture",
      "assignment",
      "teacher",
      "study",
      "marks",
      "syllabus",
    ],
    Infrastructure: [
      "building",
      "classroom",
      "laboratory",
      "lab",
      "facilities",
      "maintenance",
      "repair",
      "equipment",
      "projector",
      "ac",
      "fan",
    ],
    Hostel: [
      "room",
      "mess",
      "food",
      "accommodation",
      "warden",
      "hygiene",
      "cleaning",
      "water",
      "electricity",
      "wifi",
    ],
    Library: [
      "book",
      "journal",
      "librarian",
      "circulation",
      "return",
      "fine",
      "reading",
      "reference",
      "digital",
    ],
    Transport: [
      "bus",
      "vehicle",
      "timing",
      "route",
      "driver",
      "schedule",
      "late",
      "transport",
      "parking",
    ],
    Administrative: [
      "fee",
      "document",
      "certificate",
      "administration",
      "staff",
      "office",
      "payment",
      "id card",
      "admission",
    ],
  };

  const suggestCategory = () => {
    const combinedText = `${title} ${description}`.toLowerCase();
    let bestMatch = {
      category: "",
      matches: 0,
    };

    // Check each category's keywords against the text
    Object.entries(categoryKeywords).forEach(([categoryName, keywords]) => {
      const matchCount = keywords.reduce((count, keyword) => {
        return count + (combinedText.includes(keyword.toLowerCase()) ? 1 : 0);
      }, 0);

      if (matchCount > bestMatch.matches) {
        bestMatch = {
          category: categoryName,
          matches: matchCount,
        };
      }
    });

    // Only suggest if we found matches
    if (bestMatch.matches > 0) {
      setCategory(bestMatch.category);
      // Show feedback to user
      const feedback = document.createElement("div");
      feedback.textContent = `Suggested category: ${bestMatch.category}`;
      feedback.className = "suggestion-feedback";
      document.body.appendChild(feedback);
      setTimeout(() => feedback.remove(), 3000);
    } else {
      // Show message when no category can be suggested
      const feedback = document.createElement("div");
      feedback.textContent = "No matching category found. Please add more details.";
      feedback.className = "suggestion-feedback";
      feedback.style.background = "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)";
      document.body.appendChild(feedback);
      setTimeout(() => feedback.remove(), 3000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!title.trim() || !description.trim() || !category) {
      alert("Please fill in all required fields.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSubmit({
        title,
        description,
        category,
        attachment,
      });
      
      // Show success feedback
      const feedback = document.createElement("div");
      feedback.textContent = "✅ Grievance submitted successfully!";
      feedback.className = "suggestion-feedback";
      feedback.style.background = "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)";
      document.body.appendChild(feedback);
      setTimeout(() => feedback.remove(), 3000);
      
      // Reset form
      setTitle("");
      setDescription("");
      setCategory("");
      setAttachment(null);
      
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = "";
    } catch (error) {
      console.error("Error submitting grievance:", error);
      alert("Failed to submit grievance. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Enable suggest button only when there's content
  const canSuggest = title.length > 0 || description.length > 0;

  return (
    <div className="form-container">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>{t('submit_complaint')}</h2>
        <TextToSpeech text={t('submit_complaint')} />
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>{t('complaint_title_label')}</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('complaint_title')}
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>{t('complaint_description_label')}</label>
          
          {/* Speech-to-Text Input */}
          <div style={{ marginBottom: '12px' }}>
            <SpeechToText
              onResult={(transcript) => {
                // Append to description (or replace if empty)
                setDescription(prev => prev ? `${prev} ${transcript}` : transcript);

                // Show success feedback
                const feedback = document.createElement("div");
                feedback.textContent = `✅ Transcribed: "${transcript}"`;
                feedback.className = "suggestion-feedback";
                feedback.style.background = "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)";
                document.body.appendChild(feedback);
                setTimeout(() => feedback.remove(), 3000);
              }}
              placeholder={`Speak in ${currentLanguage.toUpperCase()}...`}
              className="speech-input-form"
            />
          </div>
          
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('complaint_description')}
            required
            className="form-textarea"
            rows="4"
          />
        </div>

        <div className="form-group">
          <label>{t('category_label')}</label>
          <div className="category-section">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="form-select"
            >
              <option value="">{t('select_category')}</option>
              {Object.keys(categoryKeywords).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={suggestCategory}
              className="suggest-button"
              disabled={!canSuggest}
            >
              {t('suggest_category')} ✨
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>{t('attach_files')}</label>
          <input
            type="file"
            onChange={(e) => setAttachment(e.target.files[0])}
            accept="image/*"
            className="form-input"
          />
          <small>{t('max_file_size')}</small>
        </div>

        <button 
          type="submit" 
          className="submit-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? t('submitting') : t('submit_complaint')}
        </button>
      </form>
    </div>
  );
};

export default GrievanceForm;
