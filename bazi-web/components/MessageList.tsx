'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
}

export default function MessageList({ messages, isLoading }: MessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex w-full ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[90%] py-2 ${message.role === 'user'
              ? 'text-zinc-400 font-mono tracking-wide text-right'
              : 'text-zinc-300 font-light leading-relaxed pl-4 border-l-2 border-zinc-800 w-full'
              }`}
          >
            {message.role === 'user' ? (
              <p className="whitespace-pre-wrap">{message.content}</p>
            ) : (
              <div className="prose-base space-y-2">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ node, ...props }) => <p className="mb-4 last:mb-0" {...props} />,
                    strong: ({ node, ...props }) => <strong className="font-semibold text-white" {...props} />,
                    em: ({ node, ...props }) => <em className="italic text-zinc-400" {...props} />,
                    h1: ({ node, ...props }) => <h1 className="text-xl font-bold tracking-widest text-white mt-8 mb-4 border-b border-zinc-900 pb-2" {...props} />,
                    h2: ({ node, ...props }) => <h2 className="text-lg font-bold tracking-widest text-white mt-8 mb-4 border-b border-zinc-900 pb-2" {...props} />,
                    h3: ({ node, ...props }) => <h3 className="text-base font-bold tracking-widest text-white mt-6 mb-3" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-disc list-outside ml-5 space-y-1 my-4 text-zinc-300" {...props} />,
                    ol: ({ node, ...props }) => <ol className="list-decimal list-outside ml-5 space-y-1 my-4 text-zinc-300" {...props} />,
                    li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                    blockquote: ({ node, ...props }) => <blockquote className="border-l-2 border-zinc-700 pl-4 italic text-zinc-500 my-4" {...props} />,
                    code: ({ node, ...props }) => <code className="bg-zinc-900/50 text-zinc-200 px-1.5 py-0.5 rounded text-sm font-mono tracking-tighter" {...props} />,
                    pre: ({ node, ...props }) => (
                      <pre className="bg-black border border-zinc-800 p-4 rounded-none overflow-x-auto text-sm font-mono tracking-tight my-6 text-zinc-300 [&>code]:bg-transparent [&>code]:p-0" {...props} />
                    ),
                    table: ({ node, ...props }) => <div className="overflow-x-auto my-6"><table className="w-full text-left border-collapse" {...props} /></div>,
                    th: ({ node, ...props }) => <th className="border-b border-zinc-700 py-3 px-4 font-bold text-white uppercase tracking-widest text-xs" {...props} />,
                    td: ({ node, ...props }) => <td className="border-b border-zinc-900 py-3 px-4 text-zinc-400" {...props} />,
                    a: ({ node, ...props }) => <a className="text-white underline decoration-zinc-600 underline-offset-4 hover:decoration-white transition-colors" {...props} />,
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      ))}
      {isLoading && (
        <div className="flex justify-start">
          <div className="py-2 pl-4 border-l-2 border-zinc-800">
            <div className="flex gap-1.5 items-center">
              <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
