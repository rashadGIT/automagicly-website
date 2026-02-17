import { render, screen, fireEvent } from '@testing-library/react';
import AuditStartScreen from '@/components/audit/AuditStartScreen';

describe('AuditStartScreen', () => {
  it('should render the start screen with title and description', () => {
    render(<AuditStartScreen onStart={jest.fn()} />);

    expect(screen.getByText('AI Business Audit')).toBeInTheDocument();
    expect(screen.getByText(/Answer a few questions about your business/i)).toBeInTheDocument();
  });

  it('should display the three steps', () => {
    render(<AuditStartScreen onStart={jest.fn()} />);

    expect(screen.getByText(/Answer 3 discovery questions/i)).toBeInTheDocument();
    expect(screen.getByText(/AI asks follow-up questions/i)).toBeInTheDocument();
    expect(screen.getByText(/Get personalized recommendations/i)).toBeInTheDocument();
  });

  it('should call onStart when button is clicked', () => {
    const onStart = jest.fn();
    render(<AuditStartScreen onStart={onStart} />);

    const button = screen.getByRole('button', { name: /Start your free AI business audit/i });
    fireEvent.click(button);

    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it('should disable button when loading', () => {
    render(<AuditStartScreen onStart={jest.fn()} isLoading={true} />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });
});
