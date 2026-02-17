import { render, screen, fireEvent } from '@testing-library/react';
import AuditEscalatedScreen from '@/components/audit/AuditEscalatedScreen';

describe('AuditEscalatedScreen', () => {
  const mockScheduleCall = jest.fn();
  const mockReset = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render escalation screen with title', () => {
    render(
      <AuditEscalatedScreen
        onScheduleCall={mockScheduleCall}
        onReset={mockReset}
      />
    );

    expect(screen.getByText("Let's Talk in Person")).toBeInTheDocument();
  });

  it('should display escalation message', () => {
    render(
      <AuditEscalatedScreen
        onScheduleCall={mockScheduleCall}
        onReset={mockReset}
      />
    );

    expect(screen.getByText(/personalized consultation/i)).toBeInTheDocument();
  });

  it('should show escalation reason when provided', () => {
    const reason = 'Complex automation needs requiring expert consultation';
    render(
      <AuditEscalatedScreen
        escalationReason={reason}
        onScheduleCall={mockScheduleCall}
        onReset={mockReset}
      />
    );

    // Reason is wrapped in quotes in the component
    expect(screen.getByText(`"${reason}"`)).toBeInTheDocument();
  });

  it('should call onScheduleCall when booking button is clicked', () => {
    render(
      <AuditEscalatedScreen
        onScheduleCall={mockScheduleCall}
        onReset={mockReset}
      />
    );

    const bookButton = screen.getByRole('button', { name: /Schedule a free consultation call/i });
    fireEvent.click(bookButton);

    expect(mockScheduleCall).toHaveBeenCalledTimes(1);
  });

  it('should call onReset when try again button is clicked', () => {
    render(
      <AuditEscalatedScreen
        onScheduleCall={mockScheduleCall}
        onReset={mockReset}
      />
    );

    const resetButton = screen.getByRole('button', { name: /Restart the audit process/i });
    fireEvent.click(resetButton);

    expect(mockReset).toHaveBeenCalledTimes(1);
  });
});
