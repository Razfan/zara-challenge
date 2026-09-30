'use client';

import { useId } from 'react';
import type { ColorOption } from '@/lib/types';
import { AnimatedText } from './AnimatedText';
import styles from './ColorSelector.module.scss';

type ColorSelectorProps = {
  options: readonly ColorOption[];
  /** `undefined` until the user picks one: nothing is preselected. */
  selected: ColorOption | undefined;
  onSelect: (option: ColorOption) => void;
};

/** Color radio group: native radios named by the color, since the swatch alone is not
 * accessible. The selected color's name is shown under the swatches. */
export function ColorSelector({ options, selected, onSelect }: ColorSelectorProps) {
  const name = useId();

  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>Color. pick your favourite.</legend>
      <div className={styles.options}>
        {options.map((option) => (
          <label key={option.name} className={styles.option}>
            <input
              type="radio"
              name={name}
              value={option.name}
              checked={selected?.name === option.name}
              onChange={() => onSelect(option)}
              className={styles.input}
            />
            <span className={styles.visuallyHidden}>{option.name}</span>
            <span
              className={styles.swatch}
              style={{ backgroundColor: option.hexCode }}
              data-testid={`swatch-${option.name}`}
            />
          </label>
        ))}
      </div>
      {selected && (
        <p className={styles.selectedName}>
          <AnimatedText value={selected.name} />
        </p>
      )}
    </fieldset>
  );
}
