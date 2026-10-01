import { z } from "zod";
import { respond } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { saveSubscription } from "@/features/reminders/service";

const Sub = z.object({ endpoint: z.string().url(), keys: z.object({ p256dh: z.string(), auth: z.string() }) });

export const POST = (req: Request) =>
  respond(async () => {
    await requireSession();
    return saveSubscription(Sub.parse(await req.json()));
  }, 201);
