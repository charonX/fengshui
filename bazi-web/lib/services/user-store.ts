import Database from 'better-sqlite3';
import path from 'path';

export interface User {
    id: string;
    email: string;
    passwordHash: string;
    createdAt: Date;
}

export interface UserStore {
    getUserById(id: string): User | null;
    getUserByEmail(email: string): User | null;
    createUser(email: string, passwordHash: string): User;
}

export class SQLiteUserStore implements UserStore {
    private db: Database;

    constructor(dbPath: string) {
        const dir = path.dirname(dbPath);
        if (!require('fs').existsSync(dir)) {
            require('fs').mkdirSync(dir, { recursive: true });
        }

        this.db = new Database(dbPath);
        this.initTables();
    }

    private initTables() {
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    `);
    }

    getUserById(id: string): User | null {
        const row = this.db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
        if (!row) return null;

        return {
            id: row.id,
            email: row.email,
            passwordHash: row.password_hash,
            createdAt: new Date(row.created_at)
        };
    }

    getUserByEmail(email: string): User | null {
        const row = this.db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
        if (!row) return null;

        return {
            id: row.id,
            email: row.email,
            passwordHash: row.password_hash,
            createdAt: new Date(row.created_at)
        };
    }

    createUser(email: string, passwordHash: string): User {
        const id = require('crypto').randomUUID();
        const now = new Date().toISOString();

        this.db.prepare(`
      INSERT INTO users (id, email, password_hash, created_at)
      VALUES (?, ?, ?, ?)
    `).run(id, email, passwordHash, now);

        return {
            id,
            email,
            passwordHash,
            createdAt: new Date(now)
        };
    }

    close() {
        this.db.close();
    }
}

let userStoreInstance: UserStore | null = null;

export function initUserStore(dbPath: string): UserStore {
    if (!userStoreInstance) {
        userStoreInstance = new SQLiteUserStore(dbPath);
    }
    return userStoreInstance;
}

export function getUserStore(): UserStore {
    if (!userStoreInstance) {
        // Default fallback to data/bazi.db if not explicitly initialized
        // In production, you'd want to ensure explicit initialization happens early
        return initUserStore(path.join(process.cwd(), 'data', 'bazi.db'));
    }
    return userStoreInstance;
}
