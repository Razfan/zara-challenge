'use client';

import { useNavigationProgress } from '@/hooks/useNavigationProgress';
import styles from './LoadingBar.module.scss';

type LoadingBarProps = {
  /** Forces the bar on, for route-level `loading.tsx`. */
  active?: boolean;
};

/** 1px line under the header while a search or navigation is in progress. */
export function LoadingBar({ active = false }: LoadingBarProps) {
  const { isPending } = useNavigationProgress();
  if (!active && !isPending) return null;

  return <div role="progressbar" aria-label="Loading" className={styles.loadingBar} />;
}
