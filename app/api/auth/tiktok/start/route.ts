import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { isTikTokConfigured, tiktokAuthorizeUrl } from "@/lib/social/tiktok";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { userId } = await auth();
  const origin = new URL(req.url).origin;
  if (!userId) return NextResponse.redirect(`${origin}/sign-in`);
  if (!isTikTokConfigured()) return NextResponse.redirect(`${origin}/profile`);
  return NextResponse.redirect(tiktokAuthorizeUrl(userId));
}
