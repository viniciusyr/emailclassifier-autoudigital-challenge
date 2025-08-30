'use client';
import { useState, DragEvent } from 'react';
import { motion } from 'framer-motion';

interface EmailResult {
  category: string;
  response: string;
}

interface UploadEmailProps {
  onResult: (result: EmailResult) => void;
}

export default function UploadEmail({ onResult }: UploadEmailProps) {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file && !text) return alert('Envie um arquivo ou digite o texto.');

    const formData = new FormData();
    if (file) formData.append('files', file);
    if (!file && text) formData.append('text', text);

    try {
      setLoading(true);

      const res = await fetch('http://0.0.0.0:8000/read', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Erro no servidor');
      if (!res.body) throw new Error('No response body');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // processa múltiplas linhas por chunk
        let lines = buffer.split('\n');
        buffer = lines.pop() || ''; // sobra incompleta volta pro buffer

        for (let line of lines) {
          if (line.trim()) {
            try {
              const data = JSON.parse(line);
              onResult({
                category: data.Categoria,
                response: data.Resposta,
              });
            } catch (err) {
              console.error('Erro parse JSON parcial:', err, line);
            }
          }
        }
      }

      // processa o que restar no buffer
      if (buffer.trim()) {
        try {
          const data = JSON.parse(buffer);
          onResult({
            category: data.Categoria,
            response: data.Resposta,
          });
        } catch (err) {
          console.error('Erro parse JSON final:', err, buffer);
        }
      }

      setFile(null);
      setText('');

    } catch (err) {
      console.error(err);
      alert('Erro ao processar email.');
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
    </motion.form>
  );
}
