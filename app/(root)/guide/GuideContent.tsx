"use client";

import React from "react";

// Simple Markdown Parser Components
// Note: This is a basic implementation. For production content with complex markdown,
// installing 'react-markdown' is recommended.

const parseInline = (text: string) => {
  if (!text) return null;

  // Bold: **text**
  const boldRegex = /\*\*(.*?)\*\*/g;
  // Link: [text](url)
  const linkRegex = /\[(.*?)\]\((.*?)\)/g;
  // Code: `text`
  const codeRegex = /`(.*?)`/g;



  // We need a more robust tokenizer for mixed styling, but for now simple splitting is okay
  // or just use dangerouslySetInnerHTML if we trusted the source (we generally don't).
  // Let's do a simple recursive split or just chain replacements for simplicity in this demo context.

  // Simpler approach: Split by tokens.
  // Actually, implementing a full parser is overkill.
  // Let's use a simple mapping for this demo that handles bold and links reasonably well.

  const elements: (string | React.ReactNode)[] = [text];

  // Helper to process an array of strings/elements with a regex and replacer
  const process = (regex: RegExp, replacer: (match: string, ...args: any[]) => React.ReactNode) => {
    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];
      if (typeof el === "string") {
        const matches = Array.from(el.matchAll(regex));
        if (matches.length > 0) {
          const newParts: (string | React.ReactNode)[] = [];
          let cursor = 0;
          matches.forEach((m) => {
            const matchStart = m.index!;
            const matchText = m[0];
            if (matchStart > cursor) {
              newParts.push(el.substring(cursor, matchStart));
            }
            newParts.push(replacer(matchText, ...m.slice(1)));
            cursor = matchStart + matchText.length;
          });
          if (cursor < el.length) {
            newParts.push(el.substring(cursor));
          }
          elements.splice(i, 1, ...newParts);
          i += newParts.length - 1;
        }
      }
    }
  };

  process(boldRegex, (_, content) => (
    <strong key={Math.random()} className="font-bold text-slate-900 dark:text-white">
      {content}
    </strong>
  ));
  process(codeRegex, (_, content) => (
    <code key={Math.random()} className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-sm font-mono text-pink-600 dark:text-pink-400">
      {content}
    </code>
  ));
  process(linkRegex, (_, label, url) => (
    <a key={Math.random()} href={url} className="text-blue-600 dark:text-blue-400 hover:underline">
      {label}
    </a>
  ));

  return <>{elements}</>;
};

export default function GuideContent({ content }: { content: string }) {
  const lines = content.split("\n");
  const renderedLines: React.ReactNode[] = [];

  let inList = false;
  let listItems: React.ReactNode[] = [];

  const flushList = () => {
    if (inList) {
      renderedLines.push(
        <ul key={Math.random()} className="list-disc pl-6 mb-4 text-slate-600 dark:text-slate-300 space-y-2">
          {listItems}
        </ul>,
      );
      inList = false;
      listItems = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (line.startsWith("# ")) {
      flushList();
      renderedLines.push(
        <h1
          key={index}
          className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-6 mt-2 pb-4 border-b border-slate-100 dark:border-slate-800"
        >
          {parseInline(line.replace("# ", ""))}
        </h1>,
      );
    } else if (line.startsWith("## ")) {
      flushList();
      renderedLines.push(
        <h2 key={index} className="text-2xl font-bold text-slate-800 dark:text-white mb-4 mt-8">
          {parseInline(line.replace("## ", ""))}
        </h2>,
      );
    } else if (line.startsWith("### ")) {
      flushList();
      renderedLines.push(
        <h3 key={index} className="text-xl font-bold text-slate-800 dark:text-white mb-3 mt-6">
          {parseInline(line.replace("### ", ""))}
        </h3>,
      );
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      inList = true;
      listItems.push(
        <li key={index} className="pl-1 leading-relaxed">
          {parseInline(trimmed.substring(2))}
        </li>,
      );
    } else if (trimmed.match(/^\d+\. /)) {
      // Treating numbered lists as bullets for simplicity in this basic parser, or handle separate logic
      // Let's basic handle
      flushList(); // Close UL if any
      // We'll treat it as a block div for now to avoid complex state tracking for OL
      renderedLines.push(
        <div key={index} className="flex gap-2 mb-2 text-slate-600 dark:text-slate-300 ml-2">
          <span className="font-bold text-slate-400 dark:text-slate-500 min-w-[20px]">{trimmed.split(".")[0]}.</span>
          <span className="leading-relaxed">{parseInline(trimmed.substring(trimmed.indexOf(" ") + 1))}</span>
        </div>,
      );
    } else if (trimmed === "") {
      flushList();
      // Skip empty lines or render as spacer? margin is usually handled by tags
    } else {
      flushList();
      renderedLines.push(
        <p key={index} className="mb-4 text-lg leading-relaxed text-slate-600 dark:text-slate-300">
          {parseInline(line)}
        </p>,
      );
    }
  });

  flushList();

  return <div className="guide-content-wrapper animate-in fade-in duration-500">{renderedLines}</div>;
}
