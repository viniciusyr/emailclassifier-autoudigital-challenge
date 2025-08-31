'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import FileDropZone from './FileDropZone';
import EmailTextarea from './EmailTextarea';
import UploadControls from './UploadControls';
import { useEmailProcessor, EmailResult } from '../../hooks/useEmailProcessor';

interface UploadEmailProps {
  onResult: (result: EmailResult) => void;
  onStart: (total: number, processId: string, controller: AbortController) => void;
}

export default function UploadEmail({ onResult, onStart }: UploadEmailProps) {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('');

  const { loading, processEmails } = useEmailProcessor({ onResult, onStart });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processEmails(file, text);
    setFile(null);
    setText('');
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-4 w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md"
    >
      <FileDropZone file={file} setFile={setFile} />
      <EmailTextarea text={text} setText={setText} />
      <UploadControls handleSubmit={handleSubmit} loading={loading} />
    </motion.form>
  );
}
