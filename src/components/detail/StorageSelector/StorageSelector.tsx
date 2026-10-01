'use client';

import { useId } from 'react';
import type { StorageOption } from '@/lib/types';
import styles from './StorageSelector.module.scss';

type StorageSelectorProps = {
  options: readonly StorageOption[];
  /** `undefined` until the user picks one: nothing is preselected. */
  selected: StorageOption | undefined;
  onSelect: (option: StorageOption) => void;
};

/** Storage radio group: native radios give arrow-key navigation, focus and
 * announcements; they are visually hidden and their labels are the Figma cells. */
export function StorageSelector({ options, selected, onSelect }: StorageSelectorProps) {
  const name = useId();

  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>Storage ¿HOW MUCH SPACE DO YOU NEED?</legend>
      <div className={styles.options}>
        {options.map((option) => (
          <label key={option.capacity} className={styles.option}>
            <input
              type="radio"
              name={name}
              value={option.capacity}
              checked={selected?.capacity === option.capacity}
              onChange={() => onSelect(option)}
              className={styles.input}
            />
            {option.capacity}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
