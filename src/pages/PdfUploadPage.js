import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../contexts/AppContext";
import { Document, Page, pdfjs } from "react-pdf";
import "./PdfUploadPage.css";
import uploadIcon from "../assets/upload.svg";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

function PdfUploadPage() {
  const { setSelectedFile, setExtractedText, selectedFile, extractedText } =
    useContext(AppContext);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const navigate = useNavigate();

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const pdf = await pdfjs.getDocument(e.target.result).promise;
          const totalPages = pdf.numPages;
          let extractedText = "";
          for (let i = 1; i <= totalPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            extractedText += textContent.items
              .map((item) => item.str)
              .join(" ");
          }
          setExtractedText(extractedText);
          setNumPages(totalPages); // Set the numPages here
        } catch (error) {
          console.error("Error parsing PDF:", error);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const handleNext = () => {
    navigate("/choice");
  };

  return (
    <div className="pdf-upload-page">
      <h1 className="logo">studybuddy</h1>
      {/* Use an image and label for the file input */}
      {!numPages && (
        <div className="upload-container">
          <label htmlFor="file-upload" className="file-upload-label">
            <img src={uploadIcon} alt="Upload PDF" className="upload-icon" />
          </label>
          <input
            id="file-upload"
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="file-upload-input"
          />
          <h1 className="pdf-upload-title">upload your note</h1>
        </div>
      )}

      {numPages && (
        <div className="pdf-navigation">
          <p>
            Page {pageNumber} of {numPages}
          </p>
          <Document file={selectedFile} onLoadSuccess={onDocumentLoadSuccess}>
            <Page pageNumber={pageNumber} />
          </Document>
          <button
            type="button"
            disabled={pageNumber <= 1}
            onClick={() => setPageNumber(pageNumber - 1)}
          >
            Last Page
          </button>
          <button
            type="button"
            disabled={pageNumber >= numPages}
            onClick={() => setPageNumber(pageNumber + 1)}
          >
            Next Page
          </button>
        </div>
      )}
      {numPages && <button onClick={handleNext} className="continue">Continue</button>}
    </div>
  );
}

export default PdfUploadPage;
