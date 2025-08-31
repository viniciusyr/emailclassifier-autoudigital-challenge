'use client';
import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import UploadEmail from './UploadEmail';

interface Result {
  category: string;
  response: string;
}

export default function HomePage() {
  const [results, setResults] = useState<Result[]>([]);
  const [totalEmails, setTotalEmails] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const [currentProcessId, setCurrentProcessId] = useState<string>('');
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleStart = (total: number, processId: string) => {
    abortControllerRef.current = new AbortController();
    setCurrentProcessId(processId);
    setResults([]);
    setTotalEmails(total);
    setIsProcessing(true);
  };

  const handleNewResult = (newResult: Result) => {
    setResults((prev) => [...prev, newResult]);
  };

  const handleStop = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort(); // cancela fetch
      abortControllerRef.current = null;

      if (currentProcessId) {
        await fetch(`http://0.0.0.0:8000/stop/${currentProcessId}`, { method: 'POST' });
      }

      setIsProcessing(false);
    }
  };

  const handleNew = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setResults([]);
    setTotalEmails(null);
    setIsProcessing(false);
    setResetKey((k) => k + 1);
    setCurrentProcessId('');
  };

  const progress = totalEmails && totalEmails > 0
    ? Math.round((results.length / totalEmails) * 100)
    : 0;

  return (
    <main className="min-h-screen bg-gray-100 p-8 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Classificador de Emails</h1>

      {!isProcessing && results.length === 0 && (
        <UploadEmail
          key={resetKey}
          onResult={handleNewResult}
          onStart={handleStart}
          abortController={abortControllerRef.current}
        />
      )}

      <div className="mt-10 w-full max-w-2xl space-y-4">
        {results.map((res, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`cursor-pointer shadow rounded-lg p-4 border transition ${
              res.category === 'Produtivo'
                ? 'bg-green-100 border-green-300 hover:bg-green-200'
                : 'bg-yellow-100 border-yellow-300 hover:bg-yellow-200'
            }`}
          >
            <p className="text-sm text-gray-600">
              Categoria:
              <span className="font-semibold text-gray-800 ml-2">{res.category}</span>
            </p>
            <p className="mt-2 text-gray-700">{res.response}</p>
          </motion.div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur shadow-md border-t p-4">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <div className="flex-1">
            <div className="flex justify-between mb-1 text-sm text-gray-600">
              <span>
                {isProcessing && totalEmails
                  ? 'Processando...'
                  : results.length >= (totalEmails ?? 0)
                  ? 'Concluído ✅'
                  : 'Aguardando...'}
              </span>
              <span>
                {results.length}/{totalEmails ?? 0}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="h-3 rounded-full transition-all bg-blue-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <button
            onClick={handleStop}
            disabled={!isProcessing}
            className="px-4 py-2 rounded-lg border text-sm font-medium
                       disabled:opacity-50 disabled:cursor-not-allowed
                       bg-red-500 text-white hover:bg-red-600 transition"
          >
            Parar
          </button>

          <button
            onClick={handleNew}
            className="px-4 py-2 rounded-lg border text-sm font-medium
                       bg-gray-500 text-white hover:bg-gray-600 transition"
          >
            Novo
          </button>
        </div>
      </div>
    </main>
  );
}
