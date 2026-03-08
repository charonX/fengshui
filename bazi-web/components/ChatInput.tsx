'use client';

import React, { useState } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || disabled) return;
    onSend(input);
    setInput('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-4 relative items-end">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="输入您想推演的问题..."
        disabled={disabled}
        className="flex-1 px-2 py-3 bg-transparent border-b border-zinc-800 text-white placeholder:text-zinc-400 focus:outline-none focus:border-white transition-colors font-light tracking-wide rounded-none"
      />
      <button
        type="submit"
        disabled={disabled || !input.trim()}
        className="px-6 py-3 bg-white text-black font-bold tracking-widest text-xs uppercase hover:bg-zinc-300 transition-colors disabled:opacity-30 disabled:hover:bg-white disabled:cursor-not-allowed"
      >
        推演
      </button>
    </form>
  );
}
