import React, { useState } from 'react';

// Inline Spoiler Component
const InlineSpoiler = ({ children, onToggle }) => {
  const [isRevealed, setIsRevealed] = useState(false);

  const handleClick = () => {
    setIsRevealed(!isRevealed);
    if (onToggle) onToggle(!isRevealed);
  };

  return (
    <span
      onClick={handleClick}
      className={`
        inline cursor-pointer transition-all duration-300 px-1 rounded
        ${isRevealed 
          ? 'bg-orange-100 text-orange-800 border border-orange-300' 
          : 'bg-black text-black hover:bg-gray-800 select-none'
        }
      `}
      title={isRevealed ? 'Click to hide spoiler' : 'Click to reveal spoiler'}
    >
      {isRevealed ? children : '█████'}
    </span>
  );
};

// Text with Spoiler Support
const SpoilerText = ({ content, className = '' }) => {
  // Parse content for spoiler tags ||spoiler||
  const parseContent = (text) => {
    const parts = text.split(/(\|\|[^|]+\|\|)/);
    
    return parts.map((part, index) => {
      if (part.startsWith('||') && part.endsWith('||')) {
        const spoilerContent = part.slice(2, -2);
        return (
          <InlineSpoiler key={index}>
            {spoilerContent}
          </InlineSpoiler>
        );
      }
      return part;
    });
  };

  return (
    <div className={className}>
      {parseContent(content)}
    </div>
  );
};

// Legacy Full Content Spoiler Protection
const SpoilerProtection = ({ content, isSpoiler, className = '' }) => {
  const [isRevealed, setIsRevealed] = useState(false);

  if (!isSpoiler) {
    return <SpoilerText content={content} className={className} />;
  }

  return (
    <div className={`relative ${className}`}>
      <div
        className={`
          transition-all duration-500 ease-in-out
          ${isRevealed 
            ? 'filter-none opacity-100' 
            : 'filter blur-md opacity-70 bg-gray-200 dark:bg-gray-700'
          }
          p-3 rounded-lg border-2 border-orange-300 dark:border-orange-600
        `}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-orange-500">⚠️</span>
          <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
            SPOILER WARNING
          </span>
        </div>
        <div className={isRevealed ? '' : 'select-none pointer-events-none'}>
          <SpoilerText content={content} />
        </div>
      </div>
      
      {!isRevealed && (
        <button
          onClick={() => setIsRevealed(true)}
          className="
            absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
            bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg
            transition-colors duration-200 shadow-lg z-10
          "
        >
          Reveal Spoiler
        </button>
      )}
      
      {isRevealed && (
        <button
          onClick={() => setIsRevealed(false)}
          className="
            mt-2 bg-gray-500 hover:bg-gray-600 text-white text-sm py-1 px-3 rounded
            transition-colors duration-200
          "
        >
          Hide Spoiler
        </button>
      )}
    </div>
  );
};

export default SpoilerProtection;
export { SpoilerText, InlineSpoiler };