const express = require('express');
const cors = require('cors');
const fs = require('fs');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const client = require('./dbconnect'); // your PG client
const OpenAI = require('openai'); // Updated import for new SDK
const app = express();

// Replace with your actual valid API key here or use env variable
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' }); // temp upload folder

// Home route
app.get('/', (req, res) => {
  res.send('Hello World!');
});


// Helper function to split text into chunks of maxChunkLength characters
function chunkText(text, maxChunkLength = 1000) {
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    chunks.push(text.slice(start, start + maxChunkLength));
    start += maxChunkLength;
  }
  return chunks;
}

app.post('/add_pdf_charvector', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No PDF file uploaded' });

    const pdfBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(pdfBuffer);
    const text = pdfData.text;

    if (!text || text.length === 0) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'No text extracted from PDF' });
    }

    // Split text into chunks to avoid token limits
    const chunks = chunkText(text, 1000);

    const insertQuery = `
      INSERT INTO vector_data (data, original_text)
      VALUES ($1::vector, $2)
      RETURNING id;
    `;

    const insertedIds = [];

    for (const chunk of chunks) {
      // Get OpenAI embedding for each chunk
      const embeddingResponse = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: chunk,
      });

      const embeddingVector = embeddingResponse.data[0].embedding; // float array
      const vectorLiteral = `[${embeddingVector.join(',')}]`;

      // Insert vector and chunk text into DB
      const result = await client.query(insertQuery, [vectorLiteral, chunk]);
      insertedIds.push(result.rows[0].id);
    }

    fs.unlinkSync(req.file.path);

    res.status(201).json({ message: 'PDF text chunks and embeddings added', insertedIds });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.get('/ask', async (req, res) => {
  try {
    const question = req.query.question;
    if (!question) {
      return res.status(400).json({ error: 'Question parameter is required' });
    }

    // 1. Get OpenAI embedding vector for the question
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: question,
    });
    const questionEmbedding = embeddingResponse.data[0].embedding;
    const vectorLiteral = `[${questionEmbedding.join(',')}]`;

    // 2. Query DB for the closest vectors (smallest distance)
    const similarityQuery = `
      SELECT original_text, data <=> $1::vector AS distance
      FROM vector_data
      ORDER BY distance ASC
      LIMIT 3;
    `;

    const result = await client.query(similarityQuery, [vectorLiteral]);
    const matchedTexts = result.rows.map(row => row.original_text).join('\n\n---\n\n');

    if (!matchedTexts.trim()) {
      return res.json({
        question,
        answer: "Sorry, I don't have information about that."
      });
    }

    // 3. Ask GPT with retrieved text chunks as context
    const messages = [
      {
        role: "system",
        content: `You are a helpful assistant that answers questions only based on the following PDF excerpts or related to it.
If the answer is not contained in the excerpts, say "Sorry, I don't have information about that."`,
      },
      {
        role: "user",
        content: `${matchedTexts}\n\nQuestion: ${question}\nAnswer:`,
      }
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
      max_tokens: 500,
      temperature: 0.7,
    });

    const answer = completion.choices[0].message.content.trim();

    res.json({ question, answer });
  } catch (error) {
    console.error('Error in /ask:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT || 3000}` );
});