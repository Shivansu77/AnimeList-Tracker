import React, { useState, useEffect } from 'react';
import { reminderService } from '../services/reminderService';

const Reminders = () => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      const data = await reminderService.getReminders();
      setReminders(data);
    } catch (error) {
      console.error('Error loading reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteReminder = async (id) => {
    try {
      await reminderService.deleteReminder(id);
      setReminders(prev => prev.filter(r => r._id !== id));
    } catch (error) {
      console.error('Error deleting reminder:', error);
    }
  };

  if (loading) return <div className="p-4">Loading reminders...</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">My Reminders</h2>
      
      {reminders.length === 0 ? (
        <p className="text-gray-500">No active reminders</p>
      ) : (
        <div className="space-y-4">
          {reminders.map(reminder => (
            <div key={reminder._id} className="bg-white p-4 rounded-lg shadow border">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold">{reminder.animeTitle}</h3>
                  <p className="text-sm text-gray-600">
                    {reminder.type === 'episode' && `Episode ${reminder.episodeNumber}`}
                    {reminder.type === 'season' && 'New Season'}
                    {reminder.type === 'scheduled' && 'Scheduled Watch'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Reminder: {new Date(reminder.reminderTime).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => deleteReminder(reminder._id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reminders;