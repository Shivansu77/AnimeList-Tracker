import React, { useState, useEffect } from 'react';
import { SpoilerText } from './SpoilerProtection';
import { reviewService } from '../services/api';

const ReviewList = ({ animeId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await reviewService.getByAnime(animeId);
        setReviews(data);
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [animeId]);

  if (loading) {
    return <div className="text-center py-4">Loading reviews...</div>;
  }

  if (reviews.length === 0) {
    return <div className="text-center py-4 text-gray-500">No reviews yet</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold mb-4">Reviews ({reviews.length})</h3>
      
      {reviews.map((review) => (
        <div key={review._id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="font-semibold">{review.user.username}</span>
              <span className="ml-2 text-sm text-gray-500">
                {new Date(review.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-yellow-500">★</span>
              <span className="font-bold">{review.rating}/10</span>
            </div>
          </div>
          
          <SpoilerText
            content={review.content}
            className="text-gray-700 dark:text-gray-300"
          />
        </div>
      ))}
    </div>
  );
};

export default ReviewList;