## Setup & Installation

### Prerequisites

- Node.js v16+
- PostgreSQL with `pgvector` extension installed
- OpenAI API key
- npm or yarn

### Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/your-repo.git
   cd your-repo

2. Setup and start the backend server:
 
    cd APP/server
    npm install
    node app.js
    
3. In a new terminal window/tab, setup and start the frontend:

    cd APP/my-app
    npm install
    npm run dev

# PDF Vector Search & Q&A API

## Overview

This is a Node.js Express backend application that allows users to:

- Upload PDF documents.
- Extract and chunk text content from PDFs.
- Convert text chunks into fixed-length numeric vectors.
- Store vectors and chunks in a PostgreSQL database (using pgvector extension).
- Query the database for relevant text chunks based on user questions.
- Generate answers using OpenAI GPT-4o-mini model strictly based on stored PDF content.

---

## Features

- PDF upload and text extraction.
- Text chunking to handle large documents.
- Vector storage and similarity search in Postgres.
- AI-powered question answering using OpenAI.
- Secure API key management using `.env` file.
- CORS enabled for cross-origin requests.

---
   
