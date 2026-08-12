import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center gap-4 px-6">
      <h1 className="font-mono text-2xl font-bold tracking-tight">qurat.os</h1>
      <p className="text-base leading-relaxed text-text-secondary">
        Under construction. The desktop arrives in phase three.
      </p>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <a className="font-mono text-xs text-accent underline" href="/preview">
          tokens
        </a>
      </div>
    </main>
  );
}
