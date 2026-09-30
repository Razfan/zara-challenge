import { usePreviousValue } from '@/hooks/usePreviousValue';
import { diffChars } from '@/lib/utils';
import styles from './AnimatedText.module.scss';

type AnimatedTextProps = { value: string };

/**
 * Text where only the characters that changed fade out and in (Figma prototype).
 * The old character lives in a CSS pseudo-element, so the text stays the real value.
 * Used for the price and for the selected color's name.
 */
export function AnimatedText({ value }: AnimatedTextProps) {
  const previous = usePreviousValue(value);

  return diffChars(previous, value).map(({ char, previous: replaced }, index) =>
    replaced === undefined ? (
      char
    ) : (
      // Keyed by the change, so each new change remounts it and replays the animation.
      <span
        key={`${index}-${replaced}-${char}`}
        className={styles.changed}
        data-previous={replaced}
      >
        <span className={styles.next}>{char}</span>
      </span>
    ),
  );
}
