'use client';

import React, { useState, useRef, useEffect } from 'react';
import MessageList from '@/components/MessageList';
import ChatInput from '@/components/ChatInput';
import SuggestionChips from '@/components/SuggestionChips';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatPanelProps {
  profileId: string;
  profileName?: string;
  onBack?: () => void;
}

const SUGGESTIONS = [
  '帮我算算八字',
  '什么是十神？',
  '今年的运势怎么样',
  '身强身弱是什么意思'
];

export default function ChatPanel({ profileId, profileName, onBack }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoadingHistory(true);
        const res = await fetch(`/api/chat?profileId=${profileId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.messages && data.messages.length > 0) {
            setMessages(data.messages.map((m: any) => ({
              id: m.id,
              role: m.role,
              content: m.content,
              timestamp: new Date(m.timestamp)
            })));
          }
        }
      } catch (err) {
        console.error('Failed to fetch chat history:', err);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    if (profileId) {
      fetchHistory();
    }
  }, [profileId]);

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
          })),
          profileId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      const assistantId = crypto.randomUUID();

      const assistantMessage: Message = {
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, assistantMessage]);

      let fullText = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId ? { ...msg, content: fullText } : msg
          )
        );
      }
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
    <div className="flex flex-col h-full bg-transparent relative">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/[0.05] bg-white/[0.01]">
        <h1 className="text-sm font-mono tracking-widest text-zinc-300 uppercase flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-white opacity-50"></span>
          {profileName ? `与 ${profileName} 的元神对话` : '元神对话'}
        </h1>
      </header>

      {/* Messages */}
      {isLoadingHistory ? (
        <div className="flex-1 flex items-center justify-center bg-black">
          <div className="w-6 h-6 border-2 border-zinc-600 border-t-zinc-300 rounded-full animate-spin"></div>
        </div>
      ) : messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-black">
          <div className="text-4xl grayscale opacity-50 mb-6 font-mono">[SYS]</div>
          <h2 className="text-sm font-bold tracking-widest text-zinc-400 mb-2 text-center uppercase">
            命运解析系统已就绪 / System Ready
          </h2>
          <p className="text-zinc-400 font-mono text-xs text-center max-w-sm mb-12 leading-relaxed uppercase tracking-wider">
            {profileName
              ? `Profile [${profileName}] loaded. Awaiting query.`
              : 'Awaiting query.'}
          </p>
          <div className="w-full max-w-md">
            <SuggestionChips
              suggestions={SUGGESTIONS}
              onSelect={handleSuggestionClick}
            />
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
          <MessageList messages={messages} isLoading={isLoading} />
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-zinc-800 bg-black">
        <ChatInput onSend={handleSend} disabled={isLoading} />
      </div>
    </div>
  );
}
