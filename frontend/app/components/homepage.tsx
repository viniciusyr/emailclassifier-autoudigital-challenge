'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import UploadEmail from './UploadEmail';

interface Result {
  category: string;
  response: string;
}

export default function Home() {
  const [results, setResults] = useState<Result[]>([]);

  const handleNewResult = (result: Result) => {
    setResults((prev) => [...prev, result]);
  };

  return (
    <main className="min-h-screen bg-gray-100 p-8 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Classificador de Emails
      </h1>

      <UploadEmail onResult={handleNewResult} />

      <div className="mt-10 w-full max-w-2xl space-y-4">
        {results.map((res, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white shadow rounded-lg p-4 border border-gray-200"
          >
            <p className="text-sm text-gray-500">Categoria: 
              <span className="font-semibold text-gray-700 ml-2">
                {res.category}
              </span>
            </p>
            <p className="mt-2 text-gray-700">{res.response}</p>
          </motion.div>
        ))}
      </div>
    </main>
  );
}
