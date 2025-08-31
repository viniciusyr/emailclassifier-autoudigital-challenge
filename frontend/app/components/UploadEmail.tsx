'use client';
import { useState, DragEvent, useEffect } from 'react';
import { motion } from 'framer-motion';

interface EmailResult {
  category: string;
  response: string;
}

interface UploadEmailProps {
  onResult: (result: EmailResult) => void;
  onStart: (total: number, processId: string, controller: AbortController) => void;
}

export default function UploadEmail({ onResult, onStart }: UploadEmailProps) {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [total, setTotal] = useState<number | null>(null);
  const [processed, setProcessed] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setMessage(null);
  }, [file, text]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file && !text) return alert('Envie um arquivo ou digite o texto.');

    const controller = new AbortController();
    setLoading(true);
    setTotal(null);
    setProcessed(0);
    setMessage(null);

    const formData = new FormData();
    if (file) formData.append('files', file);
    if (!file && text) formData.append('text', text);

    try {
      const res = await fetch('http://0.0.0.0:8000/read', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      if (!res.ok) throw new Error('Erro no servidor');
      if (!res.body) throw new Error('Sem resposta do servidor');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let processId = '';
      let firstLine = true;

      // Passa o controller e processId para o homepage
      onStart(0, '', controller);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        if (controller.signal.aborted) {
          setMessage('Processamento interrompido pelo usuário.');
          console.log('Abortado pelo usuário');
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        let lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (let line of lines) {
          if (!line.trim()) continue;
          try {
            const data = JSON.parse(line);

            if (firstLine && 'process_id' in data) {
              processId = data.process_id;
              firstLine = false;
            } else if ('total' in data) {
              setTotal(data.total);
              onStart(data.total, processId, controller);
            } else {
              onResult({ category: data.Categoria, response: data.Resposta });
              setProcessed((prev) => prev + 1);
            }
          } catch (err) {
            console.error('Erro parse JSON parcial:', err, line);
          }
        }
      }

      if (buffer.trim() && !controller.signal.aborted) {
        try {
          const data = JSON.parse(buffer);
          if ('total' in data) setTotal(data.total);
          else {
            onResult({ category: data.Categoria, response: data.Resposta });
            setProcessed((prev) => prev + 1);
          }
        } catch (err) {
          console.error('Erro parse JSON final:', err, buffer);
        }
      }

      setFile(null);
      setText('');
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setMessage('Processamento interrompido pelo usuário.');
      } else {
        console.error(err);
        setMessage('Erro ao processar email.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  };
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const progress = total && total > 0 ? Math.round((processed / total) * 100) : 0;

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-4 w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md"
    >
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed p-6 rounded cursor-pointer text-center transition-colors ${
          dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        onClick={() => document.getElementById('fileInput')?.click()}
      >
        {file ? file.name : 'Arraste um arquivo ou clique para selecionar (.txt, .pdf)'}
      </div>

      <input
        type="file"
        id="fileInput"
        accept=".txt,.pdf"
        className="hidden"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <textarea
        placeholder="Ou digite seu email aqui..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="border p-2 rounded resize-none h-32"
      />

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Processando...' : 'Enviar'}
      </button>

      {total !== null && (
        <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {total !== null && (
        <p className="text-sm text-gray-600 text-center">
          Processados {processed} de {total} ({progress}%)
        </p>
      )}

      {message && (
        <p className="text-sm text-red-600 text-center mt-2">{message}</p>
      )}
    </motion.form>
  );
}
