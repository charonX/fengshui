/**
 * 用户档案管理服务
 * 使用 SQLite 存储用户档案和对话历史
 */

import Database from 'better-sqlite3';
import path from 'path';
import { calculateBazi, BaziResult } from './bazi';

/**
 * 用户档案
 */
export interface UserProfile {
  id: string;
  userId?: string; // Optional for backward compatibility, but required for new profiles
  name: string;
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:mm
  birthPlace?: string;
  longitude?: number; // 经度，用于真太阳时校正
  gender: 'male' | 'female';
  createdAt: Date;
  updatedAt: Date;
  // 缓存的排盘结果
  baziResult?: BaziResult;
}

/**
 * 对话消息
 */
export interface ChatMessage {
  id: string;
  profileId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

/**
 * ProfileStore 接口定义
 */
export interface ProfileStore {
  getProfile(id: string): UserProfile | null;
  saveProfile(profile: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>): UserProfile;
  updateProfile(id: string, updates: Partial<UserProfile>): UserProfile | null;
  deleteProfile(id: string): boolean;
  listProfiles(userId?: string): UserProfile[];

  // 对话历史
  saveMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage;
  getMessages(profileId: string, limit?: number): ChatMessage[];
  deleteMessages(profileId: string): void;
}

/**
 * SQLite 实现
 */
export class SQLiteProfileStore implements ProfileStore {
  private db: Database;

  constructor(dbPath: string) {
    // 确保目录存在
    const dir = path.dirname(dbPath);
    if (!require('fs').existsSync(dir)) {
      require('fs').mkdirSync(dir, { recursive: true });
    }

    this.db = new Database(dbPath);
    this.initTables();
  }

