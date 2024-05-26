import React from 'react';
import { useNavigate } from 'react-router-dom';
import "./QuestionChoicePage.css";


function QuestionChoicePage() {
  const navigate = useNavigate();

  return (
    <div>
      <h1 className="logo">studybuddy</h1>
      <h1>Choose Action</h1>
      <button onClick={() => navigate('/ask-question')}>Ask a Question</button>
      <button onClick={() => navigate('/test')}>Test Your Knowledge</button>
    </div>
  );
}

export default QuestionChoicePage;
