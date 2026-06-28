import { useEffect } from 'react';
import { X } from 'lucide-react';
import './style.css';

export default function BottomSheet({ open, onClose, title, children }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else       document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <>
      <div className="bs-backdrop" onClick={onClose} />
      <div className="bs-sheet">
        <div className="bs-handle" />
        <div className="bs-header">
          <h3 className="bs-title">{title}</h3>
          <button className="bs-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="bs-body">{children}</div>
      </div>
    </>
  );
}
