import React, { useState } from 'react';
import { reviewService } from '../services/api';
import SpoilerTextEditor from './SpoilerTextEditor';

const ReviewForm = ({ animeId, onReviewAdded }) => {
  const [formData, setFormData] = useState({
    rating: 5,
    content: '',
    isSpoiler: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.content.trim()) return;

    setIsSubmitting(true);
    try {
      const review = await reviewService.create({
        anime: animeId,
        ...formData
      });
      onReviewAdded(review);
      setFormData({ rating: 5, content: '', isSpoiler: false });
    } catch (error) {
      console.error('Failed to submit review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
      
      {/* Rating */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Rating</label>
        <select
          value={formData.rating}
          onChange={(e) => setFormData(prev => ({ ...prev, rating: parseInt(e.target.value) }))}
          className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
        >
          {[...Array(10)].map((_, i) => (
            <option key={i + 1} value={i + 1}>{i + 1}/10</option>
          ))}
        </select>
      </div>

      {/* Content with Spoiler Editor */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Review</label>
        <SpoilerTextEditor
          value={formData.content}
          onChange={(content) => {
            setFormData(prev => ({ 
              ...prev, 
              content,
              isSpoiler: content.includes('||') // Auto-detect spoilers
            }));
          }}
          placeholder="Share your thoughts about this anime... Select text and mark as spoiler if needed."
        />
      </div>

      {/* Auto Spoiler Detection */}
      {formData.content.includes('||') && (
        <div className="mb-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded">
          <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
            <span>⚠️</span>
            <span className="text-sm font-medium">
              Spoiler content detected! This review will be marked as containing spoilers.
            </span>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || !formData.content.trim()}
        className="
          w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 
          text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200
        "
      >
        {isSubmitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
};

export default ReviewForm;