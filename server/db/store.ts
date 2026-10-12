import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DATA_DIR = path.resolve(process.cwd(), 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function generateId(): string {
  // Returns a 24-character hexadecimal ObjectId-compatible string
  return crypto.randomBytes(12).toString('hex');
}

export class DocumentStore<T extends { _id?: string; createdAt?: string; updatedAt?: string }> {
  private collectionName: string;
  private filePath: string;
  private memoryCache: T[] | null = null;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
    this.filePath = path.join(DATA_DIR, `${collectionName}.json`);
    this.initFile();
  }

  private initFile() {
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([], null, 2), 'utf-8');
    }
  }

  private readAll(): T[] {
    try {
      if (this.memoryCache !== null) {
        return this.memoryCache;
      }
      this.initFile();
      const content = fs.readFileSync(this.filePath, 'utf-8');
      this.memoryCache = JSON.parse(content || '[]');
      return this.memoryCache!;
    } catch (err) {
      console.error(`Error reading collection ${this.collectionName}:`, err);
      return [];
    }
  }

  private saveAll(data: T[]) {
    this.memoryCache = data;
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error(`Error saving collection ${this.collectionName}:`, err);
    }
  }

  public async find(filter: Partial<T> | ((item: T) => boolean) = {}): Promise<T[]> {
    const all = this.readAll();
    if (typeof filter === 'function') {
      return all.filter(filter);
    }
    return all.filter(item => {
      for (const key of Object.keys(filter) as (keyof T)[]) {
        if (filter[key] !== undefined && item[key] !== filter[key]) {
          return false;
        }
      }
      return true;
    });
  }

  public async findById(id: string): Promise<T | null> {
    const all = this.readAll();
    return all.find(item => item._id === id) || null;
  }

  public async findOne(filter: Partial<T> | ((item: T) => boolean)): Promise<T | null> {
    const results = await this.find(filter);
    return results[0] || null;
  }

  public async create(data: Omit<T, '_id' | 'createdAt' | 'updatedAt'> & { _id?: string }): Promise<T> {
    const all = this.readAll();
    const now = new Date().toISOString();
    const doc = {
      ...data,
      _id: data._id || generateId(),
      createdAt: now,
      updatedAt: now,
    } as unknown as T;

    all.push(doc);
    this.saveAll(all);
    return doc;
  }

  public async findByIdAndUpdate(id: string, update: Partial<T>): Promise<T | null> {
    const all = this.readAll();
    const index = all.findIndex(item => item._id === id);
    if (index === -1) return null;

    const existing = all[index];
    const updated = {
      ...existing,
      ...update,
      _id: existing._id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    };

    all[index] = updated;
    this.saveAll(all);
    return updated;
  }

  public async findByIdAndDelete(id: string): Promise<T | null> {
    const all = this.readAll();
    const index = all.findIndex(item => item._id === id);
    if (index === -1) return null;

    const [deleted] = all.splice(index, 1);
    this.saveAll(all);
    return deleted;
  }

  public async deleteMany(filter: Partial<T> | ((item: T) => boolean)): Promise<number> {
    const all = this.readAll();
    let initialCount = all.length;
    let remaining: T[];

    if (typeof filter === 'function') {
      remaining = all.filter(item => !filter(item));
    } else {
      remaining = all.filter(item => {
        for (const key of Object.keys(filter) as (keyof T)[]) {
          if (filter[key] !== undefined && item[key] === filter[key]) {
            return false;
          }
        }
        return true;
      });
    }

    this.saveAll(remaining);
    return initialCount - remaining.length;
  }

  public async countDocuments(filter: Partial<T> | ((item: T) => boolean) = {}): Promise<number> {
    const results = await this.find(filter);
    return results.length;
  }
}
