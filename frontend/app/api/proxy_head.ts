import { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');
    return res.status(204).end();
  }

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const headers: Record<string, string> = {};
  for (const [key, value] of Object.entries(req.headers)) {
    if (typeof value === 'string' && key.toLowerCase() !== 'host') headers[key] = value;
  }

  const fetchRes = await fetch(`${API_URL}/read`, {
    method: 'POST',
    body: req.body,
    headers,
  });

  if (!fetchRes.body) return res.status(500).end();

  res.setHeader('Content-Type', fetchRes.headers.get('content-type') || 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const reader = fetchRes.body.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    res.write(Buffer.from(value));
  }
  res.end();
}
