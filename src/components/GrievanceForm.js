// Reusable form for submitting grievances
import React, { useState } from "react";

const GrievanceForm = ({ onSubmit }) => {
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState("Medium");
  const [attachment, setAttachment] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ category, description, urgency, attachment });
    setCategory("");
    setDescription("");
    setUrgency("Medium");
    setAttachment("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-xl shadow-lg w-full max-w-lg mx-auto"
    >
      <h2 className="text-2xl font-bold text-blue-700 mb-4">
        Submit Grievance
      </h2>
      <input
        type="text"
        placeholder="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="border border-blue-200 rounded-md p-3 mb-3 w-full focus:outline-none focus:border-blue-700 text-base"
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="border border-blue-200 rounded-md p-3 mb-3 w-full focus:outline-none focus:border-blue-700 text-base"
      />
      <select
        value={urgency}
        onChange={(e) => setUrgency(e.target.value)}
        className="border border-blue-200 rounded-md p-3 mb-3 w-full focus:outline-none focus:border-blue-700 text-base bg-blue-50"
      >
        <option>Low</option>
        <option>Medium</option>
        <option>High</option>
      </select>
      <input
        type="text"
        placeholder="Attachment URL"
        value={attachment}
        onChange={(e) => setAttachment(e.target.value)}
        className="border border-blue-200 rounded-md p-3 mb-3 w-full focus:outline-none focus:border-blue-700 text-base"
      />
      <button
        type="submit"
        className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 w-full rounded-md text-lg transition-colors"
      >
        Submit
      </button>
    </form>
  );
};

export default GrievanceForm;
