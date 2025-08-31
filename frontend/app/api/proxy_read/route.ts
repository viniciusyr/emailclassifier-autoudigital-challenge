// app/api/proxy-read/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function OPTIONS() {
  return NextResponse.json(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    },
  });
}

export async function POST(request: NextRequest) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const headers = new Headers(request.headers);
  headers.delete('host');

  const fetchRes = await fetch(`${API_URL}/read`, {
    method: 'POST',
    body: request.body,
    headers,
  });

  if (!fetchRes.ok) return NextResponse.error();

  const res = new NextResponse(fetchRes.body, {
    status: fetchRes.status,
    headers: {
      'Content-Type': fetchRes.headers.get('Content-Type') || 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });

  return res;
}
