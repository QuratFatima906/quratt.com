import type { ElementType, ReactNode } from 'react';

/**
 * Urdu text needs three things together — `lang`, `dir` and Nastaliq's extra leading — and
 * two of them are attributes, so a class alone cannot do it. Renders a `<span>` by default;
 * pass `as` for a heading or a block.
 */
export function Urdu({
  as: Tag = 'span',
  className = '',
  children,
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tag lang="ur" dir="rtl" className={`urdu ${className}`}>
      {children}
    </Tag>
  );
}
