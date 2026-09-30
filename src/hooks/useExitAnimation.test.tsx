import { render } from '@testing-library/react';
import { useRef } from 'react';
import { act } from 'react';
import { useExitAnimation } from './useExitAnimation';

function Box({ leaving, onDone }: { leaving: boolean; onDone: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useExitAnimation(ref, leaving, onDone);
  return <div ref={ref} />;
}

describe('useExitAnimation', () => {
  it('does not call onDone while not leaving', () => {
    const onDone = jest.fn();
    render(<Box leaving={false} onDone={onDone} />);

    expect(onDone).not.toHaveBeenCalled();
  });

  it('calls onDone right away when there is no animation to wait for', () => {
    const onDone = jest.fn();
    render(<Box leaving={true} onDone={onDone} />);

    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('waits for every running animation to finish before calling onDone', async () => {
    let resolveFinished: () => void = () => {};
    const finished = new Promise<void>((resolve) => (resolveFinished = resolve));
    const getAnimations = jest.fn(() => [{ finished }] as unknown as Animation[]);
    Object.defineProperty(HTMLElement.prototype, 'getAnimations', {
      configurable: true,
      value: getAnimations,
    });
    const onDone = jest.fn();

    render(<Box leaving={true} onDone={onDone} />);
    expect(onDone).not.toHaveBeenCalled();

    await act(async () => {
      resolveFinished();
      await finished;
    });

    expect(onDone).toHaveBeenCalledTimes(1);
    delete (HTMLElement.prototype as Partial<HTMLElement>).getAnimations;
  });

  it('ignores a cancelled animation', async () => {
    const finished = Promise.reject(new Error('cancelled'));
    const getAnimations = jest.fn(() => [{ finished }] as unknown as Animation[]);
    Object.defineProperty(HTMLElement.prototype, 'getAnimations', {
      configurable: true,
      value: getAnimations,
    });
    const onDone = jest.fn();

    render(<Box leaving={true} onDone={onDone} />);
    await act(async () => {
      await finished.catch(() => {});
    });

    expect(onDone).not.toHaveBeenCalled();
    delete (HTMLElement.prototype as Partial<HTMLElement>).getAnimations;
  });
});
