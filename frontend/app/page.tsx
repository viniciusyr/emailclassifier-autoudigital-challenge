'use client';
import { useState, useRef } from 'react';
import UploadEmail from '../components/UploadEmail/UploadEmail';
import ProgressBar from '../components/ProgressBar/ProgressBar';
import ResultCard from '../components/ResultCard/ResultCard';
import EnvTest from '../components/Test/EnvTest';

interface Result {
  category: string;
  response: string;
}

export default function Home() {
  const [results, setResults] = useState<Result[]>([]);
  const [totalEmails, setTotalEmails] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isStopped, setIsStopped] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const [currentProcessId, setCurrentProcessId] = useState<string>('');
  const abortControllerRef = useRef<AbortController | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const handleStart = (total: number, processId: string, controller: AbortController) => {
    abortControllerRef.current = controller;
    setCurrentProcessId(processId);
    setResults([]);
    setTotalEmails(total);
    setIsProcessing(true);
    setIsStopped(false);
  };

  const handleNewResult = (newResult: Result) => {
    setResults((prev) => [...prev, newResult]);
  };

  const handleStop = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;

      if (currentProcessId) {
        await fetch(`${API_URL}/stop/${currentProcessId}`, { method: 'POST' });
      }

      setIsProcessing(false);
      setIsStopped(true);
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
    setIsStopped(false);
    setResetKey((k) => k + 1);
    setCurrentProcessId('');
  };

  const progress = totalEmails && totalEmails > 0
    ? Math.round((results.length / totalEmails) * 100)
    : 0;

  return (
    <main className="min-h-screen bg-gray-100 p-8 flex flex-col items-center">
      <EnvTest />
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Classificador de Emails</h1>

      {!isProcessing && !isStopped && results.length === 0 && (
        <UploadEmail
          key={resetKey}
          onResult={handleNewResult}
          onStart={handleStart}
        />
      )}

      <div className="mt-10 w-full max-w-2xl space-y-4">
        {results.map((res, index) => (
          <ResultCard key={index} category={res.category} response={res.response} />
        ))}
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur shadow-md border-t p-4">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <ProgressBar
            progress={progress}
            total={totalEmails}
            processed={results.length}
            isProcessing={isProcessing}
            isStopped={isStopped}
          />

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
