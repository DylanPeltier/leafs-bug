"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type LiveGame = | { playing: false; message?: string } | {
  playing: true;
  state: "pre" | "in" | "post";
  period?: number;
  displayClock?: string;
  leafs: { name?: string; score: number };
  opponent: { name?: string; score: number };
};

const LEAFS_LOGO = "https://a.espncdn.com/i/teamlogos/nhl/500/scoreboard/tor.png";
// Make this dynamic later
const OPPONENT_LOGO = "https://a.espncdn.com/i/teamlogos/nhl/500/scoreboard/utah.png";

function periodLabel(period?: number, state?: string) {
  if (state === "pre") return "PRE";
  if (state === "post") return "FINAL";
  if (!period) return "";
  return `P${period}`;
}

export default function Home() {
  const [data, setData] = useState<LiveGame | null>(null);

  async function load() {
    const res = await fetch("/api/live", { cache: "no-store" });
    const json = (await res.json()) as LiveGame;
    setData(json);
    return json;
  }

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const tick = async () => {
      const json = await load();

      const interval = json && "playing" in json && json.playing && "state" in json ? json.state === "in" ? 5000 : 30000: 60000;
      timer = setTimeout(tick, interval);
    };

    tick();
    return () => clearTimeout(timer);
  }, []);

  if (!data?.playing) {
    return (
      <main className="min-h-screen grid place-items-center text-neutral-600">
        {data?.message ?? "No game found."}
      </main>
    );
  }

  const leafsName = data.leafs.name || "Maple Leafs";
  const opponentName = data.opponent.name || "Opponent";
  const midTop = periodLabel(data.period, data.state);
  const midBottom = data.state === "in" ? (data.displayClock ?? "") : data.state === "pre" ? "" : "";

  return (
    <main className="min-h-screen bg-white">
      <div className="min-h-screen grid place-items-center">
        <div className="w-[900px] max-w-[95vw]">
          <div className="flex items-center justify-center gap-16">

            {/* Leafs */}
            <div className="flex flex-col items-center gap-3 w-64">
              <div className="flex items-center gap-3">
                <Image
                  src={LEAFS_LOGO}
                  alt="Leafs Logo"
                  width={28}
                  height={28}
                  priority
                />
                <div className="text-lg text-neutral-800">{leafsName}</div>
              </div>
              <div className="text-7xl font-semibold tracking-tight text-neutral-900">
                {data.leafs.score}
              </div>
            </div>

            {/* Mid */}
            <div className="flex flex-col items-center w-32">
              <div className="text-sm text-neutral-700">{midTop}</div>
              <div className="text-sm text-neutral-700">{midBottom}</div>
            </div>

            {/* Opponent */}
            <div className="flex flex-col items-center gap-3 w-64">
              <div className="flex items-center gap-3">
                <Image
                  src={OPPONENT_LOGO}
                  alt="Opponent Logo"
                  width={28}
                  height={28}
                  priority
                />
                <div className="text-lg text-neutral-800">{opponentName}</div>
              </div>
              <div className="text-7xl font-semibold tracking-tight text-neutral-900">
                {data.opponent.score}
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );

}