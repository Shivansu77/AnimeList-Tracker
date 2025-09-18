import React, { useState, useEffect } from 'react';
import { watchlistShareService } from '../services/watchlistShareService';

const ShareWatchlistModal = ({ open, onClose }) => {
  const [shareData, setShareData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) {
      loadShareStatus();
    }
  }, [open]);

  const loadShareStatus = async () => {
    try {
      const status = await watchlistShareService.getShareStatus();
      setShareData(status);
    } catch (error) {
      console.error('Error loading share status:', error);
    }
  };

  const handleShare = async () => {
    setLoading(true);
    try {
      const result = await watchlistShareService.shareWatchlist();
      setShareData({
        isPublic: true,
        shareToken: result.shareToken,
        shareUrl: result.shareUrl
      });
    } catch (error) {
      console.error('Error sharing watchlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async () => {
    setLoading(true);
    try {
      await watchlistShareService.revokeSharing();
      setShareData({
        isPublic: false,
        shareToken: null,
        shareUrl: null
      });
    } catch (error) {
      console.error('Error revoking sharing:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (shareData?.shareUrl) {
      await navigator.clipboard.writeText(shareData.shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareToSocial = (platform) => {
    const url = shareData?.shareUrl;
    const text = "Check out my anime watchlist!";
    
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`);
        break;
      default:
        break;
    }
  };

  if (!open) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        padding: '1.5rem',
        width: '24rem',
        maxWidth: '28rem'
      }}>
        <h3 style={{
          fontSize: '1.125rem',
          fontWeight: 'bold',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center'
        }}>
          <span style={{ marginRight: '0.5rem' }}>📤</span>
          Share Your Watchlist
        </h3>
        
        {shareData?.isPublic ? (
          <div>
            <div style={{
              backgroundColor: '#dcfce7',
              border: '1px solid #4ade80',
              color: '#166534',
              padding: '0.75rem 1rem',
              borderRadius: '0.25rem',
              marginBottom: '1rem'
            }}>
              Your watchlist is now public and shareable!
            </div>
            
            <p style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              marginBottom: '0.75rem'
            }}>
              Share this link with friends or the community:
            </p>
            
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              marginBottom: '0.75rem'
            }}>
              <input
                type="text"
                value={shareData.shareUrl || ''}
                readOnly
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.25rem',
                  fontSize: '0.875rem'
                }}
              />
              <button
                onClick={copyToClipboard}
                style={{
                  padding: '0.5rem 0.75rem',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  borderRadius: '0.25rem',
                  border: 'none',
                  cursor: 'pointer'
                }}
                title="Copy to clipboard"
              >
                📋
              </button>
            </div>
            
            {copied && (
              <p style={{
                color: '#059669',
                fontSize: '0.875rem',
                marginBottom: '0.75rem'
              }}>
                Link copied to clipboard!
              </p>
            )}
            
            <div style={{ marginBottom: '1rem' }}>
              <p style={{
                fontSize: '0.875rem',
                marginBottom: '0.5rem'
              }}>Share on social media:</p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => shareToSocial('twitter')}
                  style={{
                    padding: '0.25rem 0.75rem',
                    border: '1px solid #60a5fa',
                    color: '#2563eb',
                    borderRadius: '0.25rem',
                    fontSize: '0.875rem',
                    backgroundColor: 'transparent',
                    cursor: 'pointer'
                  }}
                >
                  Twitter
                </button>
                <button
                  onClick={() => shareToSocial('whatsapp')}
                  style={{
                    padding: '0.25rem 0.75rem',
                    border: '1px solid #4ade80',
                    color: '#059669',
                    borderRadius: '0.25rem',
                    fontSize: '0.875rem',
                    backgroundColor: 'transparent',
                    cursor: 'pointer'
                  }}
                >
                  WhatsApp
                </button>
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <input
                type="checkbox"
                id="publicToggle"
                checked={shareData.isPublic}
                onChange={() => shareData.isPublic ? handleRevoke() : handleShare()}
                disabled={loading}
                style={{ marginRight: '0.5rem' }}
              />
              <label htmlFor="publicToggle" style={{ fontSize: '0.875rem' }}>
                Make watchlist public
              </label>
            </div>
          </div>
        ) : (
          <div>
            <p style={{ marginBottom: '1rem' }}>
              Make your watchlist public to share it with friends and the community.
            </p>
            
            <div style={{
              backgroundColor: '#dbeafe',
              border: '1px solid #60a5fa',
              color: '#1d4ed8',
              padding: '0.75rem 1rem',
              borderRadius: '0.25rem',
              marginBottom: '1rem'
            }}>
              Others will be able to view your anime list but cannot edit it.
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <input
                type="checkbox"
                id="publicToggle"
                checked={false}
                onChange={() => handleShare()}
                disabled={loading}
                style={{ marginRight: '0.5rem' }}
              />
              <label htmlFor="publicToggle" style={{ fontSize: '0.875rem' }}>
                Make watchlist public
              </label>
            </div>
          </div>
        )}
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              backgroundColor: '#d1d5db',
              padding: '0.5rem',
              borderRadius: '0.25rem',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareWatchlistModal;