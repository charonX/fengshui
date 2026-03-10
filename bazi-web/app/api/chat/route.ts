import { NextRequest, NextResponse } from 'next/server';
import { handleChat } from '@/lib/services/chat-api';
import { initAgentTools } from '@/lib/services/agent-tools';
import { initDatabase } from '@/lib/services/profile-store';
import { getSessionUser } from '@/lib/auth';
import path from 'path';

// 初始化数据库和工具（单次初始化）
const dbPath = path.join(process.cwd(), 'data', 'bazi.db');
const store = initDatabase(dbPath);
const knowledgeDir = path.join(process.cwd(), 'knowledge');

// 初始化 Agent 工具
initAgentTools(store, knowledgeDir);

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const profileId = url.searchParams.get('profileId');

    if (!profileId) {
      return NextResponse.json({ error: 'profileId is required' }, { status: 400 });
    }

    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = store.getProfile(profileId);
    if (!profile || profile.userId !== user.id) {
      return NextResponse.json(
        { error: 'Profile not found or unauthorized' },
        { status: 404 }
      );
    }

    const messages = store.getMessages(profileId);
    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Chat API GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, profileId } = body;

    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: messages array is required and must not be empty' },
        { status: 400 }
      );
    }

    const profile = store.getProfile(profileId);
    if (!profile || profile.userId !== user.id) {
      return NextResponse.json(
        { error: 'Profile not found or unauthorized' },
        { status: 404 }
      );
    }

    // Save the latest user message immediately
    const lastUserMessage = messages[messages.length - 1];
    store.saveMessage({
      profileId,
      role: 'user',
      content: lastUserMessage.content
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const response = await handleChat({ messages, profileId }, (textChunk) => {
            controller.enqueue(encoder.encode(textChunk));
          });

          // Save the assistant's complete reply
          store.saveMessage({
            profileId,
            role: 'assistant',
            content: response.content
          });

          controller.close();
        } catch (error) {
          console.error('Chat API stream error:', error);
          controller.error(error);
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
