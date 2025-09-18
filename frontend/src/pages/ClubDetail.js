import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  IconButton,
  Menu,
  MenuItem,
  LinearProgress
} from '@mui/material';
import {
  Send,
  Add,
  MoreVert,
  Forum,
  People,
  Event,
  Star,
  Reply,
  Visibility,
  VisibilityOff,
  Poll,
  BarChart
} from '@mui/icons-material';
import { clubService, spoilerReportService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import SpoilerText from '../components/SpoilerText';
import SpoilerTextEditor from '../components/SpoilerTextEditor';
import { SpoilerText as InlineSpoilerText } from '../components/SpoilerProtection';

// Spoiler Message Component with Blur Effect
const SpoilerMessage = ({ content, showSpoilers, variant = 'body1', sx = {}, color = 'inherit' }) => {
  const [isRevealed, setIsRevealed] = useState(false);
  
  if (showSpoilers) {
    return (
      <Typography 
        variant={variant} 
        color={color}
        sx={{ 
          ...sx, 
          p: 1, 
          bgcolor: 'warning.light', 
          borderRadius: 1,
          border: '1px solid orange'
        }}
      >
        ⚠️ SPOILER: {content}
      </Typography>
    );
  }
  
  return (
    <Box 
      onClick={() => setIsRevealed(!isRevealed)}
      sx={{ 
        ...sx,
        cursor: 'pointer',
        position: 'relative',
        display: 'inline-block',
        '&:hover': {
          '&::after': {
            content: '"Click to reveal spoiler"',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'rgba(0,0,0,0.8)',
            color: 'white',
            px: 1,
            py: 0.5,
            borderRadius: 1,
            fontSize: '0.75rem',
            whiteSpace: 'nowrap',
            zIndex: 10
          }
        }
      }}
    >
      <Typography 
        variant={variant} 
        color={color}
        sx={{
          filter: isRevealed ? 'none' : 'blur(5px)',
          transition: 'filter 0.3s ease',
          bgcolor: isRevealed ? 'transparent' : 'rgba(0,0,0,0.1)',
          p: 0.5,
          borderRadius: 1,
          userSelect: isRevealed ? 'text' : 'none'
        }}
      >
        ⚠️ SPOILER: {content}
      </Typography>
    </Box>
  );
};

const ClubDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [club, setClub] = useState(null);
  const [discussions, setDiscussions] = useState([]);
  const [newDiscussion, setNewDiscussion] = useState({ title: '', content: '' });
  const [newPost, setNewPost] = useState('');
  const [showNewDiscussion, setShowNewDiscussion] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [discussionReplies, setDiscussionReplies] = useState({});
  const [newReply, setNewReply] = useState({});
  const [recentMembers, setRecentMembers] = useState([]);
  const [showSpoilers, setShowSpoilers] = useState(false);
  const [polls, setPolls] = useState([]);
  const [showNewPoll, setShowNewPoll] = useState(false);
  const [newPoll, setNewPoll] = useState({ question: '', options: ['', ''] });
  const [spoilerFlags, setSpoilerFlags] = useState({});

  // Load discussions and replies from localStorage
  useEffect(() => {
    const savedDiscussions = localStorage.getItem(`club_${id}_discussions`);
    const savedReplies = localStorage.getItem(`club_${id}_replies`);
    const savedChatMessages = localStorage.getItem(`club_${id}_chat`);
    
    if (savedDiscussions) {
      setDiscussions(JSON.parse(savedDiscussions));
    } else {
      // Default discussion
      const defaultDiscussion = {
        id: 1,
        title: 'General Club Discussion',
        author: 'ClubModerator',
        content: 'Welcome to our club discussion! Share your thoughts about anime, recommendations, or anything related to our club.',
        replies: 0,
        lastActivity: 'Active now',
        pinned: true
      };
      const spoilerDiscussion = {
        id: 2,
        title: 'Attack on Titan Final Season Discussion',
        author: 'AnimeKing',
        content: '[SPOILER]Eren becomes the final villain and destroys most of humanity!',
        replies: 0,
        lastActivity: '1h ago',
        pinned: false
      };
      setDiscussions([defaultDiscussion, spoilerDiscussion]);
    }
    
    if (savedReplies) {
      setDiscussionReplies(JSON.parse(savedReplies));
    } else {
      setDiscussionReplies({
        1: [{ id: 1, author: 'ClubModerator', content: 'Feel free to share your favorite anime, ask for recommendations, or discuss anything anime-related!', time: '1h ago' }],
        2: [{ id: 2, author: 'MangaFan', content: '[SPOILER]I can\'t believe Mikasa had to kill Eren in the end!', time: '30m ago' }]
      });
    }
    
    if (savedChatMessages) {
      setChatMessages(JSON.parse(savedChatMessages));
    }
    
    // Load recent members
    const savedMembers = localStorage.getItem(`club_${id}_members`);
    if (savedMembers) {
      setRecentMembers(JSON.parse(savedMembers));
    }
    
    // Load spoiler setting
    const spoilerSetting = localStorage.getItem('showSpoilers');
    setShowSpoilers(spoilerSetting === 'true');
    
    // Load polls
    const savedPolls = localStorage.getItem(`club_${id}_polls`);
    if (savedPolls) {
      setPolls(JSON.parse(savedPolls));
    } else {
      // Default polls
      const defaultPolls = [
        {
          id: 1,
          question: 'Best anime of this season?',
          options: [
            { text: 'Attack on Titan', votes: 15 },
            { text: 'Demon Slayer', votes: 12 },
            { text: 'Jujutsu Kaisen', votes: 8 },
            { text: 'One Piece', votes: 20 }
          ],
          totalVotes: 55,
          userVote: null
        }
      ];
      setPolls(defaultPolls);
    }
    
    // Load spoiler flags
    loadSpoilerFlags();
  }, [id]);
  
  const loadSpoilerFlags = async () => {
    try {
      const response = await spoilerReportService.getFlags(id);
      setSpoilerFlags(response.data);
    } catch (error) {
      console.error('Failed to load spoiler flags:', error);
    }
  };

  useEffect(() => {
    const fetchClubData = async () => {
      try {
        const clubRes = await clubService.getById(id);
        setClub(clubRes.data);
        // Discussions loaded from localStorage in separate useEffect
        
        // Check localStorage for membership
        const joinedClubs = JSON.parse(localStorage.getItem('joinedClubs') || '[]');
        const isJoined = joinedClubs.includes(id);
        setIsMember(isJoined);
        
      } catch (error) {
        console.error('Failed to fetch club data:', error);
        // Even if API fails, check localStorage
        const joinedClubs = JSON.parse(localStorage.getItem('joinedClubs') || '[]');
        const isJoined = joinedClubs.includes(id);
        setIsMember(isJoined);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchClubData();
    }
  }, [id, user]);

  const handleJoinClub = async () => {
    try {
      // Update localStorage
      const joinedClubs = JSON.parse(localStorage.getItem('joinedClubs') || '[]');
      if (!joinedClubs.includes(id)) {
        joinedClubs.push(id);
        localStorage.setItem('joinedClubs', JSON.stringify(joinedClubs));
      }
      
      // Add to recent members
      const member = {
        username: user?.username || 'Anonymous',
        joinedAt: new Date().toISOString(),
        status: 'Active now'
      };
      
      const existingMembers = JSON.parse(localStorage.getItem(`club_${id}_members`) || '[]');
      const updatedMembers = [member, ...existingMembers.filter(m => m.username !== member.username)].slice(0, 5);
      localStorage.setItem(`club_${id}_members`, JSON.stringify(updatedMembers));
      setRecentMembers(updatedMembers);
      
      setIsMember(true);
      setClub(prev => ({ ...prev, memberCount: (prev.memberCount || 0) + 1 }));
      
      // Try API call but don't fail if it doesn't work
      try {
        await clubService.join(id);
      } catch (apiError) {
        console.log('API call failed, but localStorage updated');
      }
    } catch (error) {
      console.error('Failed to join club:', error);
    }
  };

  const handleLeaveClub = async () => {
    try {
      // Update localStorage
      const joinedClubs = JSON.parse(localStorage.getItem('joinedClubs') || '[]');
      const updatedClubs = joinedClubs.filter(clubId => clubId !== id);
      localStorage.setItem('joinedClubs', JSON.stringify(updatedClubs));
      
      setIsMember(false);
      setClub(prev => ({ ...prev, memberCount: Math.max((prev.memberCount || 1) - 1, 0) }));
      
      // Try API call but don't fail if it doesn't work
      try {
        await clubService.leave(id);
      } catch (apiError) {
        console.log('API call failed, but localStorage updated');
      }
    } catch (error) {
      console.error('Failed to leave club:', error);
    }
  };



  const [chatMessages, setChatMessages] = useState([
    { id: 1, user: 'AnimeKing', message: 'Just finished watching the latest episode!', time: '2m ago', avatar: 'AK' },
    { id: 2, user: 'MangaFan', message: 'The animation quality is insane 🔥', time: '1m ago', avatar: 'MF' },
    { id: 3, user: 'OtakuLife', message: 'Did you see when ||the main character died||?!', time: 'Just now', avatar: 'OL' }
  ]);

  const handlePostMessage = async () => {
    if (!newPost.trim()) return;
    
    const newMessage = {
      id: Date.now(),
      user: user?.username || 'Anonymous',
      message: newPost,
      time: 'Just now',
      avatar: user?.username?.substring(0, 2).toUpperCase() || 'AN'
    };
    
    const updatedMessages = [...chatMessages, newMessage];
    setChatMessages(updatedMessages);
    localStorage.setItem(`club_${id}_chat`, JSON.stringify(updatedMessages));
    setNewPost('');
  };

  const toggleSpoilers = () => {
    const newSetting = !showSpoilers;
    setShowSpoilers(newSetting);
    localStorage.setItem('showSpoilers', newSetting.toString());
  };

  const handleCreatePoll = () => {
    if (!newPoll.question.trim() || newPoll.options.some(opt => !opt.trim())) return;

    const poll = {
      id: Date.now(),
      question: newPoll.question,
      options: newPoll.options.filter(opt => opt.trim()).map(opt => ({ text: opt, votes: 0 })),
      totalVotes: 0,
      userVote: null,
      createdBy: user?.username || 'Anonymous'
    };

    const updatedPolls = [poll, ...polls];
    setPolls(updatedPolls);
    localStorage.setItem(`club_${id}_polls`, JSON.stringify(updatedPolls));
    
    setNewPoll({ question: '', options: ['', ''] });
    setShowNewPoll(false);
  };

  const handleVote = (pollId, optionIndex) => {
    const updatedPolls = polls.map(poll => {
      if (poll.id === pollId) {
        const newOptions = [...poll.options];
        
        // Remove previous vote if exists
        if (poll.userVote !== null) {
          newOptions[poll.userVote].votes--;
        }
        
        // Add new vote
        newOptions[optionIndex].votes++;
        
        return {
          ...poll,
          options: newOptions,
          userVote: optionIndex,
          totalVotes: newOptions.reduce((sum, opt) => sum + opt.votes, 0)
        };
      }
      return poll;
    });
    
    setPolls(updatedPolls);
    localStorage.setItem(`club_${id}_polls`, JSON.stringify(updatedPolls));
  };

  const handleCreateDiscussion = async () => {
    if (!newDiscussion.title.trim() || !newDiscussion.content.trim()) return;

    const discussion = {
      id: Date.now(),
      title: newDiscussion.title,
      author: user?.username || 'Anonymous',
      content: newDiscussion.content,
      replies: 0,
      lastActivity: 'Just now',
      pinned: false
    };

    const updatedDiscussions = [discussion, ...discussions];
    setDiscussions(updatedDiscussions);
    localStorage.setItem(`club_${id}_discussions`, JSON.stringify(updatedDiscussions));
    
    setNewDiscussion({ title: '', content: '' });
    setShowNewDiscussion(false);
  };

  const handleAddReply = (discussionId) => {
    const replyText = newReply[discussionId]?.trim();
    if (!replyText) return;

    const reply = {
      id: Date.now(),
      author: user?.username || 'Anonymous',
      content: replyText,
      time: 'Just now'
    };

    const updatedReplies = {
      ...discussionReplies,
      [discussionId]: [...(discussionReplies[discussionId] || []), reply]
    };
    
    setDiscussionReplies(updatedReplies);
    localStorage.setItem(`club_${id}_replies`, JSON.stringify(updatedReplies));

    setNewReply(prev => ({ ...prev, [discussionId]: '' }));
  };
  
  const handleReportSpoiler = async (messageId, messageType) => {
    try {
      console.log('Reporting spoiler:', { messageId, messageType, clubId: id });
      const response = await spoilerReportService.reportSpoiler({
        messageId,
        messageType,
        clubId: id,
        reason: 'Contains spoilers'
      });
      console.log('Report response:', response);
      loadSpoilerFlags();
      
      if (response.data.isAutoSpoiler) {
        alert(`🔒 AUTO-SPOILER ACTIVATED!\n30% threshold reached (${response.data.flagCount} flags)\nContent is now automatically hidden as spoiler.`);
      } else {
        alert(`Spoiler reported! Total reports: ${response.data.flagCount}`);
      }
    } catch (error) {
      console.error('Failed to report spoiler:', error);
      console.error('Error details:', error.response?.data);
      alert(`Failed to report spoiler: ${error.response?.data?.error || error.message}`);
    }
  };
  
  const handleMarkSpoiler = async (messageId, messageType) => {
    try {
      const response = await spoilerReportService.markAsSpoiler({
        messageId,
        messageType,
        clubId: id
      });
      loadSpoilerFlags();
      
      if (response.data.isAutoSpoiler) {
        alert(`🔒 AUTO-SPOILER ACTIVATED!\n30% threshold reached (${response.data.flagCount} flags)\nContent is now automatically hidden as spoiler.`);
      } else {
        alert(`Marked as spoiler! Total flags: ${response.data.flagCount}`);
      }
    } catch (error) {
      console.error('Failed to mark as spoiler:', error);
      alert('Failed to mark as spoiler');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Loading club...</Typography>
      </Container>
    );
  }

  if (!club) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Club not found</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Club Header */}
      <Paper sx={{ p: 4, mb: 3, background: 'linear-gradient(135deg, rgba(124, 77, 255, 0.1) 0%, rgba(255, 64, 129, 0.1) 100%)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h3" gutterBottom fontWeight="bold">
              {club.name}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {club.description}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              {club.tags?.map((tag, index) => (
                <Chip key={index} label={tag} variant="outlined" />
              ))}
            </Box>
            <Box sx={{ display: 'flex', gap: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <People sx={{ mr: 1 }} />
                <Typography>{club.memberCount || 0} members</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Forum sx={{ mr: 1 }} />
                <Typography>{discussions.length} discussions</Typography>
              </Box>
            </Box>
          </Box>
          <Box>
            {isMember ? (
              <Button variant="outlined" color="error" onClick={handleLeaveClub}>
                Leave Club
              </Button>
            ) : (
              <Button variant="contained" onClick={handleJoinClub}>
                Join Club
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Discussions */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" fontWeight="bold">
                Discussions
              </Typography>
              {isMember && (
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setShowNewDiscussion(true)}
                >
                  New Discussion
                </Button>
              )}
            </Box>

            <List>
              {discussions.map((discussion, index) => (
                <React.Fragment key={discussion.id}>
                  <ListItem sx={{ px: 0, py: 2, flexDirection: 'column', alignItems: 'stretch' }}>
                    {/* Main Discussion */}
                    <Box sx={{ display: 'flex', width: '100%', mb: 2 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {discussion.author.charAt(0).toUpperCase()}
                        </Avatar>
                      </ListItemAvatar>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="h6" fontWeight="bold">
                            {discussion.title}
                          </Typography>
                          {discussion.pinned && (
                            <Chip icon={<Star />} label="Pinned" size="small" color="warning" />
                          )}
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          By {discussion.author} • {discussion.lastActivity}
                        </Typography>
                        {discussion.content?.includes('[SPOILER]') ? (
                          <SpoilerMessage 
                            content={discussion.content.replace('[SPOILER]', '')} 
                            showSpoilers={showSpoilers}
                            variant="body1"
                            sx={{ mb: 2 }}
                          />
                        ) : (
                          <Typography variant="body1" sx={{ mb: 2 }}>
                            {discussion.content}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    
                    {/* Replies Section */}
                    <Box sx={{ ml: 7, pl: 2, borderLeft: '2px solid #e0e0e0' }}>
                      <Typography variant="subtitle2" color="primary" sx={{ mb: 2, fontWeight: 'bold' }}>
                        💬 {(discussionReplies[discussion.id] || []).length} Messages
                      </Typography>
                      
                      {/* Replies */}
                      <Box sx={{ mb: 2 }}>
                        {(discussionReplies[discussion.id] || []).map((reply) => {
                          const flagCount = spoilerFlags[reply.id]?.spoilerFlags || 0;
                          const isReported = flagCount > 0;
                          
                          return (
                            <Box key={reply.id} sx={{ display: 'flex', gap: 2, mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1, position: 'relative' }}>
                              <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                                {reply.author.charAt(0).toUpperCase()}
                              </Avatar>
                              <Box sx={{ flex: 1 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                  <Box>
                                    <Typography variant="subtitle2" fontWeight="bold">{reply.author}</Typography>
                                    <Typography variant="caption" color="text.secondary">{reply.time}</Typography>
                                    {isReported && (
                                      <Chip 
                                        label={
                                          spoilerFlags[reply.id]?.isAutoSpoiler 
                                            ? `🔒 AUTO-SPOILER (${flagCount})` 
                                            : `⚠️ ${flagCount} reports`
                                        } 
                                        size="small" 
                                        color={spoilerFlags[reply.id]?.isAutoSpoiler ? 'error' : 'warning'}
                                        sx={{ ml: 1, fontSize: '0.6rem' }}
                                      />
                                    )}
                                  </Box>
                                  
                                  {/* Spoiler Actions */}
                                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                                    <Button 
                                      size="small" 
                                      onClick={() => handleMarkSpoiler(reply.id, 'reply')}
                                      title="Mark as spoiler"
                                      sx={{ 
                                        minWidth: 'auto', 
                                        p: 0.3, 
                                        fontSize: '0.6rem',
                                        bgcolor: 'orange.light',
                                        '&:hover': { bgcolor: 'orange.main' }
                                      }}
                                    >
                                      🔒
                                    </Button>
                                    <Button 
                                      size="small" 
                                      onClick={() => handleReportSpoiler(reply.id, 'reply')}
                                      title="Report spoiler"
                                      sx={{ 
                                        minWidth: 'auto', 
                                        p: 0.3, 
                                        fontSize: '0.6rem',
                                        bgcolor: 'error.light',
                                        '&:hover': { bgcolor: 'error.main' }
                                      }}
                                    >
                                      🚩
                                    </Button>
                                  </Box>
                                </Box>
                                
                                <Box sx={{ mt: 0.5 }}>
                                  <InlineSpoilerText
                                    content={reply.content}
                                    className="text-sm"
                                  />
                                </Box>
                              </Box>
                            </Box>
                          );
                        })}
                      </Box>
                      
                      {/* Reply Input */}
                      {isMember && (
                        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                            {user?.username?.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box sx={{ flex: 1, display: 'flex', gap: 1 }}>
                            <TextField
                              fullWidth
                              size="small"
                              placeholder="Write a reply... Use ||spoiler|| for spoilers"
                              value={newReply[discussion.id] || ''}
                              onChange={(e) => setNewReply(prev => ({ ...prev, [discussion.id]: e.target.value }))}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddReply(discussion.id);
                                }
                              }}
                            />
                            <Button 
                              variant="contained" 
                              size="small"
                              onClick={() => handleAddReply(discussion.id)}
                              disabled={!newReply[discussion.id]?.trim()}
                            >
                              Reply
                            </Button>
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </ListItem>
                  {index < discussions.length - 1 && <Divider sx={{ my: 2 }} />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Live Chat */}
          <Paper sx={{ p: 3, mb: 3, border: '2px solid', borderColor: 'primary.main', bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              💬 LIVE CHAT
            </Typography>
            
            {/* Chat Messages */}
            <Box sx={{ height: 300, overflowY: 'auto', mb: 2, p: 2, bgcolor: 'white', borderRadius: 2, border: '1px solid #ddd' }}>
              {chatMessages.map((msg) => {
                const flagCount = spoilerFlags[msg.id]?.spoilerFlags || 0;
                const isReported = flagCount > 0;
                
                return (
                  <Box key={msg.id} sx={{ mb: 2, p: 1.5, bgcolor: msg.user === (user?.username || 'Anonymous') ? 'primary.light' : 'grey.100', borderRadius: 1, position: 'relative' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="subtitle2" color="primary.main" fontWeight="bold">
                        {msg.user}
                        {isReported && (
                          <Chip 
                            label={
                              spoilerFlags[msg.id]?.isAutoSpoiler 
                                ? `🔒 AUTO-SPOILER (${flagCount} flags)` 
                                : `⚠️ ${flagCount} spoiler reports`
                            } 
                            size="small" 
                            color={spoilerFlags[msg.id]?.isAutoSpoiler ? 'error' : 'warning'}
                            sx={{ ml: 1, fontSize: '0.7rem' }}
                          />
                        )}
                      </Typography>
                      
                      {/* Spoiler Actions */}
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Button 
                          size="small" 
                          onClick={() => handleMarkSpoiler(msg.id, 'chat')}
                          title="Mark as spoiler"
                          sx={{ 
                            minWidth: 'auto', 
                            p: 0.5, 
                            fontSize: '0.7rem',
                            bgcolor: 'orange.light',
                            '&:hover': { bgcolor: 'orange.main' }
                          }}
                        >
                          🔒
                        </Button>
                        <Button 
                          size="small" 
                          onClick={() => handleReportSpoiler(msg.id, 'chat')}
                          title="Report spoiler"
                          sx={{ 
                            minWidth: 'auto', 
                            p: 0.5, 
                            fontSize: '0.7rem',
                            bgcolor: 'error.light',
                            '&:hover': { bgcolor: 'error.main' }
                          }}
                        >
                          🚩
                        </Button>
                      </Box>
                    </Box>
                    
                    <Box sx={{ mt: 0.5 }}>
                      <InlineSpoilerText
                        content={msg.message}
                        className="text-sm"
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {msg.time}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
            
            {/* Chat Input */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                placeholder="Type message... Use ||spoiler|| for spoilers"
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handlePostMessage();
                  }
                }}
                sx={{ bgcolor: 'white', borderRadius: 1 }}
              />
              <Button
                variant="contained"
                onClick={handlePostMessage}
                disabled={!newPost.trim()}
                sx={{ bgcolor: 'secondary.main', '&:hover': { bgcolor: 'secondary.dark' } }}
              >
                SEND
              </Button>
            </Box>
          </Paper>

          {/* Spoiler Settings */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Settings
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2">Show Spoilers:</Typography>
              <Button
                variant={showSpoilers ? 'contained' : 'outlined'}
                size="small"
                startIcon={showSpoilers ? <Visibility /> : <VisibilityOff />}
                onClick={toggleSpoilers}
              >
                {showSpoilers ? 'ON' : 'OFF'}
              </Button>
            </Box>
          </Paper>

          {/* Polls & Ratings */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                📊 Polls
              </Typography>
              {isMember && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Poll />}
                  onClick={() => setShowNewPoll(true)}
                >
                  New Poll
                </Button>
              )}
            </Box>
            
            {polls.map((poll) => (
              <Box key={poll.id} sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>
                  {poll.question}
                </Typography>
                
                {poll.options.map((option, index) => {
                  const percentage = poll.totalVotes > 0 ? (option.votes / poll.totalVotes * 100) : 0;
                  const isUserVote = poll.userVote === index;
                  
                  return (
                    <Box key={index} sx={{ mb: 1 }}>
                      <Button
                        fullWidth
                        variant={isUserVote ? 'contained' : 'outlined'}
                        size="small"
                        onClick={() => handleVote(poll.id, index)}
                        sx={{ 
                          justifyContent: 'space-between',
                          textTransform: 'none',
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                      >
                        <Box sx={{ 
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          height: '100%',
                          width: `${percentage}%`,
                          bgcolor: isUserVote ? 'primary.light' : 'grey.200',
                          opacity: 0.3,
                          zIndex: 0
                        }} />
                        <Typography variant="body2" sx={{ zIndex: 1 }}>{option.text}</Typography>
                        <Typography variant="caption" sx={{ zIndex: 1 }}>
                          {option.votes} ({percentage.toFixed(0)}%)
                        </Typography>
                      </Button>
                    </Box>
                  );
                })}
                
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Total votes: {poll.totalVotes}
                </Typography>
              </Box>
            ))}
          </Paper>

          {/* Recent Members */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Members
            </Typography>
            <List>
              {recentMembers.length > 0 ? (
                recentMembers.map((member, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                        {member.username.charAt(0).toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={member.username}
                      secondary={member.status}
                    />
                  </ListItem>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                  No members yet. Be the first to join!
                </Typography>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>



      {/* New Poll Dialog */}
      <Dialog open={showNewPoll} onClose={() => setShowNewPoll(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Poll</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Poll Question"
            fullWidth
            variant="outlined"
            value={newPoll.question}
            onChange={(e) => setNewPoll(prev => ({ ...prev, question: e.target.value }))}
            sx={{ mb: 2 }}
          />
          {newPoll.options.map((option, index) => (
            <TextField
              key={index}
              margin="dense"
              label={`Option ${index + 1}`}
              fullWidth
              variant="outlined"
              value={option}
              onChange={(e) => {
                const newOptions = [...newPoll.options];
                newOptions[index] = e.target.value;
                setNewPoll(prev => ({ ...prev, options: newOptions }));
              }}
              sx={{ mb: 1 }}
            />
          ))}
          <Button
            onClick={() => setNewPoll(prev => ({ ...prev, options: [...prev.options, ''] }))}
            disabled={newPoll.options.length >= 5}
          >
            Add Option
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNewPoll(false)}>Cancel</Button>
          <Button
            onClick={handleCreatePoll}
            variant="contained"
            disabled={!newPoll.question.trim() || newPoll.options.filter(opt => opt.trim()).length < 2}
          >
            Create Poll
          </Button>
        </DialogActions>
      </Dialog>

      {/* New Discussion Dialog */}
      <Dialog open={showNewDiscussion} onClose={() => setShowNewDiscussion(false)} maxWidth="md" fullWidth>
        <DialogTitle>Start New Discussion</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Discussion Title"
            fullWidth
            variant="outlined"
            value={newDiscussion.title}
            onChange={(e) => setNewDiscussion(prev => ({ ...prev, title: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Content"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={newDiscussion.content}
            onChange={(e) => setNewDiscussion(prev => ({ ...prev, content: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNewDiscussion(false)}>Cancel</Button>
          <Button
            onClick={handleCreateDiscussion}
            variant="contained"
            disabled={!newDiscussion.title.trim() || !newDiscussion.content.trim()}
          >
            Create Discussion
          </Button>
        </DialogActions>
      </Dialog>

      {/* Discussion Detail Dialog */}
      <Dialog open={!!selectedDiscussion} onClose={() => setSelectedDiscussion(null)} maxWidth="md" fullWidth>
        {selectedDiscussion && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h5" fontWeight="bold">
                  {selectedDiscussion.title}
                </Typography>
                {selectedDiscussion.pinned && (
                  <Chip icon={<Star />} label="Pinned" size="small" color="warning" />
                )}
              </Box>
              <Typography variant="body2" color="text.secondary">
                By {selectedDiscussion.author} • {selectedDiscussion.lastActivity}
              </Typography>
            </DialogTitle>
            <DialogContent>
              {/* Original Post */}
              <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                <Typography variant="body1">
                  {selectedDiscussion.content}
                </Typography>
              </Paper>
              
              {/* Replies */}
              <Typography variant="h6" gutterBottom>
                💬 {selectedDiscussion.replies} Replies
              </Typography>
              
              <Box 
                ref={(el) => { if (el && discussionReplies[selectedDiscussion.id]?.length > 0) el.scrollTop = el.scrollHeight; }}
                sx={{ maxHeight: 300, overflowY: 'auto', mb: 3 }}
              >
                {[
                  { id: 1, author: 'AnimeKing', content: 'Great discussion topic! I totally agree with your points.', time: '1h ago' },
                  { id: 2, author: 'MangaFan', content: 'This is exactly what I was thinking. The character development is amazing.', time: '45m ago' },
                  { id: 3, author: 'OtakuLife', content: 'Can\'t wait to see how this develops in future episodes!', time: '30m ago' },
                  ...(discussionReplies[selectedDiscussion.id] || [])
                ].map((reply) => (
                  <Box key={reply.id} sx={{ display: 'flex', gap: 2, mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                      {reply.author.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="subtitle2" fontWeight="bold">{reply.author}</Typography>
                        <Typography variant="caption" color="text.secondary">{reply.time}</Typography>
                      </Box>
                      <Typography variant="body2">{reply.content}</Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
              
              {/* Add Reply */}
              {isMember && (
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                    {user?.username?.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      placeholder="Write a reply..."
                      value={newReply}
                      onChange={(e) => setNewReply(e.target.value)}
                    />
                    <Button 
                      variant="contained" 
                      onClick={() => {
                        if (newReply.trim()) {
                          const reply = {
                            id: Date.now(),
                            author: user?.username || 'Anonymous',
                            content: newReply,
                            time: 'Just now'
                          };
                          setDiscussionReplies(prev => ({
                            ...prev,
                            [selectedDiscussion.id]: [...(prev[selectedDiscussion.id] || []), reply]
                          }));
                          setNewReply('');
                        }
                      }}
                      disabled={!newReply.trim()}
                    >
                      Reply
                    </Button>
                  </Box>
                </Box>
              )}
            </DialogContent>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default ClubDetail;