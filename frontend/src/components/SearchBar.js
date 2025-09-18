import React, { useState, useEffect } from 'react';
import {
  TextField,
  Autocomplete,
  Box,
  Typography,
  Avatar,
  Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { animeService } from '../services/api';

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const searchAnime = async () => {
      if (searchTerm.length < 2) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const response = await animeService.getAll({ q: searchTerm, limit: 10 });
        const animes = response.data?.anime || response.data || response || [];
        setSuggestions(animes);
      } catch (error) {
        console.error('Search error:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(searchAnime, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleSelect = (anime) => {
    if (anime) {
      navigate(`/anime/${anime._id}`);
      setSearchTerm('');
    }
  };

  return (
    <Autocomplete
      freeSolo
      options={suggestions}
      loading={loading}
      getOptionLabel={(option) => typeof option === 'string' ? option : option.title}
      renderOption={(props, option) => (
        <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
          <Avatar
            src={option.poster}
            alt={option.title}
            sx={{ width: 40, height: 40, mr: 2 }}
          />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="body1">{option.title}</Typography>
            <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
              {option.genres?.slice(0, 2).map(genre => (
                <Chip key={genre} label={genre} size="small" />
              ))}
            </Box>
          </Box>
        </Box>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Search anime..."
          variant="outlined"
          size="small"
          sx={{
            minWidth: 300,
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'background.paper',
            }
          }}
        />
      )}
      inputValue={searchTerm}
      onInputChange={(event, newInputValue) => {
        setSearchTerm(newInputValue);
      }}
      onChange={(event, value) => {
        handleSelect(value);
      }}
      onKeyPress={(event) => {
        if (event.key === 'Enter' && searchTerm) {
          navigate(`/anime?search=${encodeURIComponent(searchTerm)}`);
          setSearchTerm('');
        }
      }}
    />
  );
};

export default SearchBar;