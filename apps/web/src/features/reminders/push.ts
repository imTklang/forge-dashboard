import webpush from "web-push";
import { db } from "@/lib/db";

let configured: boolean | null = null;

function configure() {
  if (configured !== null) return configured;
  const { VAPID_PUBLIC_KEY: pub, VAPID_PRIVATE_KEY: priv, VAPID_SUBJECT: subject } = process.env;
  configured = !!(pub && priv);
  if (configured) webpush.setVapidDetails(subject ?? "mailto:forge@localhost", pub!, priv!);
  return configured;
}

export const pushEnabled = () => configure();

/** Envia a notificação a todos os dispositivos inscritos; remove inscrições expiradas. */
export async function sendPush(title: string, body: string) {
  if (!configure()) return { sent: 0, skipped: true };
  const subs = await db.pushSubscription.findMany();
  let sent = 0;
  for (const s of subs) {
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, JSON.stringify({ title, body }));
      sent++;
    } catch (e) {
      const code = (e as { statusCode?: number }).statusCode;
      if (code === 404 || code === 410) await db.pushSubscription.delete({ where: { endpoint: s.endpoint } }).catch(() => {});
    }
  }
  return { sent, skipped: false };
}
