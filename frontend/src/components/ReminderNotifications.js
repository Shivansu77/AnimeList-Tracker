import React, { useState, useEffect } from 'react';
import { reminderService } from '../services/reminderService';

const ReminderNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const checkReminders = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      try {
        const pending = await reminderService.getPendingNotifications();
        setNotifications(pending);
      } catch (error) {
        console.error('Error checking reminders:', error);
      }
    };

    checkReminders();
    const interval = setInterval(checkReminders, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const dismissNotification = async (id) => {
    try {
      await reminderService.markAsNotified(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map(notification => (
        <div key={notification._id} className="bg-blue-500 text-white p-4 rounded-lg shadow-lg max-w-sm">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-bold">{notification.animeTitle}</h4>
              <p className="text-sm">
                {notification.type === 'episode' && `Episode ${notification.episodeNumber} reminder`}
                {notification.type === 'season' && 'New season reminder'}
                {notification.type === 'scheduled' && 'Scheduled watch time'}
              </p>
            </div>
            <button
              onClick={() => dismissNotification(notification._id)}
              className="text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReminderNotifications;