import { createClient, type RedisClientType } from 'redis';
import { env } from '@/constants/env';

class RedisService {
  private static instance: RedisService;
  private client: RedisClientType;
  private isConnected = false;

  private constructor() {
    if (!env.REDIS_URL) {
      throw new Error('REDIS_URL is not configured in environment variables');
    }

    this.client = createClient({ url: env.REDIS_URL });

    this.client.on('error', (err: Error) => {
      console.error('[Redis] Client Error:', err);
    });

    this.client.on('connect', () => {
      console.log('[Redis] Connection established');
    });
  }

  public static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  /**
   * Ensures the client is connected before returning it.
   */
  public async getClient(): Promise<RedisClientType> {
    if (!this.isConnected) {
      try {
        if (!this.client.isOpen) {
          await this.client.connect();
        }
        this.isConnected = true;
      } catch (error) {
        console.error('[Redis] Failed to connect:', error);
        throw error;
      }
    }
    return this.client;
  }

  /**
   * Retrieves a value by key and attempts to parse it as JSON.
   */
  public async get<T>(key: string): Promise<T | null> {
    const client = await this.getClient();
    const value = await client.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  }

  /**
   * Sets a value for a key. Automatically stringifies objects.
   * @param ttl - Optional Time To Live in seconds
   */
  public async set(key: string, value: any, ttl?: number): Promise<void> {
    const client = await this.getClient();
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
    
    if (ttl) {
      await client.set(key, stringValue, { EX: ttl });
    } else {
      await client.set(key, stringValue);
    }
  }

  public async updateHash(key: string, fields: Record<string, any>): Promise<number> {
    const client = await this.getClient();

    const stringFields = Object.entries(fields).reduce((acc, [k, v]) => {
      acc[k] = typeof v === 'object' ? JSON.stringify(v) : String(v);
      return acc;
    }, {} as Record<string, string>);
    
    return await client.hSet(key, stringFields);
  }

  public async getHash<T>(key: string): Promise<T | null> {
    const client = await this.getClient();
    const data = await client.hGetAll(key);
    if (!data || Object.keys(data).length === 0) return null;
    

    return data as unknown as T;
  }

  public async delete(key: string): Promise<number> {
    const client = await this.getClient();
    return await client.del(key);
  }

  /**
   * Deletes all keys matching the pattern.
   * Use with caution!
   */
  public async flush(pattern: string): Promise<void> {
    const client = await this.getClient();
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(keys);
      console.log(`[Redis] Flushed ${keys.length} keys matching '${pattern}'`);
    }
  }

  public async cleanup(): Promise<void> {
    if (this.client && this.client.isOpen) {
      await this.client.disconnect();
      this.isConnected = false;
      console.log('[Redis] Connection closed');
    }
  }
}

export const redis = RedisService.getInstance();

