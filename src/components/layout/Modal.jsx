import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const SPRING = { type: 'spring', stiffness: 380, damping: 32, mass: 0.85 };

export function Modal({ title, onClose, children }) {
  const [visible, setVisible] = useState(true);

  function close() {
    setVisible(false);
  }

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <AnimatePresence onExitComplete={onClose}>
      {visible && (
        <motion.div
          className="modal-backdrop"
          onClick={e => e.target === e.currentTarget && close()}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <motion.div
            className="modal"
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8, transition: { duration: 0.16 } }}
            transition={SPRING}
          >
            <div className="modal-header">
              <h3>{title}</h3>
              <button className="modal-close" onClick={close}>✕</button>
            </div>
            <div className="modal-body">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
