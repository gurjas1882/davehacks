import React from 'react';
import { useNavigate } from 'react-router-dom';

function QuestionChoicePage() {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Choose Action</h1>
      <button onClick={() => navigate('/ask-question')}>Ask a Question</button>
      <button onClick={() => navigate('/test')}>Test Your Knowledge</button>
    </div>
  );
}

export default QuestionChoicePage;
