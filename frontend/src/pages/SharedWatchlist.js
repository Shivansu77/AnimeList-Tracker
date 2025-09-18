import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { watchlistShareService } from '../services/watchlistShareService';

const SharedWatchlist = () => {
  const { shareToken } = useParams();
  const [watchlistData, setWatchlistData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await watchlistShareService.getSharedWatchlist(shareToken);
        setWatchlistData(data);
      } catch (error) {
        setError('Watchlist not found or not public');
      } finally {
        setLoading(false);
      }
    };
    if (shareToken) {
      loadData();
    }
  }, [shareToken]);

  const loadSharedWatchlist = async () => {
    try {
      console.log('Loading shared watchlist for token:', shareToken);
      const data = await watchlistShareService.getSharedWatchlist(shareToken);
      console.log('Watchlist data loaded:', data);
      setWatchlistData(data);
    } catch (error) {
      console.error('Error loading shared watchlist:', error);
      setError('Watchlist not found or not public');
    } finally {
      setLoading(false);
    }
  };



  const groupByStatus = (watchlist) => {
    return watchlist.reduce((groups, item) => {
      const status = item.status || 'plan-to-watch';
      if (!groups[status]) groups[status] = [];
      groups[status].push(item);
      return groups;
    }, {});
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ textAlign: 'center' }}>Loading shared watchlist...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ 
          backgroundColor: '#fee2e2', 
          border: '1px solid #fca5a5', 
          color: '#dc2626', 
          padding: '1rem', 
          borderRadius: '0.5rem' 
        }}>
          {error}
        </div>
      </div>
    );
  }

  const groupedWatchlist = groupByStatus(watchlistData.watchlist);
  const statusOrder = ['watching', 'completed', 'plan-to-watch', 'on-hold', 'dropped'];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      {/* Header */}
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '0.5rem', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
        padding: '1.5rem', 
        marginBottom: '1.5rem', 
        textAlign: 'center' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
          <div style={{ 
            width: '3rem', 
            height: '3rem', 
            backgroundColor: '#3b82f6', 
            color: 'white', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            marginRight: '1rem', 
            fontSize: '1.25rem', 
            fontWeight: 'bold' 
          }}>
            {watchlistData.username.charAt(0).toUpperCase()}
          </div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', margin: 0 }}>
            {watchlistData.username}'s Watchlist
          </h1>
        </div>
        <p style={{ color: '#6b7280', margin: 0 }}>
          {watchlistData.watchlist.length} anime in total
        </p>
      </div>

      {/* Watchlist by Status */}
      {statusOrder.map(status => {
        const items = groupedWatchlist[status];
        if (!items || items.length === 0) return null;

        return (
          <div key={status} style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', textTransform: 'capitalize' }}>
              {status.replace('-', ' ')} ({items.length})
            </h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
              gap: '1rem' 
            }}>
              {items.filter(item => item.anime).map((item, index) => (
                <div key={index} style={{ 
                  backgroundColor: 'white', 
                  borderRadius: '0.5rem', 
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
                  overflow: 'hidden' 
                }}>
                  <img
                    src={item.anime.poster || 'https://via.placeholder.com/250x400/f5f5f5/999?text=No+Image'}
                    alt={item.anime.title || 'Anime'}
                    style={{ width: '100%', height: '16rem', objectFit: 'cover' }}
                  />
                  <div style={{ padding: '1rem' }}>
                    <h3 style={{ 
                      fontWeight: '600', 
                      fontSize: '1.125rem', 
                      marginBottom: '0.5rem', 
                      whiteSpace: 'nowrap', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis' 
                    }}>
                      {item.anime.title || 'Unknown Anime'}
                    </h3>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginBottom: '0.5rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '0.25rem', 
                        fontSize: '0.75rem',
                        backgroundColor: status === 'watching' ? '#dbeafe' : 
                                       status === 'completed' ? '#dcfce7' : 
                                       status === 'on-hold' ? '#fef3c7' : 
                                       status === 'dropped' ? '#fee2e2' : '#f3f4f6',
                        color: status === 'watching' ? '#1e40af' : 
                               status === 'completed' ? '#166534' : 
                               status === 'on-hold' ? '#92400e' : 
                               status === 'dropped' ? '#dc2626' : '#374151'
                      }}>
                        {status.replace('-', ' ')}
                      </span>
                      {item.rating && (
                        <span style={{ 
                          padding: '0.25rem 0.5rem', 
                          borderRadius: '0.25rem', 
                          fontSize: '0.75rem', 
                          border: '1px solid #d1d5db' 
                        }}>
                          ★ {item.rating}/10
                        </span>
                      )}
                    </div>
                    
                    {item.episodesWatched > 0 && (
                      <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                        Episodes: {item.episodesWatched}/{item.anime.episodes}
                      </p>
                    )}
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                      {item.anime.genres?.slice(0, 2).map(genre => (
                        <span
                          key={genre}
                          style={{ 
                            padding: '0.25rem 0.5rem', 
                            borderRadius: '0.25rem', 
                            fontSize: '0.75rem', 
                            border: '1px solid #d1d5db', 
                            color: '#6b7280' 
                          }}
                        >
                          {genre}
                        </span>
                      )) || []}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {watchlistData.watchlist.length === 0 && (
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '0.5rem', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
          padding: '2rem', 
          textAlign: 'center' 
        }}>
          <h3 style={{ fontSize: '1.25rem', color: '#6b7280' }}>
            This watchlist is empty
          </h3>
        </div>
      )}
    </div>
  );
};

export default SharedWatchlist;