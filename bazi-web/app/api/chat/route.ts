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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, profileId } = body;

    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid request: messages array is required' },
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

    const response = await handleChat({ messages, profileId });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
