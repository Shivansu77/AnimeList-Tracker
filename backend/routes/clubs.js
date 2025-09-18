const express = require('express');
const Club = require('../models/Club');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get featured clubs - MUST be before /:id route
router.get('/featured', async (req, res) => {
  try {
    const featuredClubs = await Club.find()
      .sort({ memberCount: -1 })
      .limit(3)
      .select('name memberCount');

    const formattedClubs = featuredClubs.map(club => ({
      id: club._id,
      name: club.name,
      members: club.memberCount,
      trending: club.memberCount > 50,
      featured: true
    }));

    res.json(formattedClubs);
  } catch (error) {
    console.error(error);
    res.status(500).json([]);
  }
});

// Get community stats - MUST be before /:id route
router.get('/stats', async (req, res) => {
  try {
    const totalClubs = await Club.countDocuments();
    const totalMembers = await Club.aggregate([
      { $group: { _id: null, total: { $sum: '$memberCount' } } }
    ]);
    
    const stats = {
      totalClubs,
      activeMembers: totalMembers[0]?.total || 0,
      postsToday: Math.floor(Math.random() * 100) + 50
    };

    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ totalClubs: 0, activeMembers: 0, postsToday: 0 });
  }
});

// Get user's clubs - MUST be before /:id route
router.get('/user/my-clubs', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate('clubs', 'name avatar description memberCount category');

    res.json(user.clubs || []);
  } catch (error) {
    console.error(error);
    res.status(500).json([]);
  }
});

// Get all clubs with pagination
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, category, search } = req.query;
    
    const query = {};
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const clubs = await Club.find(query)
      .populate('creator', 'username avatar')
      .sort({ memberCount: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('name description avatar category memberCount isPrivate createdAt');

    const total = await Club.countDocuments(query);

    // Transform clubs data to match frontend expectations
    const transformedClubs = clubs.map(club => ({
      ...club.toObject(),
      tags: club.tags || [],
      trending: club.memberCount > 50,
      postCount: Math.floor(Math.random() * 100) + 10
    }));

    res.json(transformedClubs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new club
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, category, isPrivate = false, avatar, banner, tags } = req.body;

    // Input validation
    if (!name || name.trim().length < 3) {
      return res.status(400).json({ message: 'Club name must be at least 3 characters long' });
    }
    if (!description || description.trim().length < 10) {
      return res.status(400).json({ message: 'Club description must be at least 10 characters long' });
    }
    if (!category) {
      return res.status(400).json({ message: 'Club category is required' });
    }

    // Check if club name already exists
    const existingClub = await Club.findOne({ name });
    if (existingClub) {
      return res.status(400).json({ message: 'Club name already exists' });
    }

    const club = new Club({
      name,
      description,
      category,
      isPrivate,
      avatar,
      banner,
      tags: Array.isArray(tags) ? tags : [],
      creator: req.user.userId,
      members: [{
        user: req.user.userId,
        role: 'admin',
        joinedAt: new Date()
      }],
      memberCount: 1
    });

    await club.save();

    // Add club to user's clubs array
    await User.findByIdAndUpdate(req.user.userId, {
      $push: { clubs: club._id }
    });

    res.status(201).json({
      message: 'Club created successfully',
      club
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single club
router.get('/:id', async (req, res) => {
  try {
    const club = await Club.findById(req.params.id)
      .populate('creator', 'username avatar')
      .populate('members.user', 'username avatar')
      .populate('moderators', 'username avatar');

    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    res.json(club);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Join club
router.post('/:id/join', auth, async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    // Check if user is already a member
    const isMember = club.members.some(
      member => member.user.toString() === req.user.userId
    );

    if (isMember) {
      return res.status(400).json({ message: 'Already a member of this club' });
    }

    // Add user to club members
    club.members.push({
      user: req.user.userId,
      role: 'member',
      joinedAt: new Date()
    });
    club.memberCount += 1;

    await club.save();

    // Add club to user's clubs array
    await User.findByIdAndUpdate(req.user.userId, {
      $push: { clubs: club._id }
    });

    res.json({ message: 'Successfully joined the club' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Leave club
router.post('/:id/leave', auth, async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    // Check if user is the creator
    if (club.creator.toString() === req.user.userId) {
      return res.status(400).json({ message: 'Club creator cannot leave. Transfer ownership first.' });
    }

    // Remove user from club members
    club.members = club.members.filter(
      member => member.user.toString() !== req.user.userId
    );
    club.memberCount = Math.max(0, club.memberCount - 1);

    // Remove from moderators if applicable
    club.moderators = club.moderators.filter(
      moderator => moderator.toString() !== req.user.userId
    );

    await club.save();

    // Remove club from user's clubs array
    await User.findByIdAndUpdate(req.user.userId, {
      $pull: { clubs: club._id }
    });

    res.json({ message: 'Successfully left the club' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update club (admin/moderator only)
router.put('/:id', auth, async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    // Check if user has permission to update
    const member = club.members.find(
      member => member.user.toString() === req.user.userId
    );

    if (!member || (member.role !== 'admin' && member.role !== 'moderator')) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    const { name, description, avatar, banner, rules } = req.body;

    if (name) club.name = name;
    if (description) club.description = description;
    if (avatar) club.avatar = avatar;
    if (banner) club.banner = banner;
    if (rules) club.rules = rules;

    await club.save();

    res.json({
      message: 'Club updated successfully',
      club
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});



// Promote/demote member (admin only)
router.put('/:id/members/:memberId/role', auth, async (req, res) => {
  try {
    const { role } = req.body;
    const club = await Club.findById(req.params.id);
    
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    // Check if user is admin
    const adminMember = club.members.find(
      member => member.user.toString() === req.user.userId && member.role === 'admin'
    );

    if (!adminMember) {
      return res.status(403).json({ message: 'Only admins can change member roles' });
    }

    // Find and update member role
    const member = club.members.find(
      member => member.user.toString() === req.params.memberId
    );

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    member.role = role;

    // Update moderators array
    if (role === 'moderator') {
      if (!club.moderators.includes(req.params.memberId)) {
        club.moderators.push(req.params.memberId);
      }
    } else {
      club.moderators = club.moderators.filter(
        moderator => moderator.toString() !== req.params.memberId
      );
    }

    await club.save();

    res.json({ message: 'Member role updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove member (admin/moderator only)
router.delete('/:id/members/:memberId', auth, async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    // Check permissions
    const currentMember = club.members.find(
      member => member.user.toString() === req.user.userId
    );

    if (!currentMember || (currentMember.role !== 'admin' && currentMember.role !== 'moderator')) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    // Cannot remove creator
    if (club.creator.toString() === req.params.memberId) {
      return res.status(400).json({ message: 'Cannot remove club creator' });
    }

    // Remove member
    club.members = club.members.filter(
      member => member.user.toString() !== req.params.memberId
    );
    club.memberCount = Math.max(0, club.memberCount - 1);

    // Remove from moderators if applicable
    club.moderators = club.moderators.filter(
      moderator => moderator.toString() !== req.params.memberId
    );

    await club.save();

    // Remove club from user's clubs array
    await User.findByIdAndUpdate(req.params.memberId, {
      $pull: { clubs: club._id }
    });

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
