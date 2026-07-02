import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-xl p-5 w-full max-w-md shadow-xl z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-text-primary">{title}</h3>
          <button onClick={onClose} className="text-text-subtle hover:text-text-primary transition-colors">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
