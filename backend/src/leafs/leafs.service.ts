import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { EspnService } from "src/espn/espn.service";
import { CacheService } from "src/cache/cache.service";

type LiveGameResponse = | { playing: false; message: string; updatedAt: string } | {
    playing: true;
    teamId: number;
    eventId: string;
    startTimeUTC?: string;
    state: "pre" | "in" | "post";
    detail?: string;
    period?: number;
    displayClock?: string;
    leafs: { homeAway?: string; name?: string; score: number };
    opponent: { id?: number; name?: string; homeAway?: string; score: number };
    updatedAt: string;
}

@Injectable()
export class LeafsService {
    constructor(
        private readonly espn: EspnService,
        private readonly cache: CacheService,
        private readonly config: ConfigService
    ) {}

    private findTeamEvent(scoreboard: any, teamId: string) {
        const events = scoreboard?.events ?? [];
        for (const ev of events) {
            for (const comp of ev?.competitions ?? []) {
                const competitors = comp?.competitors ?? [];
                if (competitors.some((c: any) => c?.team?.id === teamId)) {
                    return { event: ev, competition: comp };
                }
            }
        }
        return null;
    }

    async getLiveGame(): Promise<LiveGameResponse> {
        const teamId = this.config.get<string>("TEAM_ID") ?? "21";
        const ttl = Number(this.config.get<string>("CACHE_TTL_SECONDS") ?? "5");
        const cacheKey = `leafs:live:${teamId}`;

        const cached = await this.cache.getJson<LiveGameResponse>(cacheKey);
        if (cached) {
            return cached;
        }

        const now = new Date();
        const dayMs = 24 * 60 * 60 * 1000;

        const [sbY, sbT, sbN] = await Promise.all([
            this.espn.getScoreboard(new Date(now.getTime() - dayMs)),
            this.espn.getScoreboard(now),
            this.espn.getScoreboard(new Date(now.getTime() + dayMs)),
        ]);

        const hit = this.findTeamEvent(sbT, teamId) ?? this.findTeamEvent(sbN, teamId) ?? this.findTeamEvent(sbY, teamId);

        const updatedAt = new Date().toISOString();

        if (!hit) {
            const res: LiveGameResponse = {
                playing: false,
                message: "No Leafs game scheduled for today/tomorrow.",
                updatedAt,
            };
            await this.cache.setJson(cacheKey, res, ttl);
            return res;
        }

        const { event, competition } = hit;
        const status = competition?.status ?? {};
        const competitors = competition?.competitors ?? [];

        const leafsSide = competitors.find((c: any) => c?.team?.id === teamId);
        const opponentSide = competitors.find((c: any) => c?.team?.id !== teamId);

        const res: LiveGameResponse = {
            playing: true,
            teamId: Number(teamId),
            eventId: String(event?.id ?? competition?.id ?? ""),
            startTimeUTC: competition?.date,
            state: status?.type?.state,
            detail: status?.type?.detail,
            period: status?.period,
            displayClock: status?.displayClock,
            leafs: {
                homeAway: leafsSide?.homeAway,
                name: leafsSide?.team?.displayName,
                score: Number(leafsSide?.score ?? 0),
            },
            opponent: {
                id: opponentSide?.team?.id ? Number(opponentSide.team.id) : undefined,
                name: opponentSide?.team?.displayName,
                homeAway: opponentSide?.homeAway,
                score: Number(opponentSide?.score ?? 0),
            },
            updatedAt,
        };

        await this.cache.setJson(cacheKey, res, ttl);
        return res;
    }
}