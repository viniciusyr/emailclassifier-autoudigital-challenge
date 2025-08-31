'use client';
import { useState, useRef } from 'react';

export interface EmailResult {
  category: string;
  response: string;
}

interface UseEmailProcessorProps {
  onResult: (result: EmailResult) => void;
  onStart: (total: number, processId: string, controller: AbortController) => void;
}

export function useEmailProcessor({ onResult, onStart }: UseEmailProcessorProps) {
  const [loading, setLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const processEmails = async (file: File | null, text: string) => {
    if (!file && !text) return alert('Envie um arquivo ou digite o texto.');

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const formData = new FormData();
    if (file) formData.append('files', file);
    if (!file && text) formData.append('text', text);

    setLoading(true);

    try {
      const res = await fetch('http://0.0.0.0:8000/read', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      if (!res.ok) throw new Error('Erro no servidor');
      if (!res.body) throw new Error('No response body');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let total = 0;
      const processId = Math.random().toString(36).substr(2, 9); // ID simples
      onStart(total, processId, controller);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        let lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (let line of lines) {
          if (line.trim()) {
            const data = JSON.parse(line);
            if ('total' in data) {
              total = data.total;
              onStart(total, processId, controller);
            } else {
              onResult({ category: data.Categoria, response: data.Resposta });
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') console.log('Processo interrompido');
      else console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const stopProcessing = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  return { loading, processEmails, stopProcessing };
}
