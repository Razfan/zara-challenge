import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { CartSummary } from './CartSummary';

const pay = () => screen.getByRole('button', { name: 'PAY' });

describe('CartSummary', () => {
  it('shows "TOTAL <sum> EUR" and PAY while the cart has lines', () => {
    render(<CartSummary count={2} total={1728} />);

    expect(screen.getByText('TOTAL')).toBeInTheDocument();
    expect(screen.getByText('1728 EUR')).toBeInTheDocument();
    expect(pay()).toBeInTheDocument();
  });

  it('hides TOTAL and PAY and shows only CONTINUE SHOPPING while the cart is empty', () => {
    render(<CartSummary count={0} total={0} />);

    expect(screen.queryByText('TOTAL')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'PAY' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'CONTINUE SHOPPING' })).toBeInTheDocument();
  });

  it('CONTINUE SHOPPING links to the main view', () => {
    render(<CartSummary count={1} total={1329} />);

    expect(screen.getByRole('link', { name: 'CONTINUE SHOPPING' })).toHaveAttribute('href', '/');
  });

  it('announces that payment is not available when PAY is pressed', async () => {
    render(<CartSummary count={1} total={1329} />);
    const status = screen.getByRole('status');
    expect(status).toBeEmptyDOMElement();

    await userEvent.click(pay());

    expect(status).toHaveTextContent('Payment is not available in this demo');
  });

  it('drops the payment message once the cart is emptied', async () => {
    const { rerender } = render(<CartSummary count={1} total={1329} />);
    await userEvent.click(pay());

    rerender(<CartSummary count={0} total={0} />);

    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it.each([
    ['with lines', 2, 1728],
    ['empty', 0, 0],
  ])('has no accessibility violations %s', async (_, count, total) => {
    const { container } = render(<CartSummary count={count} total={total} />);

    expect(await axe(container)).toHaveNoViolations();
  });
});
