'use client';
import React from 'react';

interface UploadControlsProps {
  handleSubmit: (e: React.FormEvent) => void;
  loading: boolean;
}

export default function UploadControls({ handleSubmit, loading }: UploadControlsProps) {
  return (
    <button
      type="submit"
      onClick={(e) => handleSubmit(e)}
      disabled={loading}
      className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 w-full"
    >
      {loading ? 'Processando...' : 'Enviar'}
    </button>
  );
}
