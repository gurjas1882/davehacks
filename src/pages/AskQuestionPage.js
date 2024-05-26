import React, { useContext } from 'react';
import { AppContext } from '../contexts/AppContext';

function AskQuestionPage() {
  const { extractedText, question, setQuestion, answer, setAnswer, loading, setLoading } = useContext(AppContext);

  const handleAskQuestion = async () => {
    if (!extractedText || !question) return;
    setLoading(true);

    try {
      const response = await fetch('https://api.openai.com/v1/engines/davinci-codex/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer YOUR_OPENAI_API_KEY`
        },
        body: JSON.stringify({
          prompt: `Context: ${extractedText}\nQuestion: ${question}\nAnswer:`,
          max_tokens: 150,
          n: 1,
          stop: null,
          temperature: 0.7,
        })
      });

      const data = await response.json();
      setAnswer(data.choices[0].text.trim());
    } catch (error) {
      console.error('Error asking question:', error);
      setAnswer('Error getting answer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
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
