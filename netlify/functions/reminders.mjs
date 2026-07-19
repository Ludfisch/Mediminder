async function sendDueReminders(_request, context) {
  const secret = Netlify.env.get("CRON_SECRET");
  if (!secret) throw new Error("CRON_SECRET ist nicht konfiguriert.");

  const response = await fetch(new URL("/api/cron/reminders", context.site.url), {
    headers: { authorization: `Bearer ${secret}` },
  });

  if (!response.ok) {
    throw new Error(`Erinnerungs-API antwortete mit Status ${response.status}.`);
  }
}

export default sendDueReminders;

export const config = {
  schedule: "*/2 * * * *",
};
