'use client';
import { useState, useEffect } from 'react';
import UploadEmail from '../components/UploadEmail';
import Result from '../components/Result';

export default function Home() {
  const [result, setResult] = useState<{ category: string; response: string } | null>(null);

  useEffect(() => {
    if (result) console.log(result);
  }, [result]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-6">Classificador de Emails AI</h1>

      <UploadEmail onResult={setResult} />

      {result && <Result category={result.category} response={result.response} />}
    </div>
  );
}
