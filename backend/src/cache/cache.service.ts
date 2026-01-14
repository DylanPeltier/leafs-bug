import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";

@Injectable()
export class CacheService {
    private readonly redis: Redis;

    constructor(private readonly config: ConfigService) {
        const url = this.config.getOrThrow<string>("REDIS_URL");
        this.redis = new Redis(url);
    }

    async getJson<T>(key: string): Promise<T | null> {
        const raw = await this.redis.get(key);
        return raw ? (JSON.parse(raw) as T) : null; 
    }

    async setJson<T>(key: string, value: unknown, ttlSeconds: number): Promise<void> {
        await this.redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
    }
}