import type { Reminder as Row } from "@prisma/client";
import type { ReminderCreate, ReminderUpdate } from "@forge/core";
import type { z } from "zod";
import { db } from "@/lib/db";
import { ApiError } from "@/lib/errors";
import { shortId } from "@/lib/ids";
import { nowInTz } from "@/lib/time";
import { dueReminders } from "./due";
import { sendPush } from "./push";

const toDto = (r: Row) => ({ id: r.id, text: r.text, at: r.timeOfDay, repeat: r.repeat as "none" | "daily" | "weekdays", active: r.active });

export async function listReminders() {
  const rows = await db.reminder.findMany({ orderBy: { timeOfDay: "asc" } });
  return rows.map(toDto);
}

export async function createReminder(input: z.infer<typeof ReminderCreate>) {
  const now = nowInTz();
  // Se o horário de hoje já passou, não dispara imediatamente: só no próximo ciclo.
  const lastFiredDate = input.at <= now.time ? now.date : null;
  return toDto(await db.reminder.create({ data: { id: shortId("rem"), text: input.text, timeOfDay: input.at, repeat: input.repeat, lastFiredDate } }));
}

async function must(id: string) {
  const r = await db.reminder.findUnique({ where: { id } });
  if (!r) throw new ApiError("NOT_FOUND", `Lembrete '${id}' não encontrado`);
  return r;
}

export async function updateReminder(id: string, input: z.infer<typeof ReminderUpdate>) {
  await must(id);
  const { at, ...rest } = input;
  return toDto(await db.reminder.update({ where: { id }, data: { ...rest, ...(at && { timeOfDay: at, lastFiredDate: at <= nowInTz().time ? nowInTz().date : null }) } }));
}

export async function deleteReminder(id: string) {
  await must(id);
  await db.reminder.delete({ where: { id } });
  return { id };
}

/** Dispara os lembretes vencidos (chamado a cada minuto pelo scheduler). */
export async function fireDueReminders(now = nowInTz()) {
  const due = dueReminders(await db.reminder.findMany({ where: { active: true } }), now);
  for (const r of due) {
    await sendPush("Forge", r.text);
    await db.reminder.update({ where: { id: r.id }, data: { lastFiredDate: now.date, ...(r.repeat === "none" && { active: false }) } });
  }
  return due.length;
}

export async function saveSubscription(sub: { endpoint: string; keys: { p256dh: string; auth: string } }) {
  await db.pushSubscription.upsert({
    where: { endpoint: sub.endpoint },
    update: { p256dh: sub.keys.p256dh, auth: sub.keys.auth },
    create: { endpoint: sub.endpoint, p256dh: sub.keys.p256dh, auth: sub.keys.auth },
  });
  return { ok: true };
}
