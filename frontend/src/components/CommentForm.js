import React, { useState } from 'react';
import { commentService } from '../services/api';
import SpoilerTextEditor from './SpoilerTextEditor';

const CommentForm = ({ animeId, onCommentAdded }) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const comment = await commentService.create({
        anime: animeId,
        content,
        isSpoiler: content.includes('||')
      });
      onCommentAdded(comment);
      setContent('');
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
      <h4 className="text-md font-semibold mb-3">Add Comment</h4>
      
      <div className="mb-4">
        <SpoilerTextEditor
          value={content}
          onChange={setContent}
          placeholder="Share your thoughts... Select text to mark as spoiler."
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !content.trim()}
        className="
          bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 
          text-white font-bold py-2 px-4 rounded transition-colors duration-200
        "
      >
        {isSubmitting ? 'Posting...' : 'Post Comment'}
      </button>
    </form>
  );
};

export default CommentForm;