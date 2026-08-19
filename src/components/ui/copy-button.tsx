'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * `mailto:` is the primary path (D7), but it fails silently for anyone on webmail with no
 * protocol handler registered — the click appears to do nothing at all. This is the fallback
 * that stops the window being a dead end, so it is not decoration.
 *
 * Confirmation goes through a live region rather than only changing the label, because a
 * label that changes under a screen reader's cursor is not announced. That is also why the
 * button is icon-only now and still fine: `label` moved from visible text to the accessible
 * name, where it stays put whatever the icon is doing.
 *
 * 24px square, which is the floor for a pointer target under WCAG 2.2 SC 2.5.8 — an icon
 * button has no text box padding it out to a comfortable size, so it has to be asked for.
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
        aria-label={label}
        className="flex size-6 flex-none cursor-pointer items-center justify-center rounded-[4px] border border-border-interactive text-text-secondary transition-colors duration-150 hover:bg-surface-hover hover:text-text"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-3.5"
        >
          {copied ? (
            <path d="M4.5 12.5l5 5 10-11" />
          ) : (
            <>
              <rect x="8.5" y="8.5" width="12" height="12" rx="2" />
              <path d="M15.5 5.5a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2" />
            </>
          )}
        </svg>
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? `${value} copied to clipboard` : ''}
      </span>
    </>
  );
}
