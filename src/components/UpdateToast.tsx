import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, AlertCircle } from 'lucide-react';

interface UpdateToastProps {
  show: boolean;
  onReload: () => void;
}

export const UpdateToast: React.FC<UpdateToastProps> = ({ show, onReload }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-3 rounded-full shadow-2xl cursor-pointer border border-white/10"
          onClick={onReload}
        >
          <AlertCircle size={20} className="text-indigo-400 dark:text-indigo-600" />
          <span className="text-sm font-bold pr-2">Nova versão disponível!</span>
          <div className="bg-white/20 dark:bg-black/10 p-1.5 rounded-full">
            <RefreshCw size={16} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};