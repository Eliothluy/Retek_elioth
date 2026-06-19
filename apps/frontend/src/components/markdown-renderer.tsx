"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { cn } from "@retekgpt/ui";

import "highlight.js/styles/github-dark.css";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div
      className={cn(
        "prose prose-sm prose-slate max-w-none dark:prose-invert",
        "prose-headings:font-semibold prose-headings:text-slate-900 dark:prose-headings:text-slate-100",
        "prose-a:text-brand-600 prose-a:no-underline hover:prose-a:underline",
        "prose-code:rounded prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-[0.85em] prose-code:font-mono dark:prose-code:bg-slate-700",
        "prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-pre:rounded-xl prose-pre:p-4 prose-pre:overflow-x-auto",
        "prose-blockquote:border-brand-400 prose-blockquote:not-italic",
        "prose-ul:my-2 prose-ol:my-2 prose-li:my-0",
        "[&_code[data-highlighted]]:bg-transparent [&_code[data-highlighted]]:p-0",
        className
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
