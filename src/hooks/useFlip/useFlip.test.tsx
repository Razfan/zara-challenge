import { render, screen } from '@testing-library/react';
import { useRef } from 'react';
import { useFlip } from './useFlip';

/** One row of 100px cells: an item's position is its index in the list. */
const CELL = 100;

function Row({ ids }: { ids: readonly string[] }) {
  const ref = useRef<HTMLUListElement>(null);
  useFlip(ref, ids);
  return (
    <ul ref={ref}>
      {ids.map((id, index) => (
        <li key={id} data-testid={id} data-index={index} />
      ))}
    </ul>
  );
}

const animate = jest.fn();
let reducedMotion = false;

beforeEach(() => {
  reducedMotion = false;
  Object.defineProperty(HTMLElement.prototype, 'animate', { configurable: true, value: animate });
  jest.spyOn(HTMLElement.prototype, 'offsetLeft', 'get').mockImplementation(function (
    this: HTMLElement,
  ) {
    return Number(this.dataset.index ?? 0) * CELL;
  });
  window.matchMedia = jest.fn(() => ({ matches: reducedMotion }) as MediaQueryList);
});

afterEach(() => {
  delete (HTMLElement.prototype as Partial<HTMLElement>).animate;
  jest.restoreAllMocks();
});

const animationsOf = (id: string) =>
  animate.mock.contexts
    .map((context, call) => [context, animate.mock.calls[call]?.[0]] as const)
    .filter(([context]) => context === screen.getByTestId(id))
    .map(([, keyframes]) => keyframes as Keyframe[]);

describe('useFlip', () => {
  it('does not animate the first render', () => {
    render(<Row ids={['a', 'b']} />);

    expect(animate).not.toHaveBeenCalled();
  });

  it('slides the items that stay from their old position to the new one', () => {
    const { rerender } = render(<Row ids={['a', 'b', 'c']} />);

    rerender(<Row ids={['c', 'a']} />);

    expect(animationsOf('c')).toEqual([
      [{ transform: 'translate(200px, 0px)' }, { transform: 'none' }],
    ]);
    expect(animationsOf('a')).toEqual([
      [{ transform: 'translate(-100px, 0px)' }, { transform: 'none' }],
    ]);
  });

  it('fades in the new items and leaves the ones that did not move alone', () => {
    const { rerender } = render(<Row ids={['a', 'b']} />);

    rerender(<Row ids={['a', 'd']} />);

    expect(animationsOf('a')).toEqual([]);
    expect(animationsOf('d')).toEqual([[{ opacity: 0 }, { opacity: 1 }]]);
  });

  it('does not animate with reduced motion', () => {
    reducedMotion = true;
    const { rerender } = render(<Row ids={['a', 'b']} />);

    rerender(<Row ids={['b', 'c']} />);

    expect(animate).not.toHaveBeenCalled();
  });
});
