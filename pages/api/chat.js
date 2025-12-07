import aiHandler from "../../services/geminiService";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { message } = req.body;
  const response = await aiHandler(message);

  res.status(200).json(response);
}
