'use client';
import React from 'react';

interface EmailTextareaProps {
  text: string;
  setText: (value: string) => void;
}

export default function EmailTextarea({ text, setText }: EmailTextareaProps) {
  return (
    <textarea
      placeholder="Ou digite seu email aqui..."
      value={text}
      onChange={(e) => setText(e.target.value)}
      className="border p-2 rounded resize-none h-32 w-full"
    />
  );
}
