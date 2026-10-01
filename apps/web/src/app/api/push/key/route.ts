import { respond } from "@/lib/api";
import { requireSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const GET = () =>
  respond(async () => {
    await requireSession();
    return { publicKey: process.env.VAPID_PUBLIC_KEY ?? null };
  });
