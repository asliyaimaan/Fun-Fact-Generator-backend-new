// Loading the dependencies
require('dotenv').config(); // Load API key from .env
const express = require('express');
const axios = require('axios');
const path = require('path');
const cors = require('cors');
const app = express();
const PORT = 3000;

// ✅ Define allowed origins
const allowedOrigins = [
  'https://funfactgenerator123.netlify.app','https://funfactgenerator456.netlify.app',
  'https://cardgenerator123.netlify.app'
];

// ✅ Simple CORS setup
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST']
}));

// ✅ Serve static frontend files from "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Define the /funfact route
app.get('/funfact', async (req, res) => {
  try {
    // Read theme from query string, default to "random" if not provided
    const theme = (req.query.theme || 'random').toLowerCase();

    // Load API key from .env
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API_KEY not found in .env file.");
    }

    // Correct Gemini API endpoint
    const endpoint = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    // Send request to Gemini (only 1 fun fact, no numbering or intro)
    const response = await axios.post(
      endpoint,
      {
        contents: [
          {
            parts: [
              { text: `Give me 1 short fun fact about ${theme}. Do not include introductions or numbering.` }
            ]
          }
        ],
        generationConfig: {
          temperature: 1.5,      // controls creativity
          maxOutputTokens: 100,  // limit length
          topP: 1,
          topK: 1
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    // ✅ Extract the actual text content from Gemini's response
    const fact = response.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

    console.log("Fun Fact from API:", fact);

    // ✅ Fallback if Gemini returns empty text
    const finalFact = fact.length > 5 ? fact : `No fun fact found for ${theme}. Please try again.`;

    // ✅ Send JSON back to frontend
    res.json({ theme, fact: finalFact });

  } catch (error) {
    console.error('Error fetching fun fact:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch fun fact' });
  }
});

// ✅ Server Listener
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});









