'use client';

import { useEffect, useId, useRef, type PointerEvent } from 'react';
import { ProductCard } from '@/components/product/ProductCard';
import { scrollLeftFor, scrollProgress } from '@/lib/utils';
import type { ProductListItem } from '@/lib/types';
import styles from './SimilarProducts.module.scss';

type SimilarProductsProps = { products: readonly ProductListItem[] };

/**
 * "SIMILAR ITEMS" carousel: native horizontal scroll with snap, so touch, trackpad and
 * keyboard (the region is focusable) work as usual. The native scrollbar is hidden for the
 * Figma 1px bar: pressing it scrolls smoothly and its thumb can be dragged.
 */
export function SimilarProducts({ products }: SimilarProductsProps) {
  const titleId = useId();
  const carouselRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startX: number; startScrollLeft: number; travel: number } | null>(null);

  // Written as a CSS variable, not state: scrolling never re-renders the cards.
  useEffect(() => {
    const carousel = carouselRef.current;
    const progressBar = progressRef.current;
    if (!carousel || !progressBar) return;

    const update = () =>
      progressBar.style.setProperty('--scroll-progress', String(scrollProgress(carousel)));
    update();
    carousel.addEventListener('scroll', update, { passive: true });
    return () => carousel.removeEventListener('scroll', update);
  }, []);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const carousel = carouselRef.current;
    const thumb = thumbRef.current;
    if (!carousel || !thumb || event.button !== 0) return;
    const { left, width } = event.currentTarget.getBoundingClientRect();
    const travel = width - thumb.offsetWidth;
    if (travel <= 0) return;

    if (event.target === thumb) {
      // Dragging the thumb follows the pointer from where it was grabbed, with snapping off
      // so every move is not pulled back to a card (it snaps again on release).
      event.currentTarget.setPointerCapture?.(event.pointerId);
      dragRef.current = { startX: event.clientX, startScrollLeft: carousel.scrollLeft, travel };
      carousel.dataset.dragging = 'true';
      return;
    }

    // Pressing the track centers the thumb there, with a smooth scroll.
    const progress = (event.clientX - left - thumb.offsetWidth / 2) / travel;
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    carousel.scrollTo({
      left: scrollLeftFor(progress, carousel),
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const carousel = carouselRef.current;
    const drag = dragRef.current;
    if (!carousel || !drag) return;
    const overflow = carousel.scrollWidth - carousel.clientWidth;
    carousel.scrollLeft =
      drag.startScrollLeft + ((event.clientX - drag.startX) * overflow) / drag.travel;
  };

  const endDrag = () => {
    dragRef.current = null;
    if (carouselRef.current) delete carouselRef.current.dataset.dragging;
  };

  if (products.length === 0) return null;

  return (
    <section className={styles.similar}>
      <h2 id={titleId} className={styles.title}>
        SIMILAR ITEMS
      </h2>
      <div
        ref={carouselRef}
        className={styles.carousel}
        role="region"
        aria-labelledby={titleId}
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- lets arrow keys scroll it
        tabIndex={0}
      >
        <ul className={styles.list}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </ul>
      </div>
      <div
        ref={progressRef}
        className={styles.progress}
        aria-hidden="true"
        data-testid="scroll-progress"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div ref={thumbRef} className={styles.thumb} data-testid="scroll-thumb" />
      </div>
    </section>
  );
}
