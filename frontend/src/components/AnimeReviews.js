import React, { useState } from 'react';
import ReviewForm from './ReviewForm';
import ReviewList from './ReviewList';

const AnimeReviews = ({ animeId }) => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleReviewAdded = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <ReviewForm 
        animeId={animeId} 
        onReviewAdded={handleReviewAdded}
      />
      
      <ReviewList 
        animeId={animeId}
        key={refreshKey}
      />
    </div>
  );
};

export default AnimeReviews;