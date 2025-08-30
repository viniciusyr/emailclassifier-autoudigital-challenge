'use client';

import { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

interface UploadEmailProps {
  onResult: (result: { Categoria: string; Resposta: string }) => void;
}

export default function UploadEmail({ onResult }: UploadEmailProps) {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file && !text) return alert('Envie um arquivo ou digite o texto.');

    const formData = new FormData();
    if (file) formData.append('file', file);
    if (text) formData.append('text', text);

    try {
      setLoading(true);
      const res = await axios.post('http://0.0.0.0:8000/read', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onResult(res.data);
    } catch (err) {
      console.error(err);
      alert('Erro ao processar email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-4 w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md"
    >
      <input
        type="file"
        accept=".txt,.pdf"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="border p-2 rounded"
      />
      <textarea
        placeholder="Ou digite seu email aqui..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="border p-2 rounded resize-none h-32"
      />
      <button
        type="submit"
        className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        disabled={loading}
      >
        {loading ? 'Processando...' : 'Enviar'}
      </button>
    </motion.form>
  );
}
