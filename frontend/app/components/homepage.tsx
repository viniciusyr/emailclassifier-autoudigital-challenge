'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import UploadEmail from './UploadEmail';

interface Result {
  category: string;
  response: string;
}

export default function Home() {
  const [results, setResults] = useState<any[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [totalEmails, setTotalEmails] = useState<number | null>(null);

  const handleNewResult = (newResult: any, total?: number) => {
    if (total && !totalEmails) setTotalEmails(total); 
    setResults((prev) => [...prev, newResult]);
  };

  const handleCopy = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const progress =
    totalEmails && totalEmails > 0
      ? Math.round((results.length / totalEmails) * 100)
      : 0;

  return (
    <main className="min-h-screen bg-gray-100 p-8 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Classificador de Emails
      </h1>

      {/* Barra de progresso */}
      {totalEmails && results.length < totalEmails && (
        <div className="w-full max-w-2xl mb-6">
          <div className="flex justify-between mb-1 text-sm text-gray-600">
            <span>Processando...</span>
            <span>
              {results.length}/{totalEmails}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-500 h-3 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {results.length === 0 && <UploadEmail onResult={handleNewResult} />}

      <div className="mt-10 w-full max-w-2xl space-y-4">
        {results.map((res, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => handleCopy(res.response, index)}
            className={`cursor-pointer shadow rounded-lg p-4 border transition ${
              res.category === "Produtivo"
                ? "bg-green-100 border-green-300 hover:bg-green-200"
                : "bg-yellow-100 border-yellow-300 hover:bg-yellow-200"
            }`}
          >
            <p className="text-sm text-gray-600">
              Categoria:
              <span className="font-semibold text-gray-800 ml-2">
                {res.category}
              </span>
            </p>

            <p className="mt-2 text-gray-700">{res.response}</p>

            {copiedIndex === index && (
              <p className="mt-2 text-xs text-gray-600 italic">
                ✅ Texto copiado
              </p>
            )}
          </motion.div>
        ))}
      </div>
    </main>
  );
}