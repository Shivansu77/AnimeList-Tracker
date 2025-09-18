import React, { useState, useEffect } from 'react';
import { streamingService } from '../services/streamingService';

const AdminStreaming = () => {
  const [platforms, setPlatforms] = useState([]);
  const [newPlatform, setNewPlatform] = useState({
    name: '',
    logo: '',
    baseUrl: ''
  });
  const [newLink, setNewLink] = useState({
    animeId: '',
    platformId: '',
    streamingUrl: '',
    region: 'US',
    subscriptionRequired: true
  });

  useEffect(() => {
    loadPlatforms();
  }, []);

  const loadPlatforms = async () => {
    try {
      const data = await streamingService.getPlatforms();
      setPlatforms(data);
    } catch (error) {
      console.error('Error loading platforms:', error);
    }
  };

  const handleAddPlatform = async (e) => {
    e.preventDefault();
    try {
      await streamingService.addPlatform(newPlatform);
      setNewPlatform({ name: '', logo: '', baseUrl: '' });
      loadPlatforms();
      alert('Platform added successfully!');
    } catch (error) {
      console.error('Error adding platform:', error);
      alert('Failed to add platform');
    }
  };

  const handleAddLink = async (e) => {
    e.preventDefault();
    try {
      await streamingService.addStreamingLink(newLink.animeId, {
        platformId: newLink.platformId,
        streamingUrl: newLink.streamingUrl,
        region: newLink.region,
        subscriptionRequired: newLink.subscriptionRequired
      });
      setNewLink({
        animeId: '',
        platformId: '',
        streamingUrl: '',
        region: 'US',
        subscriptionRequired: true
      });
      alert('Streaming link added successfully!');
    } catch (error) {
      console.error('Error adding streaming link:', error);
      alert('Failed to add streaming link');
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Manage Streaming Platforms</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add Platform */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4">Add Streaming Platform</h3>
          
          <form onSubmit={handleAddPlatform}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Platform Name</label>
              <input
                type="text"
                value={newPlatform.name}
                onChange={(e) => setNewPlatform({...newPlatform, name: e.target.value})}
                className="w-full p-2 border rounded"
                placeholder="e.g., Crunchyroll"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Logo URL</label>
              <input
                type="url"
                value={newPlatform.logo}
                onChange={(e) => setNewPlatform({...newPlatform, logo: e.target.value})}
                className="w-full p-2 border rounded"
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Base URL</label>
              <input
                type="url"
                value={newPlatform.baseUrl}
                onChange={(e) => setNewPlatform({...newPlatform, baseUrl: e.target.value})}
                className="w-full p-2 border rounded"
                placeholder="https://crunchyroll.com"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            >
              Add Platform
            </button>
          </form>
        </div>

        {/* Add Streaming Link */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4">Add Streaming Link</h3>
          
          <form onSubmit={handleAddLink}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Anime ID</label>
              <input
                type="text"
                value={newLink.animeId}
                onChange={(e) => setNewLink({...newLink, animeId: e.target.value})}
                className="w-full p-2 border rounded"
                placeholder="Anime MAL ID"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Platform</label>
              <select
                value={newLink.platformId}
                onChange={(e) => setNewLink({...newLink, platformId: e.target.value})}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Select Platform</option>
                {platforms.map(platform => (
                  <option key={platform._id} value={platform._id}>
                    {platform.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Streaming URL</label>
              <input
                type="url"
                value={newLink.streamingUrl}
                onChange={(e) => setNewLink({...newLink, streamingUrl: e.target.value})}
                className="w-full p-2 border rounded"
                placeholder="Direct link to anime on platform"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Region</label>
              <select
                value={newLink.region}
                onChange={(e) => setNewLink({...newLink, region: e.target.value})}
                className="w-full p-2 border rounded"
              >
                <option value="US">United States</option>
                <option value="JP">Japan</option>
                <option value="UK">United Kingdom</option>
                <option value="CA">Canada</option>
                <option value="AU">Australia</option>
                <option value="GLOBAL">Global</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newLink.subscriptionRequired}
                  onChange={(e) => setNewLink({...newLink, subscriptionRequired: e.target.checked})}
                  className="mr-2"
                />
                Subscription Required
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
            >
              Add Streaming Link
            </button>
          </form>
        </div>
      </div>

      {/* Platforms List */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-bold mb-4">Existing Platforms</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {platforms.map(platform => (
            <div key={platform._id} className="border p-4 rounded">
              <div className="flex items-center mb-2">
                {platform.logo && (
                  <img src={platform.logo} alt={platform.name} className="w-8 h-8 mr-2 rounded" />
                )}
                <h4 className="font-medium">{platform.name}</h4>
              </div>
              {platform.baseUrl && (
                <p className="text-sm text-gray-600">{platform.baseUrl}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminStreaming;