import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Avatar,
  Fab,
  Collapse,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Chat,
  Send,
  Close,
  SmartToy
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Chatbot = () => {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "🤔 I'm here to help you discover amazing anime! Try asking me about:\n\n• **Recommendations** - \"recommend me some anime\"\n• **Genres** - \"action anime\" or \"romance anime\"\n• **Specific needs** - \"gym anime\" or \"beginner anime\"\n• **Best lists** - \"best anime of all time\"\n\nWhat would you like to know about anime? 🎌",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:3003/api/chatbot/chat', { 
        message: inputMessage 
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('Chatbot response:', response.data);
      
      const botMessage = {
        id: Date.now() + 1,
        text: response.data.response,
        isBot: true,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chatbot error:', error.response?.data || error.message);
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I'm having trouble connecting to my brain! 🤖 Make sure the backend server is running on port 3003.",
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Temporarily show for all users for debugging
  // if (!isAuthenticated) {
  //   return null;
  // }

  return (
    <>
      {/* Chat Window */}
      <Collapse in={isOpen}>
        <Paper
          sx={{
            position: 'fixed',
            bottom: 100,
            right: 20,
            width: 350,
            height: 500,
            zIndex: 1300,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 2,
              bgcolor: 'primary.main',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SmartToy />
              <Typography variant="h6">Anime Assistant</Typography>
            </Box>
            <IconButton
              size="small"
              onClick={() => setIsOpen(false)}
              sx={{ color: 'white' }}
            >
              <Close />
            </IconButton>
          </Box>

          {/* Messages */}
          <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
            <List sx={{ height: '100%', overflow: 'auto', p: 1 }}>
              {messages.map((message, index) => (
                <React.Fragment key={message.id}>
                  <ListItem
                    sx={{
                      flexDirection: message.isBot ? 'row' : 'row-reverse',
                      alignItems: 'flex-start',
                      gap: 1
                    }}
                  >
                    <ListItemAvatar sx={{ minWidth: 40 }}>
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: message.isBot ? 'primary.main' : 'secondary.main'
                        }}
                      >
                        {message.isBot ? <SmartToy sx={{ fontSize: 18 }} /> : 'U'}
                      </Avatar>
                    </ListItemAvatar>
                    <Paper
                      sx={{
                        p: 1.5,
                        maxWidth: '80%',
                        bgcolor: message.isBot ? 'grey.100' : 'primary.main',
                        color: message.isBot ? 'text.primary' : 'white',
                        borderRadius: 2
                      }}
                    >
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          whiteSpace: 'pre-line',
                          lineHeight: 1.4
                        }}
                      >
                        {message.text}
                      </Typography>
                    </Paper>
                  </ListItem>
                  {index < messages.length - 1 && <Divider variant="middle" />}
                </React.Fragment>
              ))}
              {loading && (
                <ListItem>
                  <ListItemAvatar sx={{ minWidth: 40 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                      <SmartToy sx={{ fontSize: 18 }} />
                    </Avatar>
                  </ListItemAvatar>
                  <Paper sx={{ p: 1.5, bgcolor: 'grey.100' }}>
                    <Typography variant="body2">Thinking...</Typography>
                  </Paper>
                </ListItem>
              )}
              <div ref={messagesEndRef} />
            </List>
          </Box>

          {/* Input */}
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Ask about anime..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
              />
              <IconButton
                color="primary"
                onClick={sendMessage}
                disabled={!inputMessage.trim() || loading}
              >
                <Send />
              </IconButton>
            </Box>
          </Box>
        </Paper>
      </Collapse>

      {/* Chat Button */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 9999,
          boxShadow: '0 4px 20px rgba(124, 77, 255, 0.4)'
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <Close /> : <Chat />}
      </Fab>
    </>
  );
};

export default Chatbot;