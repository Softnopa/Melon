import { NextResponse } from "next/server";
import { getClientIp } from "@/lib/server-auth";
import {
  getBanInfo,
  getFailedAttempts,
  isIpBanned,
  unbanIp,
  MAX_LOGIN_ATTEMPTS,
} from "@/lib/server-ip-ban";
import { requirePermission } from "@/lib/server-auth";

export async function GET(request: Request) {
  const ip = getClientIp(request);
  const banned = await isIpBanned(ip);
  const attempts = await getFailedAttempts(ip);
  const banInfo = banned ? await getBanInfo(ip) : null;

  return NextResponse.json({
    ip,
    banned,
    attempts,
    maxAttempts: MAX_LOGIN_ATTEMPTS,
    banInfo,
  });
}

export async function DELETE(request: Request) {
  const auth = await requirePermission("unban_ip");
  if ("error" in auth) return auth.error;

  const ip = getClientIp(request);
  await unbanIp(ip);
  return NextResponse.json({ ok: true, ip });
}
