'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-2xl',
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className={`relative w-full ${maxWidth} text-[#E8E3D8] z-10 my-8 overflow-hidden`}
            style={{
              background: 'rgba(6, 9, 22, 0.95)',
              border: '1px solid rgba(255, 215, 0, 0.35)',
              boxShadow: '0 0 50px rgba(0, 0, 0, 0.9), 0 0 30px rgba(255, 215, 0, 0.12), inset 0 0 20px rgba(0, 255, 255, 0.03)',
              backdropFilter: 'blur(20px)',
              clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))',
            }}
          >
            {/* Corner cyber decor */}
            <div className="absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2 border-[#FFD700]" />
            <div className="absolute top-1.5 right-1.5 w-3 h-3 border-t-2 border-r-2 border-[#00FFFF]" />
            <div className="absolute bottom-1.5 left-1.5 w-3 h-3 border-b-2 border-l-2 border-[#00FFFF]" />
            <div className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b-2 border-r-2 border-[#FFD700]" />

            <div className="flex items-center justify-between p-6 border-b border-yellow-500/15">
              {title ? (
                <h3 className="font-serif text-xl text-white tracking-wide">{title}</h3>
              ) : (
                <div />
              )}
              <button
                onClick={onClose}
                className="p-2 text-[#E8E3D8]/60 hover:text-[#FFD700] transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
