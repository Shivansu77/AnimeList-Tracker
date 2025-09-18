const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3003/api';

export const reminderService = {
  async getReminders() {
    const response = await fetch(`${API_BASE_URL}/reminders`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new Error('Failed to fetch reminders');
    return response.json();
  },

  async createReminder(reminderData) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const response = await fetch(`${API_BASE_URL}/reminders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(reminderData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create reminder');
    }
    
    return response.json();
  },

  async deleteReminder(id) {
    const response = await fetch(`${API_BASE_URL}/reminders/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new Error('Failed to delete reminder');
    return response.json();
  },

  async getPendingNotifications() {
    const response = await fetch(`${API_BASE_URL}/reminders/pending`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new Error('Failed to fetch notifications');
    return response.json();
  },

  async markAsNotified(id) {
    const response = await fetch(`${API_BASE_URL}/reminders/${id}/notified`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new Error('Failed to mark as notified');
    return response.json();
  }
};