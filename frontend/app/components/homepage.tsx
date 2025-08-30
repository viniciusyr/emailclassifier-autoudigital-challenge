'use client'
import { useState } from 'react';
import UploadForm from '../components/UploadEmail';
import Result from '../components/Result';

export default function HomePage() {
      const [result, setResult] = useState<{ Categoria: string; Resposta: string } | null>(null);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-6">Email Classifier</h1>
      <UploadForm onResult={setResult} />
       {result && <Result category={result.Categoria} response={result.Resposta} />}
    </div>
  );
}
