import React, { useState, useEffect, useRef } from 'react';
import PdfUpload from './components/PdfUpload';
import { OpenAI } from 'openai';
import { pdfjs } from 'react-pdf';
import MicRecorder from 'mic-recorder-to-mp3';
import axios from 'axios';
import './App.css';


pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

function App() {
  // States for file handling, text extraction, and question/answer
  const [selectedFile, setSelectedFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // States for recording and feedback
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadUrl, setUploadUrl] = useState(null);

  // Replace with your actual API keys
  const openaiApiKey = 'sk-proj-lO7nyW3WFsziI4Rz0ewdT3BlbkFJSzknsMcjDk3KUO1o1I4m';
  const assemblyAiApiKey = 'be47d7ac64e84b389e4526e260aef40f';

  const recorder = useRef(null);

  // Initialize the recorder when the component mounts
  useEffect(() => {
    recorder.current = new MicRecorder({ bitRate: 128 });
  }, []);

  const handleFileSelected = async (file) => {
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const pdf = await pdfjs.getDocument(e.target.result).promise;
        const totalPages = pdf.numPages;
        let extractedText = '';
        for (let i = 1; i <= totalPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          extractedText += textContent.items.map(item => item.str).join(' ');
        }
        setExtractedText(extractedText);
      } catch (error) {
        console.error('Error parsing PDF:', error);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleAskQuestion = async (questionToAsk = question) => {
    if (!extractedText || !questionToAsk || !openaiApiKey) return;
    setLoading(true);

    const openai = new OpenAI({
      apiKey: openaiApiKey,
      dangerouslyAllowBrowser: true // Disable safety check (not recommended for production)
    });

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          {
            role: "user",
            content: `Answer the question based on the context below:\n\nContext:\n${extractedText}\n\nQuestion: ${questionToAsk}\n\nAnswer:`,
          },
        ],
      });
      setAnswer(completion.choices[0].message.content);
    } catch (error) {
      console.error('Error fetching response from OpenAI:', error);
      setAnswer('Error getting answer. Please check your API key and try again.');
    } finally {
      setLoading(false);
    }
  };


  const handleGenerateQuestions = async () => {
    if (!extractedText || !openaiApiKey) return;
    setLoading(true);

    const openai = new OpenAI({
      apiKey: openaiApiKey,
      dangerouslyAllowBrowser: true 
    });

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          {
            role: "user",
            content: `Generate 5 relevant questions based on the context below:\n\nContext:\n${extractedText}\n\nQuestions:`,
          },
        ],
      });
      const questions = completion.choices[0].message.content.split('\n').filter(Boolean);
      setGeneratedQuestions(questions);
    } catch (error) {
      console.error('Error generating questions:', error);
    } finally {
      setLoading(false);
    }
  };



  const startRecording = () => {
    recorder.current.start().then(() => {
      setIsRecording(true);
    }).catch(error => {
      console.error('Error starting recording:', error);
    });
  };

  async function stopRecording() {
    try {
      const [buffer, blob] = await recorder.current.stop().getMp3();
      setIsRecording(false);
      setLoading(true);
  
      if (blob.type !== 'audio/mp3') {
        console.error('Invalid audio recording. Ensure it is in MP3 format.');
        setLoading(false);
        return;
      }
  
      const audioFile = new File(buffer, 'myFile.mp3', { type: blob.type, lastModified: Date.now() });
      setRecordedAudio(audioFile);
  
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Audio = reader.result.split(',')[1]; // Extract the base64 data
  
        try {
          console.log('Sending base64 audio to Google Cloud Speech-to-Text API...');
  
          const response = await fetch(
            'https://speech.googleapis.com/v1/speech:recognize?key=AIzaSyCRtBybZoz00ovnRotQvLVTfZAgOjt2aUY', // Replace with your actual API key
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                audio: { content: base64Audio },
                config: {
                  encoding: 'MP3', // Or try LINEAR16 if needed
                  sampleRateHertz: 16000, // Or adjust to your actual sample rate
                  languageCode: 'en-US',
                },
              }),
            }
          );
  
          // Log the raw response for debugging
          console.log('API response:', response); 
  
          // Check for errors
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              `Google Speech-to-Text API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`
            );
          }
  
          const data = await response.json();
  
          // Check if results exist
          if (!data.results || data.results.length === 0) {
            console.error('No transcription results found in API response:', data);
            return; // or throw an error here if you prefer
          }
  
          const transcription = data.results[0].alternatives[0].transcript;
          console.log('Transcription:', transcription);
          handleGradeResponse(transcription);
        } catch (transcriptionError) {
          console.error('Transcription error:', transcriptionError);
          // Handle the error (e.g., display an error message to the user)
        } finally {
          setLoading(false);
        }
      };
  
      reader.readAsDataURL(audioFile);
    } catch (recordingError) {
      console.error('Error stopping recording:', recordingError);
      setLoading(false);
    }
  }
  





  const handleGradeResponse = async (transcription) => {
    if (!transcription || !openaiApiKey) return;
    setLoading(true);

    const openai = new OpenAI({
      apiKey: openaiApiKey,
      dangerouslyAllowBrowser: true 
    });

    const currentQuestion = generatedQuestions[currentQuestionIndex];

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          {
            role: "user",
            content: `Grade and provide feedback on the following response to a question, based on the context. 
        Give it a grading of the answer based on the context. If the answer is completely out of context, give a low score. If the answer is very relevent, give a better score. Give it a grade out of 100 and provide a brief explanation of the grade.

        Context:\n${extractedText}\n
        Question: ${currentQuestion}\n
        Response: ${transcription}\n\n
        Grade:`,
          },
        ],
      });
      setFeedback(completion.choices[0].message.content);
    } catch (error) {
      console.error('Error getting feedback from OpenAI:', error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      <h1>StudyBuddy</h1>

      <PdfUpload onFileSelected={handleFileSelected} selectedFile={selectedFile} />

      {extractedText && (
        <div>
          <input
            type="text"
            placeholder="Ask a question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <button onClick={handleAskQuestion} disabled={loading}>
            {loading ? 'Loading...' : 'Ask'}
          </button>

          <button onClick={handleGenerateQuestions} disabled={loading}>
            Generate Questions
          </button>

          {generatedQuestions.length > 0 && (
            <div>
              <h3>Question {currentQuestionIndex + 1}:</h3>
              <p>{generatedQuestions[currentQuestionIndex]}</p>
              <button onClick={startRecording} disabled={isRecording}>
                Record
              </button>
              <button onClick={stopRecording} disabled={!isRecording}>
                Stop
              </button>
              {recordedAudio && (
                <div>
                  <audio src={URL.createObjectURL(recordedAudio)} controls />
                  <button onClick={handleGradeResponse}>Get Feedback</button>
                </div>
              )}
              {feedback && (
                <div>
                  <h4>Feedback:</h4>
                  <p>{feedback}</p>
                </div>
              )}
              <button onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                      disabled={currentQuestionIndex === generatedQuestions.length - 1 || isRecording || loading}>
                Next Question
              </button>
            </div>
          )}

          {answer && (
            <div>
              <h3>Answer:</h3>
              <p>{answer}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;