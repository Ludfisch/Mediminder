import webpush from "web-push";

let configured = false;

export function getVapidPublicKey() {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
}

export function getWebPush() {
  if (!configured) {
    const publicKey = getVapidPublicKey();
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    const subject = process.env.VAPID_SUBJECT || "mailto:dositime@example.com";

    if (!publicKey || !privateKey) {
      throw new Error("VAPID-Schlüssel sind nicht konfiguriert.");
    }

    webpush.setVapidDetails(subject, publicKey, privateKey);
    configured = true;
  }

  return webpush;
}
