import { ReminderCreate } from "@forge/core";
import { respond } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { createReminder, listReminders } from "@/features/reminders/service";

export const dynamic = "force-dynamic";

export const GET = (req: Request) => respond(async () => { await requireAuth(req, "read"); return listReminders(); });
export const POST = (req: Request) => respond(async () => { await requireAuth(req, "write"); return createReminder(ReminderCreate.parse(await req.json())); }, 201);
