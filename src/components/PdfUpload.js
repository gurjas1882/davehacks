import React, { useState } from 'react';
import { Document, Page } from 'react-pdf';

function PdfUpload({ onFileSelected, selectedFile }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  function handleFileChange(event) {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      onFileSelected(file);
    }
  }

  return (
    <div>
      <input type="file" accept=".pdf" onChange={handleFileChange} />
      {selectedFile && (
        <div>
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
    </div>
  );
}

export default PdfUpload;