  /**
   * 初始化数据库表
   */
  private initTables() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS profiles (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        birth_date TEXT NOT NULL,
        birth_time TEXT NOT NULL,
        birth_place TEXT,
        longitude REAL,
        gender TEXT NOT NULL,
        bazi_cache TEXT,
        user_id TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

    // Migration: Add user_id column if it doesn't exist (for existing databases)
    try {
      const tableInfo = this.db.pragma('table_info(profiles)') as any[];
      const hasUserId = tableInfo.some(col => col.name === 'user_id');
      if (!hasUserId) {
        this.db.exec('ALTER TABLE profiles ADD COLUMN user_id TEXT');
        console.log('Migrated database: added user_id column to profiles table.');
      }
    } catch (error) {
      console.error('Database migration error:', error);
    }

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id TEXT PRIMARY KEY,
        profile_id TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
      )
    `);

    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_messages_profile
      ON chat_messages(profile_id, timestamp)
    `);
  }

  /**
   * 获取档案
   */
  getProfile(id: string): UserProfile | null {
    const row = this.db.prepare('SELECT * FROM profiles WHERE id = ?').get(id) as any;
    if (!row) return null;

    return {
      ...row,
      birthDate: row.birth_date,
      birthTime: row.birth_time,
      birthPlace: row.birth_place,
      userId: row.user_id,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      baziResult: row.bazi_cache ? JSON.parse(row.bazi_cache) : undefined
    };
  }

  /**
   * 保存档案
   */
  saveProfile(profile: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>): UserProfile {
    const id = require('crypto').randomUUID();
    const now = new Date().toISOString();

    // 计算排盘结果并缓存
    let baziResult: BaziResult | undefined;
    try {
      baziResult = calculateBazi(
        profile.birthDate,
        profile.birthTime,
        profile.longitude,
        profile.gender
      );
    } catch (error) {
      console.error('Error calculating bazi:', error);
    }

    this.db.prepare(`
      INSERT INTO profiles (id, name, birth_date, birth_time, birth_place, longitude, gender, bazi_cache, user_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      profile.name,
      profile.birthDate,
      profile.birthTime,
      profile.birthPlace || null,
      profile.longitude || null,
      profile.gender,
      baziResult ? JSON.stringify(baziResult) : null,
      profile.userId || null,
      now,
      now
    );

    return {
      ...profile,
      id,
      createdAt: new Date(now),
      updatedAt: new Date(now),
      baziResult
    };
  }

  /**
   * 更新档案
   */
  updateProfile(id: string, updates: Partial<UserProfile>): UserProfile | null {
    const existing = this.getProfile(id);
    if (!existing) return null;

    const now = new Date().toISOString();

    // 如果出生信息改变，重新计算排盘
    let baziResult = existing.baziResult;
    if (updates.birthDate || updates.birthTime || updates.longitude) {
      try {
        baziResult = calculateBazi(
          updates.birthDate || existing.birthDate,
          updates.birthTime || existing.birthTime,
          updates.longitude || existing.longitude,
          existing.gender
        );
      } catch (error) {
        console.error('Error recalculating bazi:', error);
      }
    }

    const fields: string[] = [];
    const values: any[] = [];

    if (updates.name) { fields.push('name = ?'); values.push(updates.name); }
    if (updates.birthDate) { fields.push('birth_date = ?'); values.push(updates.birthDate); }
    if (updates.birthTime) { fields.push('birth_time = ?'); values.push(updates.birthTime); }
    if (updates.birthPlace !== undefined) { fields.push('birth_place = ?'); values.push(updates.birthPlace); }
    if (updates.longitude !== undefined) { fields.push('longitude = ?'); values.push(updates.longitude); }
    if (updates.gender) { fields.push('gender = ?'); values.push(updates.gender); }
    if (updates.userId !== undefined) { fields.push('user_id = ?'); values.push(updates.userId); }
    if (baziResult) { fields.push('bazi_cache = ?'); values.push(JSON.stringify(baziResult)); }

    fields.push('updated_at = ?');
    values.push(now);
    values.push(id);

    this.db.prepare(`UPDATE profiles SET ${fields.join(', ')} WHERE id = ?`).run(...values);

    return this.getProfile(id)!;
  }

  /**
   * 删除档案
   */
  deleteProfile(id: string): boolean {
    const result = this.db.prepare('DELETE FROM profiles WHERE id = ?').run(id);
    return result.changes > 0;
  }

  /**
   * 列出档案
   */
  listProfiles(userId?: string): UserProfile[] {
    let rows: any[];
    if (userId) {
      rows = this.db.prepare('SELECT * FROM profiles WHERE user_id = ? ORDER BY created_at DESC').all(userId) as any[];
    } else {
      rows = this.db.prepare('SELECT * FROM profiles ORDER BY created_at DESC').all() as any[];
    }

    return rows.map(row => ({
      ...row,
      birthDate: row.birth_date,
      birthTime: row.birth_time,
      birthPlace: row.birth_place,
      userId: row.user_id,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      baziResult: row.bazi_cache ? JSON.parse(row.bazi_cache) : undefined
    }));
  }

  /**
   * 保存对话消息
   */
  saveMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage {
    const id = require('crypto').randomUUID();
    const timestamp = new Date().toISOString();

    this.db.prepare(`
      INSERT INTO chat_messages (id, profile_id, role, content, timestamp)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, message.profileId, message.role, message.content, timestamp);

    return {
      ...message,
      id,
      timestamp: new Date(timestamp)
    };
  }

  /**
   * 获取对话历史
   */
  getMessages(profileId: string, limit: number = 50): ChatMessage[] {
    const rows = this.db.prepare(`
      SELECT * FROM chat_messages
      WHERE profile_id = ?
      ORDER BY timestamp ASC
      LIMIT ?
    `).all(profileId, limit) as any[];

    return rows.map(row => ({
      ...row,
      timestamp: new Date(row.timestamp)
    }));
  }

  /**
   * 删除对话历史
   */
  deleteMessages(profileId: string): void {
    this.db.prepare('DELETE FROM chat_messages WHERE profile_id = ?').run(profileId);
  }

  /**
   * 关闭数据库连接
   */
  close() {
    this.db.close();
  }
}

/**
 * 数据库初始化脚本
 */
export function initDatabase(dbPath: string): SQLiteProfileStore {
  return new SQLiteProfileStore(dbPath);
}
