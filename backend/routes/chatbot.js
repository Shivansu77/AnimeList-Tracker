const express = require('express');
const router = express.Router();

// Simple anime chatbot with comprehensive responses
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || !message.trim()) {
      return res.json({ 
        response: "Please ask me something about anime! I can help with recommendations, genres, or what to watch next.",
        timestamp: new Date() 
      });
    }
    
    const lowerMessage = message.toLowerCase().trim();
    let response = '';
    
    // Gym/Fitness anime
    if (lowerMessage.includes('gym') || lowerMessage.includes('fitness') || lowerMessage.includes('workout') || lowerMessage.includes('muscle')) {
      response = "🏋️ For gym/fitness anime, I highly recommend:\n\n• **How Heavy Are the Dumbbells You Lift?** - Perfect gym motivation with actual workout tips!\n• **Kengan Ashura** - Intense martial arts and muscle action\n• **Baki** - Extreme muscle training and fighting\n• **Hajime no Ippo** - Boxing training that'll inspire your workouts\n\nThese will definitely get you pumped! 💪";
    }
    // Sports anime
    else if (lowerMessage.includes('sports') || lowerMessage.includes('basketball') || lowerMessage.includes('volleyball') || lowerMessage.includes('soccer')) {
      response = "🏐 Great sports anime recommendations:\n\n• **Haikyuu!!** - Amazing volleyball with incredible character development\n• **Kuroko no Basketball** - Supernatural basketball skills\n• **Free!** - Swimming anime with great animation\n• **Yuri on Ice** - Beautiful figure skating story\n• **Blue Lock** - Intense soccer/football competition\n\nWhich sport interests you most?";
    }
    // Action anime
    else if (lowerMessage.includes('action') || lowerMessage.includes('fight') || lowerMessage.includes('battle')) {
      response = "⚔️ Top action anime picks:\n\n• **Attack on Titan** - Epic battles against titans\n• **Demon Slayer** - Stunning sword fights and animation\n• **Jujutsu Kaisen** - Modern supernatural battles\n• **One Piece** - Epic pirate adventures\n• **Naruto** - Classic ninja action\n\nThese have some of the best fight scenes in anime!";
    }
    // Romance anime
    else if (lowerMessage.includes('romance') || lowerMessage.includes('love') || lowerMessage.includes('romantic')) {
      response = "💕 Beautiful romance anime:\n\n• **Your Name** - Stunning romantic fantasy film\n• **A Silent Voice** - Emotional and heartwarming\n• **Toradora!** - Classic romantic comedy\n• **Kaguya-sama: Love is War** - Hilarious romantic mind games\n• **Weathering with You** - Another beautiful Makoto Shinkai film\n\nPrepare for all the feels! 🥺";
    }
    // Comedy anime
    else if (lowerMessage.includes('comedy') || lowerMessage.includes('funny') || lowerMessage.includes('laugh')) {
      response = "😂 Hilarious comedy anime:\n\n• **One Punch Man** - Superhero parody that's absolutely hilarious\n• **Gintama** - Comedy gold with amazing characters\n• **Konosuba** - Isekai comedy that parodies the genre\n• **Nichijou** - Absurd slice-of-life comedy\n• **Grand Blue** - College diving club comedy\n\nThese will have you laughing non-stop!";
    }
    // Recommendations/suggestions
    else if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest') || lowerMessage.includes('what should i watch')) {
      response = "🎯 Here are my top recommendations for different moods:\n\n**New to anime?** Start with:\n• Death Note (psychological thriller)\n• Attack on Titan (action)\n• Your Name (romance)\n\n**Want something popular?**\n• Demon Slayer\n• My Hero Academia\n• Jujutsu Kaisen\n\n**Looking for classics?**\n• Fullmetal Alchemist: Brotherhood\n• Cowboy Bebop\n• Studio Ghibli films\n\nWhat genre interests you most?";
    }
    // Best anime
    else if (lowerMessage.includes('best anime') || lowerMessage.includes('top anime') || lowerMessage.includes('greatest')) {
      response = "🏆 The greatest anime of all time (IMO):\n\n**Top 5:**\n1. **Fullmetal Alchemist: Brotherhood** - Perfect storytelling\n2. **Attack on Titan** - Epic plot twists\n3. **Death Note** - Psychological masterpiece\n4. **One Piece** - Greatest adventure story\n5. **Spirited Away** - Miyazaki's masterpiece\n\n**Honorable mentions:** Demon Slayer, Your Name, Princess Mononoke, Cowboy Bebop\n\nEach of these is a masterpiece in its own way!";
    }
    // Beginner anime
    else if (lowerMessage.includes('beginner') || lowerMessage.includes('start') || lowerMessage.includes('new to anime')) {
      response = "🌟 Perfect anime for beginners:\n\n**Easy to get into:**\n• **Death Note** - Gripping psychological thriller\n• **Attack on Titan** - Action-packed with great story\n• **Your Name** - Beautiful romantic film\n• **Spirited Away** - Magical Ghibli film\n\n**Popular gateway anime:**\n• Demon Slayer\n• My Hero Academia\n• One Punch Man\n\nStart with any of these - they're all amazing entry points! What type of story do you usually enjoy?";
    }
    // Specific anime questions
    else if (lowerMessage.includes('naruto')) {
      response = "🍜 Naruto is a classic! If you like it, try:\n• **Boruto** (sequel)\n• **My Hero Academia** (similar hero journey)\n• **Black Clover** (underdog story)\n• **Jujutsu Kaisen** (modern ninja-like powers)";
    }
    else if (lowerMessage.includes('one piece')) {
      response = "🏴‍☠️ One Piece is the GOAT! Similar epic adventures:\n• **Fairy Tail** (guild adventures)\n• **Hunter x Hunter** (amazing world-building)\n• **Magi** (adventure and magic)\n• **Seven Deadly Sins** (group adventures)";
    }
    else if (lowerMessage.includes('attack on titan')) {
      response = "⚔️ Attack on Titan is incredible! Similar dark/intense anime:\n• **Tokyo Ghoul** (dark supernatural)\n• **Parasyte** (psychological horror)\n• **Vinland Saga** (historical warfare)\n• **86** (war and mechs)";
    }
    else if (lowerMessage.includes('opm') || lowerMessage.includes('one punch man')) {
      response = "👊 One Punch Man is AMAZING! It's a perfect parody of superhero anime with:\n\n• **Incredible animation** (especially Season 1)\n• **Hilarious comedy** that never gets old\n• **Epic fight scenes** despite the premise\n• **Great characters** like Genos and King\n\nDefinitely worth watching! If you like OPM, try:\n• **Mob Psycho 100** (same creator)\n• **The Disastrous Life of Saiki K** (similar comedy)\n• **Konosuba** (great parody anime)";
    }
    // Greetings
    else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      response = "👋 Hello there, anime fan! I'm your personal anime assistant!\n\nI can help you with:\n• 🎯 Anime recommendations\n• 📚 Genre suggestions\n• 🏆 Best anime lists\n• 🔍 Finding your next watch\n\nWhat kind of anime are you in the mood for today?";
    }
    // Thank you
    else if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
      response = "😊 You're very welcome! Happy to help you discover amazing anime! Feel free to ask me anything else about anime - I'm always here to help! 🎌";
    }
    // Default response
    else {
      response = "🤔 I'm here to help you discover amazing anime! Try asking me about:\n\n• **Recommendations** - \"recommend me some anime\"\n• **Genres** - \"action anime\" or \"romance anime\"\n• **Specific needs** - \"gym anime\" or \"beginner anime\"\n• **Best lists** - \"best anime of all time\"\n\nWhat would you like to know about anime? 🎌";
    }
    
    res.json({ response, timestamp: new Date() });
  } catch (error) {
    console.error('Chatbot error:', error);
    res.json({ 
      response: "Oops! Something went wrong on my end. But I'm still here to help with anime recommendations! What would you like to know? 🎌",
      timestamp: new Date() 
    });
  }
});

module.exports = router;