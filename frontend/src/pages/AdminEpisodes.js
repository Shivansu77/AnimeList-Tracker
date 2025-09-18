import React, { useState, useEffect } from 'react';

const AdminEpisodes = () => {
  const [episodes, setEpisodes] = useState([]);
  const [newEpisode, setNewEpisode] = useState({
    animeId: '',
    episodeNumber: 1,
    title: '',
    releaseDate: '',
    duration: 24
  });
  const [animes, setAnimes] = useState([]);

  useEffect(() => {
    loadAnimes();
  }, []);

  const loadAnimes = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/anime`);
      const data = await response.json();
      setAnimes(data.data || []);
    } catch (error) {
      console.error('Error loading animes:', error);
    }
  };

  const loadEpisodes = async (animeId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/episodes/anime/${animeId}`);
      const data = await response.json();
      setEpisodes(data);
    } catch (error) {
      console.error('Error loading episodes:', error);
    }
  };

  const handleAddEpisode = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/episodes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...newEpisode,
          releaseDate: new Date(newEpisode.releaseDate).toISOString()
        })
      });

      if (response.ok) {
        alert('Episode added successfully!');
        setNewEpisode({
          animeId: '',
          episodeNumber: 1,
          title: '',
          releaseDate: '',
          duration: 24
        });
        if (newEpisode.animeId) {
          loadEpisodes(newEpisode.animeId);
        }
      }
    } catch (error) {
      console.error('Error adding episode:', error);
      alert('Failed to add episode');
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Manage Episodes</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add Episode Form */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4">Add New Episode</h3>
          
          <form onSubmit={handleAddEpisode}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Anime</label>
              <select
                value={newEpisode.animeId}
                onChange={(e) => {
                  setNewEpisode({...newEpisode, animeId: e.target.value});
                  if (e.target.value) loadEpisodes(e.target.value);
                }}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Select Anime</option>
                {animes.map(anime => (
                  <option key={anime._id} value={anime._id}>
                    {anime.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Episode Number</label>
              <input
                type="number"
                value={newEpisode.episodeNumber}
                onChange={(e) => setNewEpisode({...newEpisode, episodeNumber: parseInt(e.target.value)})}
                className="w-full p-2 border rounded"
                min="1"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Episode Title</label>
              <input
                type="text"
                value={newEpisode.title}
                onChange={(e) => setNewEpisode({...newEpisode, title: e.target.value})}
                className="w-full p-2 border rounded"
                placeholder="Optional"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Release Date & Time</label>
              <input
                type="datetime-local"
                value={newEpisode.releaseDate}
                onChange={(e) => setNewEpisode({...newEpisode, releaseDate: e.target.value})}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
              <input
                type="number"
                value={newEpisode.duration}
                onChange={(e) => setNewEpisode({...newEpisode, duration: parseInt(e.target.value)})}
                className="w-full p-2 border rounded"
                min="1"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            >
              Add Episode
            </button>
          </form>
        </div>

        {/* Episodes List */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4">Episodes</h3>
          
          {episodes.length === 0 ? (
            <p className="text-gray-500">Select an anime to view episodes</p>
          ) : (
            <div className="space-y-3">
              {episodes.map(episode => (
                <div key={episode._id} className="border p-3 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">Episode {episode.episodeNumber}</h4>
                      {episode.title && <p className="text-sm text-gray-600">{episode.title}</p>}
                      <p className="text-xs text-gray-500">
                        {new Date(episode.releaseDate).toLocaleString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded ${
                      episode.isReleased ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {episode.isReleased ? 'Released' : 'Upcoming'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminEpisodes;