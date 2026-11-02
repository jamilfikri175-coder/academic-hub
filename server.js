const express = require("express");
const webpush = require("web-push");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const CONTACT = process.env.VAPID_SUBJECT || "mailto:admin@example.com";
const DATA_FILE = path.join(__dirname, "subscriptions.json");

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

function readSubs() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, "utf8")); }
  catch { return []; }
}
function writeSubs(items) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2));
}

if (PUBLIC_KEY && PRIVATE_KEY) {
  webpush.setVapidDetails(CONTACT, PUBLIC_KEY, PRIVATE_KEY);
}

app.get("/api/push/public-key", (_req, res) => {
  if (!PUBLIC_KEY) return res.status(503).json({ error: "VAPID keys belum dikonfigurasi." });
  res.json({ publicKey: PUBLIC_KEY });
});

app.post("/api/push/subscribe", (req, res) => {
  if (!PUBLIC_KEY || !PRIVATE_KEY) return res.status(503).json({ error: "Konfigurasi VAPID belum tersedia." });
  const sub = req.body;
  if (!sub || !sub.endpoint || !sub.keys) return res.status(400).json({ error: "Subscription tidak valid." });
  const subs = readSubs().filter(x => x.endpoint !== sub.endpoint);
  subs.push(sub);
  writeSubs(subs);
  res.status(201).json({ ok: true });
});

app.post("/api/push/test", async (_req, res) => {
  if (!PUBLIC_KEY || !PRIVATE_KEY) return res.status(503).json({ error: "Konfigurasi VAPID belum tersedia." });
  const subs = readSubs();
  if (!subs.length) return res.status(404).json({ error: "Belum ada perangkat yang berlangganan notifikasi." });
  const payload = JSON.stringify({ title: "Academic Hub", body: "Notifikasi push berhasil diaktifkan.", url: "/" });
  const results = await Promise.allSettled(subs.map(s => webpush.sendNotification(s, payload)));
  const expired = [];
  results.forEach((r, i) => {
    if (r.status === "rejected" && r.reason && [404, 410].includes(r.reason.statusCode)) expired.push(subs[i].endpoint);
  });
  if (expired.length) writeSubs(subs.filter(s => !expired.includes(s.endpoint)));
  res.json({ ok: true, sent: results.filter(r => r.status === "fulfilled").length });
});

app.listen(PORT, () => console.log(`Academic Hub berjalan di http://localhost:${PORT}`));
