import React, { useState } from 'react';
import { reminderService } from '../services/reminderService';

const ReminderModal = ({ isOpen, onClose, anime, onSave }) => {
  const [reminderData, setReminderData] = useState({
    type: 'next_episode',
    episodeNumber: 1,
    scheduledTime: '',
    reminderTime: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const reminderPayload = {
        type: reminderData.type,
        animeId: anime._id || anime.mal_id,
        episodeNumber: parseInt(reminderData.episodeNumber),
        reminderTime: reminderData.reminderTime
      };
      
      await reminderService.createReminder(reminderPayload);
      
      if (onSave) {
        onSave({
          ...reminderData,
          animeId: anime._id || anime.mal_id,
          animeTitle: anime.title
        });
      }
      
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create reminder');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h3 className="text-lg font-bold mb-4">Set Reminder for {anime?.title}</h3>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Reminder Type</label>
            <select 
              value={reminderData.type}
              onChange={(e) => setReminderData({...reminderData, type: e.target.value})}
              className="w-full p-2 border rounded"
            >
              <option value="next_episode">Next Episode</option>
              <option value="anime_start">Anime Start</option>
              <option value="custom_schedule">Custom Schedule</option>
            </select>
          </div>

          {reminderData.type === 'next_episode' && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Episode Number</label>
              <input
                type="number"
                value={reminderData.episodeNumber}
                onChange={(e) => setReminderData({...reminderData, episodeNumber: e.target.value})}
                className="w-full p-2 border rounded"
                min="1"
              />
            </div>
          )}

          {reminderData.type === 'custom_schedule' && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Scheduled Time</label>
              <input
                type="datetime-local"
                value={reminderData.scheduledTime}
                onChange={(e) => setReminderData({...reminderData, scheduledTime: e.target.value})}
                className="w-full p-2 border rounded"
              />
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Remind Me At</label>
            <input
              type="datetime-local"
              value={reminderData.reminderTime}
              onChange={(e) => setReminderData({...reminderData, reminderTime: e.target.value})}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Setting...' : 'Set Reminder'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReminderModal;