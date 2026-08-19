import type { Metadata } from 'next';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Urdu } from '@/components/ui/urdu';

/**
 * The token reference. It exists so the palette, the two Latin faces and the Urdu setting
 * can be looked at in a real browser in both themes — P3 and P4 build against it. Kept out
 * of the index because it is a workbench, not content.
 */
export const metadata: Metadata = {
  title: 'Tokens',
  robots: { index: false, follow: false },
};

const surfaces = [
  ['surface-chrome', 'bg-surface-chrome'],
  ['surface', 'bg-surface'],
  ['surface-raised', 'bg-surface-raised'],
  ['surface-overlay', 'bg-surface-overlay'],
  ['surface-hover', 'bg-surface-hover'],
  ['surface-accent', 'bg-surface-accent'],
] as const;

const inks = [
  ['text', 'text-text'],
  ['text-secondary', 'text-text-secondary'],
  ['text-muted', 'text-text-muted'],
  ['accent', 'text-accent'],
  ['accent-alt', 'text-accent-alt'],
  ['warn', 'text-warn'],
  ['danger', 'text-danger'],
  ['info', 'text-info'],
] as const;

export default function Preview() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-10 px-6 py-12">
      <header className="flex items-baseline justify-between">
        <h1 className="font-mono text-xl font-bold">tokens</h1>
        <ThemeToggle />
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="font-mono text-xs tracking-widest text-text-muted uppercase">surfaces</h2>
        <div className="grid grid-cols-3 gap-2">
          {surfaces.map(([name, className]) => (
            <div
              key={name}
              className={`${className} rounded border border-border p-4 font-mono text-xs`}
            >
              {name}
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-2 rounded border border-border bg-surface-raised p-5">
        <h2 className="font-mono text-xs tracking-widest text-text-muted uppercase">ink</h2>
        {inks.map(([name, className]) => (
          <p key={name} className={`${className} text-sm`}>
            {name} — the quick brown fox jumps over the lazy dog
          </p>
        ))}
        <div className="mt-2 flex gap-2">
          <span className="rounded bg-accent px-2 py-1 font-mono text-xs text-on-accent">
            on-accent
          </span>
          <span className="rounded bg-danger px-2 py-1 font-mono text-xs text-on-accent">
            danger
          </span>
          <input
            className="rounded border border-border-interactive bg-surface px-2 py-1 font-mono text-xs"
            defaultValue="border-interactive"
            aria-label="Interactive border sample"
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-mono text-xs tracking-widest text-text-muted uppercase">type</h2>
        <p className="text-3xl">JetBrains Mono — display and body</p>
        <p className="text-sm">JetBrains Mono — chrome, labels, metadata</p>
        <Urdu as="p" className="text-3xl">
          خاموشی کی آواز
        </Urdu>
        <Urdu as="p" className="text-base text-text-secondary">
          اردو کے عنوانات نستعلیق میں، دائیں سے بائیں، بغیر کٹے ہوئے۔ یہ دوسری سطر ہے تاکہ سطروں کا
          فاصلہ جانچا جا سکے۔
        </Urdu>
      </section>
    </main>
  );
}
