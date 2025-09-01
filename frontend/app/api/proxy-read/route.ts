import { NextRequest, NextResponse } from 'next/server';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const contentType = request.headers.get('content-type');

    if (!API_URL) {
      return new NextResponse('API URL not configured', { status: 500 });
    }
    
    let backendUrl;
    let requestBody;
    const headers = new Headers(request.headers);
    headers.delete('host');

    if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData();
      requestBody = formData;
      backendUrl = `${API_URL}/read`;
    } else {
      requestBody = await request.arrayBuffer();
      backendUrl = `${API_URL}/read`;
    }

    const fetchRes = await fetch(backendUrl, {
      method: 'POST',
      body: requestBody,
      headers: headers,
    });

    if (!fetchRes.ok) {
      return new NextResponse('Erro no backend', { status: fetchRes.status });
    }

    return new NextResponse(fetchRes.body, {
      status: fetchRes.status,
      headers: {
        'Content-Type': fetchRes.headers.get('content-type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    console.error('Erro no proxy:', err);
    return new NextResponse('Erro no proxy', { status: 500 });
  }
}