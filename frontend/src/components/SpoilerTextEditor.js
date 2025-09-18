import React, { useState, useRef } from 'react';

const SpoilerTextEditor = ({ value, onChange, placeholder = "Write your text..." }) => {
  const textareaRef = useRef(null);
  const [showSpoilerButton, setShowSpoilerButton] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });

  const handleTextSelect = () => {
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    if (start !== end) {
      // Calculate button position near selection
      const rect = textarea.getBoundingClientRect();
      const textBeforeSelection = value.substring(0, start);
      const lines = textBeforeSelection.split('\n');
      const currentLine = lines.length - 1;
      const charInLine = lines[lines.length - 1].length;
      
      // Approximate position (this is a simple calculation)
      const lineHeight = 20;
      const charWidth = 8;
      const x = Math.min(charInLine * charWidth + 10, rect.width - 100);
      const y = currentLine * lineHeight + 30;
      
      setButtonPosition({ x, y });
      setShowSpoilerButton(true);
    } else {
      setShowSpoilerButton(false);
    }
  };

  const handleKeyDown = (e) => {
    // Ctrl+S or Cmd+S for spoiler
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      if (showSpoilerButton) {
        markAsSpoiler();
      }
    }
  };

  const markAsSpoiler = () => {
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    if (selectedText) {
      const newText = 
        value.substring(0, start) + 
        `||${selectedText}||` + 
        value.substring(end);
      
      onChange(newText);
      setShowSpoilerButton(false);
      
      // Reset selection
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + selectedText.length + 4, start + selectedText.length + 4);
      }, 0);
    }
  };

  const removeSpoilerTags = () => {
    const newText = value.replace(/\|\|([^|]+)\|\|/g, '$1');
    onChange(newText);
  };

  const hasSpoilerTags = value.includes('||');

  return (
    <div className="relative">
      {/* Small Toolbar */}
      <div className="flex gap-2 mb-2">
        {hasSpoilerTags && (
          <button
            type="button"
            onClick={removeSpoilerTags}
            className="bg-gray-500 hover:bg-gray-600 text-white text-xs px-2 py-1 rounded transition-colors"
            title="Remove all spoiler tags"
          >
            🗑️ Clear All Spoilers
          </button>
        )}
        
        <div className="text-xs text-gray-500 flex items-center">
          💡 Select text to mark as spoiler
        </div>
      </div>
      
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onSelect={handleTextSelect}
        onMouseUp={handleTextSelect}
        onKeyUp={handleTextSelect}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full p-3 border rounded-md dark:bg-gray-700 dark:border-gray-600 min-h-[100px] resize-vertical"
        rows={4}
      />
      
      {/* Floating Spoiler Button */}
      {showSpoilerButton && (
        <button
          type="button"
          onClick={markAsSpoiler}
          className="
            absolute z-10 bg-orange-500 hover:bg-orange-600 text-white 
            text-xs px-2 py-1 rounded shadow-lg transition-all duration-200
            border border-orange-600
          "
          style={{
            left: `${buttonPosition.x}px`,
            top: `${buttonPosition.y}px`
          }}
          title="Mark selected text as spoiler (Ctrl+S)"
        >
          🔒 Spoiler
        </button>
      )}

      
      {/* Preview */}
      {value && (
        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded border">
          <div className="text-sm font-medium mb-2">Preview:</div>
          <div className="text-sm">
            {value.split(/(\\|\\|[^|]+\\|\\|)/).map((part, index) => {
              if (part.startsWith('||') && part.endsWith('||')) {
                const spoilerContent = part.slice(2, -2);
                return (
                  <span
                    key={index}
                    className="bg-black text-black hover:bg-orange-100 hover:text-orange-800 cursor-pointer px-1 rounded transition-colors"
                    title="Spoiler - hover to reveal"
                  >
                    {spoilerContent}
                  </span>
                );
              }
              return part;
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SpoilerTextEditor;