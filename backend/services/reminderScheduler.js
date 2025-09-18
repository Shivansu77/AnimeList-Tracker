const cron = require('node-cron');
const Reminder = require('../models/Reminder');
const Episode = require('../models/Episode');
const User = require('../models/User');

// Check reminders every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  try {
    const now = new Date();
    
    // Find due reminders
    const dueReminders = await Reminder.find({
      reminderTime: { $lte: now },
      isSent: false,
      isActive: true
    }).populate('userId animeId');

    for (const reminder of dueReminders) {
      await sendNotification(reminder);
      
      // Mark as sent
      reminder.isSent = true;
      await reminder.save();
      
      // For custom schedules, create next reminder
      if (reminder.type === 'custom_schedule') {
        await createNextCustomReminder(reminder);
      }
    }
    
    if (dueReminders.length > 0) {
      console.log(`Processed ${dueReminders.length} reminders`);
    }
  } catch (error) {
    console.error('Reminder scheduler error:', error);
  }
});

async function sendNotification(reminder) {
  try {
    let message = '';
    
    switch (reminder.type) {
      case 'next_episode':
        message = `Episode ${reminder.episodeNumber} of ${reminder.animeId.title} is airing soon!`;
        break;
      case 'anime_start':
        message = `${reminder.animeId.title} is starting to air!`;
        break;
      case 'custom_schedule':
        message = `Time to watch ${reminder.animeId.title}!`;
        break;
    }
    
    // Store in-app notification (you can extend this for email/push)
    console.log(`📺 Notification for ${reminder.userId.username}: ${message}`);
    
    // Here you could add:
    // - Email notification
    // - Push notification
    // - WebSocket real-time notification
    
  } catch (error) {
    console.error('Send notification error:', error);
  }
}

async function createNextCustomReminder(reminder) {
  try {
    const nextWeek = new Date(reminder.reminderTime);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const newReminder = new Reminder({
      userId: reminder.userId._id,
      animeId: reminder.animeId._id,
      type: 'custom_schedule',
      customSchedule: reminder.customSchedule,
      reminderTime: nextWeek,
      isSent: false,
      isActive: true
    });
    
    await newReminder.save();
  } catch (error) {
    console.error('Create next custom reminder error:', error);
  }
}

module.exports = { sendNotification };