import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';
import { Document, Page, pdfjs } from 'react-pdf';
import './PdfUploadPage.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

function PdfUploadPage() {
  const { setSelectedFile, setExtractedText, selectedFile, extractedText } = useContext(AppContext);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const navigate = useNavigate();
  
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
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
          setNumPages(totalPages); // Set the numPages here
        } catch (error) {
          console.error('Error parsing PDF:', error);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const handleNext = () => {
    navigate('/choice');
  };

  return (
    <div className="pdf-upload-page">
      <h1 className="pdf-upload-title">Upload PDF</h1>

      {/* Conditionally render the file input */}
      {!numPages && (
        <input className="pdf-upload-input" type="file" accept=".pdf" onChange={handleFileChange} />
      )}

      {numPages && (
        <div className="pdf-navigation">
          <p>Page {pageNumber} of {numPages}</p>
          <Document file={selectedFile} onLoadSuccess={onDocumentLoadSuccess}>
            <Page pageNumber={pageNumber} />
          </Document>
          <button
            type="button"
            disabled={pageNumber <= 1}
            onClick={() => setPageNumber(pageNumber - 1)}
          >
            Previous
          </button>
          <button
            type="button"
            disabled={pageNumber >= numPages}
            onClick={() => setPageNumber(pageNumber + 1)}
          >
            Next
          </button>
        </div>
      )}
      {numPages && ( // Show "Next" button only when PDF is loaded
        <button onClick={handleNext}>Next</button>
      )}
    </div>
  );
}

export default PdfUploadPage;
