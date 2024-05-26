import React from 'react';
import { useNavigate } from 'react-router-dom';
import "./QuestionChoicePage.css";


function QuestionChoicePage() {
  const navigate = useNavigate();

  return (
    <div className='optionsContainer'>
      <h1 className="logo" onClick={() => navigate('/')}>studybuddy</h1>
      <h1 className='optionsTitle'>what would you like to do today?</h1>
      <div>
      <button className="optionQuestion" onClick={() => navigate('/ask-question')}>Ask a Question</button>
      <button className='optionTest' onClick={() => navigate('/test')}>Test Your Knowledge</button></div>
    </div>
  );
}

export default QuestionChoicePage;
