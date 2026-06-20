"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@retekapp/ui";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, description, children, className }: ModalProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div
        className={cn(
          "relative z-10 w-full max-w-lg rounded-t-3xl border border-slate-200 bg-white shadow-card animate-slide-in sm:rounded-2xl",
          className
        )}
      >
        {(title || description) && (
          <div className="flex items-start justify-between border-b border-slate-100 p-5">
            <div>
              {title && <h2 className="text-lg font-semibold text-slate-900">{title}</h2>}
              {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
            </div>
            <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        <div className="max-h-[70vh] overflow-y-auto p-5 scrollbar-thin">{children}</div>
      </div>
    </div>
  );
}
