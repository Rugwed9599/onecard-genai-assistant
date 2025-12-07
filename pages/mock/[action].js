import mockApi from "../../../services/mockApiService";

export default async function handler(req, res) {
  const { action } = req.query;

  if (!mockApi[action]) {
    return res.status(400).json({ error: "Invalid mock action" });
  }

  const result = await mockApi[action]();
  res.status(200).json(result);
}
