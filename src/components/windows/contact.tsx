import { CopyButton } from '@/components/ui/copy-button';
import { CTA } from '@/components/ui/cta';
import type { Contact } from '@/lib/content/schema';

/**
 * The design styles this as an open mail draft. The send button is a `mailto:` handoff (D7)
 * with the subject prefilled, backed by the address as selectable text and a copy button —
 * `mailto:` does nothing at all for a webmail user with no protocol handler.
 *
 * The résumé's phone number is deliberately absent (D14).
 */
export function ContactWindow({ contact }: { contact: Contact }) {
  const mailto = `mailto:${contact.email}?subject=${encodeURIComponent(contact.subject)}`;

  return (
    <div className="px-5 pt-[18px] pb-5 font-mono text-[12px] leading-[1.9] text-text-secondary">
      <p className="flex flex-wrap items-center gap-2">
        <span>
          <span className="text-text-muted">to · </span>
          {/* Selectable, so the address is reachable even if both the link and clipboard fail. */}
          <span className="text-accent select-all">{contact.email}</span>
        </span>
        <CopyButton value={contact.email} label="copy" />
      </p>
      <p>
        <span className="text-text-muted">re · </span>
        {contact.subject}
      </p>

      <hr className="my-2.5 border-0 border-t border-border" />

      <p className="leading-[1.65] text-text">
        {contact.note}
        <span aria-hidden="true" className="text-accent-alt">
          ▌
        </span>
      </p>

      <a href={mailto} className={`mt-3.5 bg-accent-alt ${CTA}`}>
        send →
      </a>
    </div>
  );
}
