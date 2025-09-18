const express = require('express');
const { auth } = require('../middleware/auth');
const router = express.Router();

// In-memory storage for spoiler reports (in production, use database)
let spoilerReports = [];
let messageFlags = {}; // messageId -> { spoilerFlags: count, reportedBy: [userIds] }

// Report message as spoiler
router.post('/report', async (req, res) => {
  try {
    const { messageId, messageType, reason, clubId } = req.body;
    const userId = req.user?.userId || 'anonymous';
    
    const report = {
      id: Date.now(),
      messageId,
      messageType, // 'chat', 'reply', 'discussion'
      clubId,
      reportedBy: userId,
      reason: reason || 'Contains spoilers',
      createdAt: new Date(),
      status: 'pending'
    };
    
    spoilerReports.push(report);
    
    // Track flags for this message
    if (!messageFlags[messageId]) {
      messageFlags[messageId] = { 
        spoilerFlags: 0, 
        reportedBy: [], 
        isAutoSpoiler: false,
        clubId: clubId
      };
    }
    
    if (!messageFlags[messageId].reportedBy.includes(userId)) {
      messageFlags[messageId].spoilerFlags++;
      messageFlags[messageId].reportedBy.push(userId);
      
      // Check if message should be auto-marked as spoiler
      const autoSpoilerResult = await checkAutoSpoiler(messageId, clubId);
      if (autoSpoilerResult.isAutoSpoiler) {
        messageFlags[messageId].isAutoSpoiler = true;
      }
    }
    
    res.json({ 
      message: messageFlags[messageId].isAutoSpoiler ? 'Auto-marked as spoiler (30% threshold reached)' : 'Spoiler report submitted',
      flagCount: messageFlags[messageId].spoilerFlags,
      isAutoSpoiler: messageFlags[messageId].isAutoSpoiler,
      threshold: messageFlags[messageId].isAutoSpoiler ? autoSpoilerResult.threshold : null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark message as spoiler (community moderation)
router.post('/mark-spoiler', async (req, res) => {
  try {
    const { messageId, messageType, clubId } = req.body;
    const userId = req.user?.userId || 'anonymous';
    
    if (!messageFlags[messageId]) {
      messageFlags[messageId] = { 
        spoilerFlags: 0, 
        reportedBy: [], 
        isAutoSpoiler: false,
        clubId: clubId
      };
    }
    
    if (!messageFlags[messageId].reportedBy.includes(userId)) {
      messageFlags[messageId].spoilerFlags++;
      messageFlags[messageId].reportedBy.push(userId);
      
      // Check if message should be auto-marked as spoiler
      const autoSpoilerResult = await checkAutoSpoiler(messageId, clubId);
      if (autoSpoilerResult.isAutoSpoiler) {
        messageFlags[messageId].isAutoSpoiler = true;
      }
    }
    
    res.json({ 
      message: messageFlags[messageId].isAutoSpoiler ? 'Auto-marked as spoiler (30% threshold reached)' : 'Message marked as spoiler',
      flagCount: messageFlags[messageId].spoilerFlags,
      isAutoSpoiler: messageFlags[messageId].isAutoSpoiler,
      threshold: messageFlags[messageId].isAutoSpoiler ? autoSpoilerResult.threshold : null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Auto-spoiler detection algorithm
async function checkAutoSpoiler(messageId, clubId) {
  try {
    // Get club member count (mock data for now)
    const clubMemberCount = await getClubMemberCount(clubId);
    const flagCount = messageFlags[messageId]?.spoilerFlags || 0;
    
    // Calculate percentage
    const flagPercentage = (flagCount / clubMemberCount) * 100;
    const threshold = 30; // 30% threshold
    
    return {
      isAutoSpoiler: flagPercentage >= threshold,
      flagPercentage: flagPercentage.toFixed(1),
      threshold: threshold,
      flagCount: flagCount,
      memberCount: clubMemberCount
    };
  } catch (error) {
    console.error('Auto-spoiler check failed:', error);
    return { isAutoSpoiler: false };
  }
}

// Mock function to get club member count (replace with actual DB query)
async function getClubMemberCount(clubId) {
  // Mock data - in production, query actual club member count
  const mockClubSizes = {
    '1': 10,
    '2': 20,
    '3': 50
  };
  return mockClubSizes[clubId] || 15; // Default to 15 members
}

// Get spoiler flags for messages
router.get('/flags/:clubId', async (req, res) => {
  try {
    res.json(messageFlags);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get spoiler reports (for moderators)
router.get('/reports/:clubId', auth, async (req, res) => {
  try {
    const clubReports = spoilerReports.filter(report => report.clubId === req.params.clubId);
    res.json(clubReports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;