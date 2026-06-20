"use client";

import { useState } from "react";
import { Eye, Pencil } from "lucide-react";
import { Textarea, cn } from "@retekapp/ui";
import { MarkdownRenderer } from "./markdown-renderer";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  label?: string;
}

export function MarkdownEditor({ value, onChange, placeholder, rows = 4, label }: MarkdownEditorProps) {
  const [mode, setMode] = useState<"write" | "preview">("write");

  return (
    <div className="space-y-1.5">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setMode("write")}
              className={cn(
                "flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors",
                mode === "write"
                  ? "bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                  : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              )}
            >
              <Pencil className="h-3 w-3" /> Escrever
            </button>
            <button
              type="button"
              onClick={() => setMode("preview")}
              className={cn(
                "flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors",
                mode === "preview"
                  ? "bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                  : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              )}
            >
              <Eye className="h-3 w-3" /> Preview
            </button>
          </div>
        </div>
      )}

      {mode === "write" ? (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? "Suporta markdown... **negrito**, `código`, listas, etc."}
          rows={rows}
          className="font-mono text-sm"
        />
      ) : (
        <div
          className={cn(
            "min-h-20 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800",
            !value && "flex items-center justify-center text-sm text-slate-400"
          )}
          style={{ minHeight: `${rows * 1.5}rem` }}
        >
          {value ? <MarkdownRenderer content={value} /> : "Nada para visualizar ainda"}
        </div>
      )}
    </div>
  );
}
