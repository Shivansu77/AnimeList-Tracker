import React, { useState, useEffect } from 'react';
import { streamingService } from '../services/streamingService';

const StreamingLinks = ({ animeId }) => {
  const [streamingLinks, setStreamingLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (animeId) {
      loadStreamingLinks();
    }
  }, [animeId]);

  const loadStreamingLinks = async () => {
    try {
      const links = await streamingService.getAnimeStreaming(animeId);
      setStreamingLinks(links);
    } catch (error) {
      console.error('Error loading streaming links:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-gray-500">Loading streaming options...</div>;

  if (streamingLinks.length === 0) {
    return <div className="text-gray-500">No streaming options available</div>;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Watch Now</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {streamingLinks.map((link) => (
          <a
            key={link._id}
            href={link.streamingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            {link.platformId.logo && (
              <img
                src={link.platformId.logo}
                alt={link.platformId.name}
                className="w-8 h-8 mr-3 rounded"
              />
            )}
            <div className="flex-1">
              <div className="font-medium">{link.platformId.name}</div>
              <div className="text-sm text-gray-500">
                {link.subscriptionRequired ? 'Subscription Required' : 'Free'}
                {link.region && ` • ${link.region}`}
              </div>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        ))}
      </div>
    </div>
  );
};

export default StreamingLinks;