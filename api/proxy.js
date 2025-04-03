export default async function handler(req, res) {
  const { method, body } = req;

  const backendUrl = process.env.VITE_API_URL; // Ensure this environment variable is set in Vercel

  try {
    const response = await fetch(`${backendUrl}${req.url}`, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}
