import { NextResponse } from "next/server";

export async function GET() {
    const backend = process.env.BACKEND_URL ?? "http://localhost:3000";
    const res = await fetch(`${backend}/leafs/live`, { cache: "no-store" });

    if (!res.ok) {
        return NextResponse.json(
            { error: `Backend error: ${res.statusText}` },
            { status:  res.status}
        );
    }

    const json = await res.json();
    return NextResponse.json(json);

}