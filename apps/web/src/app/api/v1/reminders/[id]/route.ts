import { ReminderUpdate } from "@forge/core";
import { respond } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { deleteReminder, updateReminder } from "@/features/reminders/service";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = (req: Request, { params }: Ctx) =>
  respond(async () => { await requireAuth(req, "write"); return updateReminder((await params).id, ReminderUpdate.parse(await req.json())); });
export const DELETE = (req: Request, { params }: Ctx) =>
  respond(async () => { await requireAuth(req, "write"); return deleteReminder((await params).id); });
