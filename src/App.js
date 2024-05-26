import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import PdfUploadPage from './pages/PdfUploadPage';
import QuestionChoicePage from './pages/QuestionChoicePage';
import AskQuestionPage from './pages/AskQuestionPage';
import TestKnowledgePage from './pages/TestKnowledgePage';
import './App.css';

function App() {
  return (
    <AppProvider>
      <Router>
  <Routes>
    <Route path="/" element={<PdfUploadPage />} />
    <Route path="/choice" element={<QuestionChoicePage />} />
    <Route path="/test" element={<TestKnowledgePage />} />
    <Route path="/ask-question" element={<AskQuestionPage />} />

  </Routes>
</Router>
    </AppProvider>
  );
}

export default App;
