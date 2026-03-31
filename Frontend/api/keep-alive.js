export default async function handler(req, res) {
  try {
    const response = await fetch(
      "https://moneymanager-api-lr63.onrender.com/api/v1.0/health"
    );
    const text = await response.text();
    res.status(200).json({ status: "ok", backend: text });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
