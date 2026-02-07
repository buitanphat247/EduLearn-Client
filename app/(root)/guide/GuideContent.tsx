"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function GuideContent({ content }: { content: string }) {
  return (
    <div className="guide-content-wrapper animate-in fade-in duration-500 markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-6 mt-2 pb-4 border-b border-slate-100 dark:border-slate-800" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4 mt-8 scroll-mt-20" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3 mt-6 scroll-mt-20" {...props} />
          ),
          h4: ({ node, ...props }) => (
            <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-2 mt-4" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="mb-4 text-lg leading-relaxed text-slate-600 dark:text-slate-300" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc pl-6 mb-4 text-slate-600 dark:text-slate-300 space-y-2 marker:text-slate-400" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal pl-6 mb-4 text-slate-600 dark:text-slate-300 space-y-2 marker:text-slate-400" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="pl-1 leading-relaxed" {...props} />
          ),
          a: ({ node, ...props }) => (
            <a className="text-blue-600 dark:text-blue-400 hover:underline font-medium transition-colors" target="_blank" rel="noopener noreferrer" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-6 bg-blue-50 dark:bg-blue-900/20 italic text-slate-700 dark:text-slate-300 rounded-r-lg" {...props} />
          ),
          code: ({ node, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || "");
            const isInline = !match && !children?.toString().includes("\n");

            if (isInline) {
              return (
                <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-sm font-mono text-pink-600 dark:text-pink-400 border border-slate-200 dark:border-slate-700/50" {...props}>
                  {children}
                </code>
              );
            }

            return (
              <div className="relative group">
                <pre className="bg-slate-900 text-slate-50 p-4 rounded-xl overflow-auto my-6 text-sm font-mono shadow-lg border border-slate-800">
                  <code className={className} {...props}>
                    {children}
                  </code>
                </pre>
              </div>
            );
          },
          // Table components - critical for the fix
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-8 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300 border-collapse" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase text-slate-700 dark:text-slate-400 font-semibold tracking-wider" {...props} />
          ),
          tbody: ({ node, ...props }) => (
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-900/50" {...props} />
          ),
          tr: ({ node, ...props }) => (
            <tr className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="px-6 py-4 font-bold border-b border-slate-200 dark:border-slate-700" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-6 py-4 whitespace-normal border-b border-slate-100 dark:border-slate-800 last:border-0" {...props} />
          ),
          img: ({ node, ...props }) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="max-w-full h-auto rounded-xl shadow-md my-6 border border-slate-200 dark:border-slate-700 block mx-auto" alt={props.alt || ""} {...props} />
          ),
          hr: ({ node, ...props }) => (
            <hr className="my-8 border-slate-200 dark:border-slate-700" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
