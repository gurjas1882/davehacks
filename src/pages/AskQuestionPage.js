import React, { useContext } from 'react';
import { AppContext } from '../contexts/AppContext';
import "./AskQuestionPage.css";
import openai from 'openai'; // Import openai module

function AskQuestionPage() {
  const { extractedText, question, setQuestion, answer, setAnswer, loading, setLoading } = useContext(AppContext);

  const handleAskQuestion = async () => {
    if (!extractedText) return;
    setLoading(true);

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          {
            role: "user",
            content: `Context: ${extractedText}\nQuestion: ${question}\nAnswer:`,
          },
        ],
      });
      const questions = completion.choices[0].message.content.split('\n').filter(Boolean);
      setQuestion(questions[0]); // Assuming you want to set the first generated question as the user's question
    } catch (error) {
      console.error('Error generating questions:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='questionContainer'>
      <h1 className="logo">studybuddy</h1>
      <h1>Ask a Question</h1>
      <input
        type="text"
        placeholder="Ask a question..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />
      <button onClick={handleAskQuestion} disabled={loading}>
        {loading ? 'Loading...' : 'Ask'}
      </button>
      {answer && (
        <div>
          <h3>Answer:</h3>
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
}

export default AskQuestionPage;
