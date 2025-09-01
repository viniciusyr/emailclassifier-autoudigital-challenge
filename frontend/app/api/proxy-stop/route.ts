import { NextRequest, NextResponse } from 'next/server';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: NextRequest) {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const { processId } = await request.json();

    const fetchRes = await fetch(`${API_URL}/stop/${processId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!fetchRes.ok) {
      return new NextResponse('Erro ao interromper no backend', { status: fetchRes.status });
    }

    const data = await fetchRes.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('Erro no proxy de interrupção:', err);
    return new NextResponse('Erro no proxy de interrupção', { status: 500 });
  }
}