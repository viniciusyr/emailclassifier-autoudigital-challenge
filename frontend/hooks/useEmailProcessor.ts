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
  const processIdRef = useRef<string | null>(null);

  const processEmails = async (file: File | null, text: string) => {
    if (!file && !text) return alert('Envie um arquivo ou digite o texto.');

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const formData = new FormData();
    if (file) formData.append('files', file);
    if (!file && text) formData.append('text', text);

    setLoading(true);

    try {
      const res = await fetch('/api/proxy-read', {
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

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        let lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (let line of lines) {
          if (line.trim()) {
            const data = JSON.parse(line);

            if ('process_id' in data) {
              processIdRef.current = data.process_id;
              onStart(total, data.process_id, controller);
            } else if ('total' in data) {
              total = data.total;
              onStart(total, processIdRef.current || '', controller);
            } else {
              onResult({
                category: data.Categoria || data.category,
                response: data.Resposta || data.response,
              });
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

  const stopProcessing = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();

      if (processIdRef.current) {
        try {
          await fetch('/api/proxy-stop', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ processId: processIdRef.current }),
          });
        } catch (err) {
          console.error('Falha ao enviar requisição de interrupção via proxy:', err);
        }
      }
      abortControllerRef.current = null;
      processIdRef.current = null;
    }
  };

  return { loading, processEmails, stopProcessing };
}