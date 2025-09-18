import React, { useState } from 'react';

const AdminAnimeForm = ({ onSubmit, initialData = {} }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genres: [],
    type: 'TV',
    status: 'Upcoming',
    episodes: 1,
    duration: 24,
    releaseDate: '',
    studio: '',
    poster: '',
    banner: '',
    trailer: '',
    streamingPlatforms: [{ name: '', url: '', region: [] }],
    ...initialData
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addStreamingPlatform = () => {
    setFormData({
      ...formData,
      streamingPlatforms: [...formData.streamingPlatforms, { name: '', url: '', region: [] }]
    });
  };

  const updateStreamingPlatform = (index, field, value) => {
    const updated = [...formData.streamingPlatforms];
    updated[index][field] = value;
    setFormData({ ...formData, streamingPlatforms: updated });
  };

  const removeStreamingPlatform = (index) => {
    const updated = formData.streamingPlatforms.filter((_, i) => i !== index);
    setFormData({ ...formData, streamingPlatforms: updated });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Add/Edit Anime</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Studio</label>
            <input
              type="text"
              value={formData.studio}
              onChange={(e) => setFormData({...formData, studio: e.target.value})}
              className="w-full p-2 border rounded"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full p-2 border rounded h-24"
            required
          />
        </div>

        {/* Images */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Poster URL</label>
            <input
              type="url"
              value={formData.poster}
              onChange={(e) => setFormData({...formData, poster: e.target.value})}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Banner URL</label>
            <input
              type="url"
              value={formData.banner}
              onChange={(e) => setFormData({...formData, banner: e.target.value})}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        {/* Trailer */}
        <div>
          <label className="block text-sm font-medium mb-2">YouTube Trailer URL</label>
          <input
            type="url"
            value={formData.trailer}
            onChange={(e) => setFormData({...formData, trailer: e.target.value})}
            className="w-full p-2 border rounded"
            placeholder="https://www.youtube.com/watch?v=..."
          />
        </div>

        {/* Streaming Platforms */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-medium">Streaming Platforms</label>
            <button
              type="button"
              onClick={addStreamingPlatform}
              className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
            >
              Add Platform
            </button>
          </div>
          
          {formData.streamingPlatforms.map((platform, index) => (
            <div key={index} className="border p-4 rounded mb-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Platform Name</label>
                  <select
                    value={platform.name}
                    onChange={(e) => updateStreamingPlatform(index, 'name', e.target.value)}
                    className="w-full p-2 border rounded text-sm"
                  >
                    <option value="">Select Platform</option>
                    <option value="Crunchyroll">Crunchyroll</option>
                    <option value="Netflix">Netflix</option>
                    <option value="Disney+">Disney+</option>
                    <option value="Funimation">Funimation</option>
                    <option value="Hulu">Hulu</option>
                    <option value="Amazon Prime">Amazon Prime</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium mb-1">URL</label>
                  <input
                    type="url"
                    value={platform.url}
                    onChange={(e) => updateStreamingPlatform(index, 'url', e.target.value)}
                    className="w-full p-2 border rounded text-sm"
                    placeholder="https://..."
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium mb-1">Regions</label>
                  <input
                    type="text"
                    value={platform.region.join(', ')}
                    onChange={(e) => updateStreamingPlatform(index, 'region', e.target.value.split(', '))}
                    className="w-full p-2 border rounded text-sm"
                    placeholder="US, UK, CA"
                  />
                </div>
              </div>
              
              {formData.streamingPlatforms.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeStreamingPlatform(index)}
                  className="mt-2 px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Other fields */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              className="w-full p-2 border rounded"
            >
              <option value="TV">TV</option>
              <option value="Movie">Movie</option>
              <option value="OVA">OVA</option>
              <option value="ONA">ONA</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
              className="w-full p-2 border rounded"
            >
              <option value="Upcoming">Upcoming</option>
              <option value="Airing">Airing</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Episodes</label>
            <input
              type="number"
              value={formData.episodes}
              onChange={(e) => setFormData({...formData, episodes: parseInt(e.target.value)})}
              className="w-full p-2 border rounded"
              min="1"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Duration (min)</label>
            <input
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
              className="w-full p-2 border rounded"
              min="1"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Release Date</label>
          <input
            type="date"
            value={formData.releaseDate}
            onChange={(e) => setFormData({...formData, releaseDate: e.target.value})}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 font-medium"
        >
          Save Anime
        </button>
      </form>
    </div>
  );
};

export default AdminAnimeForm;