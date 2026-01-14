import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { firstValueFrom } from "rxjs";

@Injectable()
export class EspnService {
    constructor(
        private readonly http: HttpService,
        private readonly config: ConfigService
    ) {}

    private yyyymmddTZ(d: Date, tz = "America/Toronto") {
        const parts = new Intl.DateTimeFormat("en-CA", {
            timeZone: tz,
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        }).formatToParts(d);

        const get = (type: "year" | "month" | "day") => parts.find(p => p.type === type)?.value ?? "";
        return `${get("year")}${get("month")}${get("day")}`;
    }

    async getScoreboard(date: Date): Promise<any> {
        const base = this.config.get<string>("ESPN_SCOREBOARD_URL");
        const dates = this.yyyymmddTZ(date, "America/Toronto");
        const url = `${base}?dates=${dates}`;
        const res = await firstValueFrom(this.http.get(url, { timeout: 8000 }));
        return res.data;
    }
}