import { NextRequest, NextResponse } from 'next/server';
import { initDatabase } from '@/lib/services/profile-store';
import path from 'path';

// 初始化数据库
const dbPath = path.join(process.cwd(), 'data', 'bazi.db');
const store = initDatabase(dbPath);

// GET - 获取单个档案
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const profile = store.getProfile(id);

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Failed to get profile:', error);
    return NextResponse.json(
      { error: 'Failed to get profile' },
      { status: 500 }
    );
  }
}

// DELETE - 删除单个档案
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = store.deleteProfile(id);

    if (!success) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete profile:', error);
    return NextResponse.json(
      { error: 'Failed to delete profile' },
      { status: 500 }
    );
  }
}

// PUT - 更新单个档案
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, birthDate, birthTime, birthPlace, longitude, gender } = body;

    const existing = store.getProfile(id);
    if (!existing) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    const updates: any = {};
    if (name) updates.name = name;
    if (birthDate) updates.birthDate = birthDate;
    if (birthTime) updates.birthTime = birthTime;
    if (birthPlace !== undefined) updates.birthPlace = birthPlace;
    if (longitude !== undefined) updates.longitude = longitude;
    if (gender) updates.gender = gender;

    const updated = store.updateProfile(id, updates);

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
