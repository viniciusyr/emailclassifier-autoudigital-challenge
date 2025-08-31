'use client';
import React from 'react';
import { motion } from 'framer-motion';

interface ResultCardProps {
  category: string;
  response: string;
}

export default function ResultCard({ category, response }: ResultCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`cursor-pointer shadow rounded-lg p-4 border transition ${
        category === 'Produtivo'
          ? 'bg-green-100 border-green-300 hover:bg-green-200'
          : 'bg-yellow-100 border-yellow-300 hover:bg-yellow-200'
      }`}
    >
      <p className="text-sm text-gray-600">
        Categoria:
        <span className="font-semibold text-gray-800 ml-2">{category}</span>
      </p>
      <p className="mt-2 text-gray-700">{response}</p>
    </motion.div>
  );
}
