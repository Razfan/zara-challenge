import Image from 'next/image';
import { useState } from 'react';
import styles from './ProductImage.module.scss';

type ProductImageProps = { src: string; alt: string };

const IMAGE_SIZES = '(min-width: 768px) 40vw, 100vw';

/**
 * Detail image that cross-fades between colors (Figma prototype): the last image on
 * screen stays underneath until the new one has loaded, so there is never a blank frame.
 */
export function ProductImage({ src, alt }: ProductImageProps) {
  // Every color shown so far stays mounted, in the order it was first shown: reordering
  // would re-insert DOM nodes, and a re-inserted element skips its CSS transition.
  const [mountedSrcs, setMountedSrcs] = useState([src]);
  if (!mountedSrcs.includes(src)) setMountedSrcs([...mountedSrcs, src]);
  const srcs = mountedSrcs.includes(src) ? mountedSrcs : [...mountedSrcs, src];

  // Going back to a color reuses its already loaded element, which fires no new load
  // event. The first image is server-rendered and shown straight away.
  const [loadedSrcs, setLoadedSrcs] = useState(() => new Set([src]));
  const loaded = loadedSrcs.has(src);
  const markLoaded = () => setLoadedSrcs((loadedSet) => new Set(loadedSet).add(src));

  // The last image that was actually on screen: it stays underneath while the current one
  // loads, even after several quick color changes (never a blank frame).
  const [onScreenSrc, setOnScreenSrc] = useState(src);
  if (loaded && onScreenSrc !== src) setOnScreenSrc(src);
  const backdropSrc = loaded ? src : onScreenSrc;

  return srcs.map((imageSrc) => {
    const current = imageSrc === src;
    return (
      <Image
        key={imageSrc}
        src={imageSrc}
        // Only the current image is content; the others are decorative leftovers.
        alt={current ? alt : ''}
        fill
        sizes={IMAGE_SIZES}
        priority
        className={styles.image}
        data-current={current}
        data-visible={current ? loaded : imageSrc === backdropSrc}
        onLoad={current ? markLoaded : undefined}
        onError={current ? markLoaded : undefined}
      />
    );
  });
}
