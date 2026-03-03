import React from 'react';
import { X } from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose, url, title }) => {
  if (!isOpen) return null;

  // Using a reliable public QR code API for simplicity and portability
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(url)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl transform transition-all scale-100 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
        >
          <X size={20} className="text-slate-600" />
        </button>
        
        <div className="text-center space-y-4">
          <h3 className="text-xl font-display font-bold text-slate-800">Scan to Share</h3>
          <p className="text-sm text-slate-500 font-sans">{title}</p>
          
          <div className="flex justify-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <img 
              src={qrUrl} 
              alt="QR Code" 
              className="w-48 h-48 object-contain rounded-lg"
              loading="lazy"
            />
          </div>
          
          <p className="text-xs text-slate-400">
            Show this code to others to let them join the walk here.
          </p>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;
