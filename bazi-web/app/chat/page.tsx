'use client';

import React, { useState, useRef, useEffect } from 'react';
import ChatInput from '@/components/ChatInput';
import MessageList from '@/components/MessageList';
import SuggestionChips from '@/components/SuggestionChips';
import Link from 'next/link';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const SUGGESTIONS = [
  '帮我算算八字',
  '什么是十神？',
  '今年的运势怎么样',
  '身强身弱是什么意思'
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (content: string) => {
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.content,
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '抱歉，出现了一些问题，请稍后再试。',
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSend(suggestion);
  };

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-zinc-900">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">
        <Link
          href="/"
          className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">八字 AI 命理师</h1>
        <Link
          href="/profiles"
          className="text-sm text-amber-600 hover:text-amber-700"
        >
          档案管理
        </Link>
      </header>

      {/* Messages */}
      {messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="text-6xl mb-4">🤖</div>
          <h2 className="text-2xl font-semibold text-zinc-800 dark:text-zinc-100 mb-2">
            你好，我是你的 AI 命理师
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-8">
            有什么可以帮你的吗？
          </p>
          <SuggestionChips
            suggestions={SUGGESTIONS}
            onSelect={handleSuggestionClick}
          />
        </div>
      ) : (
        <>
          <MessageList messages={messages} isLoading={isLoading} />
          <div ref={messagesEndRef} />
        </>
      )}

      {/* Input */}
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-700">
        <ChatInput onSend={handleSend} disabled={isLoading} />
      </div>
    </div>
  );
}
