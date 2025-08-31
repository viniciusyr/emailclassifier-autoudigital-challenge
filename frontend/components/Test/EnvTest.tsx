'use client';

export default function EnvTest() {
  return (
    <div>
      <h1>Testando variável de ambiente</h1>
      <p>API URL: {process.env.NEXT_PUBLIC_API_URL || 'undefined'}</p>
    </div>
  );
}