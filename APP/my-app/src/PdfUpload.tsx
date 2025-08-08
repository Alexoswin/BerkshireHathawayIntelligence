import React, { useState, ChangeEvent, FormEvent } from 'react';

function PdfUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [response, setResponse] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      alert('Please select a PDF file');
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append('pdf', file); // multer expects field 'pdf'

    try {
      const res = await fetch('http://localhost:3000/add_pdf_charvector', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      setResponse(data);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  // Inline CSS styles
  const containerStyle: React.CSSProperties = {
    maxWidth: 400,
    margin: '30px auto',
    padding: 20,
    border: '1px solid #ccc',
    borderRadius: 8,
    fontFamily: 'Arial, sans-serif',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  };

  const formStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  };

  const inputStyle: React.CSSProperties = {
    padding: 8,
    fontSize: 16,
  };

  const buttonStyle: React.CSSProperties = {
    padding: '10px 16px',
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    backgroundColor: '#007bff',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  };

  const buttonDisabledStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#6c757d',
    cursor: 'not-allowed',
  };

  const responseStyle: React.CSSProperties = {
    marginTop: 20,
    padding: 12,
    border: '1px solid #28a745',
    borderRadius: 6,
    backgroundColor: '#d4edda',
    color: '#155724',
    whiteSpace: 'pre-wrap',
    animation: 'fadeIn 1s ease-in forwards',
    opacity: 0,
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ textAlign: 'center' }}>Upload PDF</h2>
      <form onSubmit={handleSubmit} style={formStyle}>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          style={inputStyle}
          disabled={uploading}
        />
        <button
          type="submit"
          style={uploading ? buttonDisabledStyle : buttonStyle}
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </form>
      {response && (
        <pre
          style={{
            ...responseStyle,
            animationPlayState: 'running',
            opacity: 1,
          }}
        >
          {JSON.stringify(response, null, 2)}
        </pre>
      )}

      {/* Inline keyframe animation */}
      <style>
        {`
          @keyframes fadeIn {
            to {
              opacity: 1;
            }
          }

          button:hover:enabled {
            background-color: #0056b3;
          }
        `}
      </style>
    </div>
  );
}

export default PdfUpload;
