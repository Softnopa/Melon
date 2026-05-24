import { NextResponse } from "next/server";
import { getClientIp } from "@/lib/server-auth";
import { unbanIp } from "@/lib/server-ip-ban";

/** Clears ban for the caller's IP (self-service recovery). */
export async function POST(request: Request) {
  const ip = getClientIp(request);
  await unbanIp(ip);
  return NextResponse.json({ ok: true, ip });
}
