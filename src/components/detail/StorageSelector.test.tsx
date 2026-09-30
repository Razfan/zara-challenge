import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { useState } from 'react';
import type { StorageOption } from '@/lib/types';
import { StorageSelector } from './StorageSelector';

const options: StorageOption[] = [
  { capacity: '256 GB', price: 1229 },
  { capacity: '512 GB', price: 1329 },
];

/** Controlled like in ProductConfigurator. */
function Harness() {
  const [selected, setSelected] = useState<StorageOption>();
  return <StorageSelector options={options} selected={selected} onSelect={setSelected} />;
}

const LABEL = 'Storage ¿HOW MUCH SPACE DO YOU NEED?';

describe('StorageSelector', () => {
  it('presents the storage options as a labelled radio group', () => {
    render(<Harness />);

    const group = screen.getByRole('group', { name: LABEL });
    expect(within(group).getAllByRole('radio')).toHaveLength(2);
    for (const { capacity } of options) {
      expect(within(group).getByRole('radio', { name: capacity })).toBeInTheDocument();
    }
  });

  it('does not preselect any option', () => {
    render(<Harness />);

    for (const radio of screen.getAllByRole('radio')) expect(radio).not.toBeChecked();
  });

  it('selects an option on click and reports it', async () => {
    const onSelect = jest.fn();
    render(<StorageSelector options={options} selected={undefined} onSelect={onSelect} />);

    await userEvent.click(screen.getByRole('radio', { name: '512 GB' }));

    expect(onSelect).toHaveBeenCalledWith(options[1]);
  });

  it('marks the active option', async () => {
    render(<Harness />);

    await userEvent.click(screen.getByText('512 GB'));

    expect(screen.getByRole('radio', { name: '512 GB' })).toBeChecked();
    expect(screen.getByRole('radio', { name: '256 GB' })).not.toBeChecked();
  });

  it('is keyboard navigable: Tab focuses the group, arrows move the selection', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.tab();
    await user.keyboard(' ');
    expect(screen.getByRole('radio', { name: '256 GB' })).toBeChecked();

    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: '512 GB' })).toBeChecked();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Harness />);

    expect(await axe(container)).toHaveNoViolations();
  });
});
