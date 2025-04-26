const express = require('express');
const axios = require('axios');
const cors = require('cors');
const cheerio = require('cheerio');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Genius API token
const GENIUS_API_TOKEN = process.env.GENIUS_API_TOKEN || 'YOUR_GENIUS_API_TOKEN';

// Endpoint to search for lyrics
app.get('/api/lyrics', async (req, res) => {
  const { song } = req.query;
  
  if (!song) {
    return res.status(400).json({ error: 'No song query provided' });
  }
  
  try {
    // Search for the song on Genius
    const searchResponse = await axios.get('https://api.genius.com/search', {
      params: { q: song },
      headers: { 'Authorization': `Bearer ${GENIUS_API_TOKEN}` }
    });
    
    const hits = searchResponse.data.response.hits;
    
    if (hits.length === 0) {
      return res.status(404).json({ error: 'No results found' });
    }
    
    // Get the first result
    const firstHit = hits[0];
    const songInfo = {
      title: firstHit.result.title,
      artist: firstHit.result.primary_artist.name,
      album: firstHit.result.album?.name || 'Unknown',
      releaseDate: firstHit.result.release_date_for_display || 'Unknown'
    };
    
    // Get the song URL to scrape lyrics
    const songUrl = firstHit.result.url;
    
    // Scrape the lyrics from the Genius page
    const lyricsResponse = await axios.get(songUrl);
    const $ = cheerio.load(lyricsResponse.data);
    
    // Extract lyrics - Genius stores lyrics in different containers depending on the page
    let lyrics = '';
    
    // Try different selectors that Genius might use
    const lyricsSelectors = [
      '[data-lyrics-container="true"]',
      '.lyrics',
      '.Lyrics__Container-sc-1ynbvzw-6'
    ];
    
    for (const selector of lyricsSelectors) {
      const lyricsElements = $(selector);
      if (lyricsElements.length > 0) {
        lyricsElements.each((i, el) => {
          lyrics += $(el).text() + '\n\n';
        });
        break;
      }
    }
    
    if (!lyrics) {
      return res.status(404).json({ error: 'Could not extract lyrics' });
    }
    
    // Return the song info and lyrics
    return res.json({
      ...songInfo,
      lyrics: lyrics.trim()
    });
    
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ error: 'An error occurred while fetching lyrics' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});