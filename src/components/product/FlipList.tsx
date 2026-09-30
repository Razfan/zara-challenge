'use client';

import { type ReactNode, useRef } from 'react';
import { useFlip } from '@/hooks/useFlip';

type FlipListProps = {
  /** Ids of the items, in the order of `children`. */
  ids: readonly string[];
  className?: string;
  children: ReactNode;
};

/** `<ul>` whose items glide to their new place when the list changes. */
export function FlipList({ ids, className, children }: FlipListProps) {
  const listRef = useRef<HTMLUListElement>(null);
  useFlip(listRef, ids);

  return (
    <ul ref={listRef} className={className}>
      {children}
    </ul>
  );
}
