import { render, screen } from '@testing-library/react';
import AuditProcessingScreen from '@/components/audit/AuditProcessingScreen';

describe('AuditProcessingScreen', () => {
  it('should render processing screen with title', () => {
    render(<AuditProcessingScreen />);

    expect(screen.getByText('Analyzing Your Business...')).toBeInTheDocument();
  });

  it('should display processing message', () => {
    render(<AuditProcessingScreen />);

    expect(screen.getByText(/Our AI is processing your responses/i)).toBeInTheDocument();
  });

  it('should show processing steps', () => {
    render(<AuditProcessingScreen />);

    expect(screen.getByText(/Understanding your workflow/i)).toBeInTheDocument();
    expect(screen.getByText(/Identifying pain points/i)).toBeInTheDocument();
    expect(screen.getByText(/Generating recommendations/i)).toBeInTheDocument();
    expect(screen.getByText(/Preparing your custom audit/i)).toBeInTheDocument();
  });

  it('should have status role for screen readers', () => {
    const { container } = render(<AuditProcessingScreen />);

    const statusElement = container.querySelector('[role="status"]');
    expect(statusElement).toBeInTheDocument();
  });
});
