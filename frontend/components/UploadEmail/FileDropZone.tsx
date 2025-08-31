'use client';
import React, { DragEvent } from 'react';

interface FileDropZoneProps {
  file: File | null;
  setFile: (file: File | null) => void;
}

export default function FileDropZone({ file, setFile }: FileDropZoneProps) {
  const [dragOver, setDragOver] = React.useState(false);

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
      <input
        type="file"
        id="fileInput"
        accept=".txt,.pdf"
        className="hidden"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
    </div>
  );
}
