// Vercel Serverless Function — BudgetMein Delivery Telegram Proxy
// Token stored in Vercel Environment Variables only

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, description: "Method not allowed" });
  }

  const { chatId, text } = req.body;

  const token = process.env.TG_BOT_TOKEN;

  if (!token)  return res.status(500).json({ ok: false, description: "Bot token not configured" });
  if (!chatId) return res.status(400).json({ ok: false, description: "No chatId provided" });
  if (!text)   return res.status(400).json({ ok: false, description: "No text provided" });

  try {
    const tgRes = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          chat_id:                  chatId,
          text:                     text,
          parse_mode:               "HTML",
          disable_web_page_preview: true
        })
      }
    );
    const data = await tgRes.json();
    return res.status(tgRes.status).json(data);
  } catch (err) {
    return res.status(500).json({ ok: false, description: err.message });
  }
}
