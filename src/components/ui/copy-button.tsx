'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * `mailto:` is the primary path (D7), but it fails silently for anyone on webmail with no
 * protocol handler registered — the click appears to do nothing at all. This is the fallback
 * that stops the window being a dead end, so it is not decoration.
 *
 * Confirmation goes through a live region rather than only changing the label, because a
 * label that changes under a screen reader's cursor is not announced.
 */
export function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be denied outright. The address is selectable text either way,
      // so failing quietly here still leaves the user a way through.
      setCopied(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={copy}
        className="rounded-[4px] border border-border-interactive px-2 py-1 font-mono text-[10px] text-text-secondary transition-colors duration-150 hover:bg-surface-hover"
      >
        {copied ? 'copied' : label}
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? `${value} copied to clipboard` : ''}
      </span>
    </>
  );
}
