'use client';
import React from 'react';

interface ProgressBarProps {
  progress: number;
  total: number | null;
  processed: number;
  isProcessing: boolean;
  isStopped: boolean;
}

export default function ProgressBar({
  progress,
  total,
  processed,
  isProcessing,
  isStopped,
}: ProgressBarProps) {
  let statusText = 'Aguardando...';
  if (isStopped) statusText = 'Processo interrompido! Clique em Novo para reiniciar';
  else if (isProcessing && total) statusText = 'Processando...';
  else if (total && processed >= total) statusText = 'Concluído ✅';

  return (
    <div className="flex-1">
      <div className="flex justify-between mb-1 text-sm text-gray-600">
        <span>{statusText}</span>
        <span>{processed}/{total ?? 0}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="h-3 rounded-full transition-all bg-blue-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
