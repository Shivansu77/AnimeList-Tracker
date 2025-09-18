const { GoogleGenerativeAI } = require('@google/generative-ai');
const Anime = require('../models/Anime');

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate AI-powered anime recommendations
 * @param {Object} userProfile - User's profile and preferences
 * @param {Array} userWatchlist - User's watchlist with ratings
 * @returns {Promise<Array>} - Array of recommended anime
 */
const generateRecommendations = async (userProfile, userWatchlist) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    // Prepare user preferences summary
    const preferences = {
      topGenres: userProfile.topGenres,
      preferredTypes: userProfile.preferredTypes,
      avgRating: userProfile.avgRating,
      totalWatched: userWatchlist.length,
      completionRate: userProfile.completionRate
    };

    // Get recent anime for context
    const recentAnime = await Anime.find()
      .sort({ releaseDate: -1 })
      .limit(20)
      .select('title genres type averageRating description');

    // Get top-rated anime for fallback
    const topRatedAnime = await Anime.find({ averageRating: { $gte: 7 } })
      .sort({ averageRating: -1, totalRatings: -1 })
      .limit(10)
      .select('title genres type averageRating');

    // Prepare prompt for Gemini
    const prompt = `
      You are an AI anime recommendation expert. Based on the following user preferences and watch history, 
      recommend 12 anime titles from the provided list that the user might enjoy.
      
      User Preferences:
      - Top Genres: ${preferences.topGenres.join(', ')}
      - Average Rating: ${preferences.avgRating.toFixed(1)}/10
      - Total Anime Watched: ${preferences.totalWatched}
      - Completion Rate: ${(preferences.completionRate * 100).toFixed(0)}%
      
      Recent Anime (for context):
      ${recentAnime.map(a => `${a.title} (${a.type}, ${a.averageRating}/10)`).join('\n')}
      
      Top Rated Anime (for fallback):
      ${topRatedAnime.map(a => `${a.title} (${a.genres.join(', ')})`).join('\n')}
      
      Please provide your recommendations as a JSON array of objects with the following structure:
      [
        {
          "title": "Anime Title",
          "reason": "Why this is recommended",
          "confidence": 0.8
        }
      ]
      
      Focus on matching the user's preferred genres and rating patterns. 
      Include a mix of popular and niche titles, and explain your reasoning for each recommendation.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the response and validate it
    try {
      const recommendations = JSON.parse(text);
      if (!Array.isArray(recommendations)) {
        throw new Error('Invalid response format from AI');
      }
      return recommendations;
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      throw new Error('Failed to process AI recommendations');
    }
  } catch (error) {
    console.error('Error generating AI recommendations:', error);
    throw error;
  }
};

module.exports = {
  generateRecommendations
};
