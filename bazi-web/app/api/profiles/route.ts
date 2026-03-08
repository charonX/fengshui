import { NextRequest, NextResponse } from 'next/server';
import { initDatabase } from '@/lib/services/profile-store';
import { initAgentTools } from '@/lib/services/agent-tools';
import { getSessionUser } from '@/lib/auth';
import path from 'path';

// 初始化数据库
const dbPath = path.join(process.cwd(), 'data', 'bazi.db');
const store = initDatabase(dbPath);
const knowledgeDir = path.join(process.cwd(), 'knowledge');

// 初始化 Agent 工具
initAgentTools(store, knowledgeDir);

// GET - 列出所有档案
export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profiles = store.listProfiles(user.id);
    return NextResponse.json(profiles);
  } catch (error) {
    console.error('Failed to list profiles:', error);
    return NextResponse.json(
      { error: 'Failed to list profiles' },
      { status: 500 }
    );
  }
}

// POST - 创建新档案
export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, birthDate, birthTime, birthPlace, longitude, gender } = body;

    if (!name || !birthDate || !birthTime || !gender) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const profile = store.saveProfile({
      name,
      birthDate,
      birthTime,
      birthPlace,
      longitude,
      gender,
      userId: user.id
    });

    return NextResponse.json(profile, { status: 201 });
  } catch (error) {
    console.error('Failed to create profile:', error);
    return NextResponse.json(
      { error: 'Failed to create profile' },
      { status: 500 }
    );
  }
}
