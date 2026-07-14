import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Lichte health-check voor uptime-monitoring en deploy-verificatie. */
export function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
}
