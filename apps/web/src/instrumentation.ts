/** Scheduler simples: confere lembretes vencidos a cada minuto (processo Node único). */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { fireDueReminders } = await import("@/features/reminders/service");
    setInterval(() => {
      fireDueReminders().catch((e) => console.error("reminders:", e instanceof Error ? e.message : "erro"));
    }, 60_000);
  }
}
