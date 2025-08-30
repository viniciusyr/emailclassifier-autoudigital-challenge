'use client';
import { motion } from 'framer-motion';

interface ResultProps {
  category: string;
  response: string;
}

export default function Result({ category, response }: ResultProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className={`p-6 rounded-lg border max-w-md mx-auto mt-6`}
    >
      <h2 className="text-xl font-bold mb-2">Categoria: {category}</h2>
      <p className="bg-white p-4 rounded border">{response}</p>
    </motion.div>
  );
}
