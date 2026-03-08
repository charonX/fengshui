'use client';

import React from 'react';

interface SuggestionChipsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
}

export default function SuggestionChips({ suggestions, onSelect }: SuggestionChipsProps) {
  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          onClick={() => onSelect(suggestion)}
          className="px-3 py-1.5 text-[10px] tracking-widest uppercase border border-zinc-800 text-zinc-400 hover:text-white hover:border-white transition-colors"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
}
