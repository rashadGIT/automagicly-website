/**
 * Services Component Tests
 */
import { render, screen, fireEvent, act, waitFor } from '../utils/test-utils';
import Services from '@/components/Services';

// Mock scrollToElement utility
jest.mock('@/lib/utils', () => ({
  ...jest.requireActual('@/lib/utils'),
  scrollToElement: jest.fn(),
}));

import { scrollToElement } from '@/lib/utils';

describe('Services Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the section with correct heading', () => {
      render(<Services />);

      expect(screen.getByText('How We')).toBeInTheDocument();
      expect(screen.getByText('Work With You')).toBeInTheDocument();
    });

    it('should render the flexible options badge', () => {
      render(<Services />);

      expect(screen.getByText('Flexible Options')).toBeInTheDocument();
    });

    it('should render both service toggle buttons', () => {
      render(<Services />);

      expect(screen.getByRole('button', { name: /ai partnership/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /simple workflow/i })).toBeInTheDocument();
    });

    it('should have partnership selected by default', () => {
      render(<Services />);

      expect(screen.getByText('AI Partnership (Full Service)')).toBeInTheDocument();
      expect(screen.getByText('Ongoing support for teams that want done-for-you automation')).toBeInTheDocument();
    });
  });

  describe('Partnership Service', () => {
    it('should display all partnership features', () => {
      render(<Services />);

      expect(screen.getByText('Ongoing support + continuous improvements')).toBeInTheDocument();
      expect(screen.getByText('We stay with you as your needs evolve')).toBeInTheDocument();
      expect(screen.getByText('Monitoring + iteration')).toBeInTheDocument();
      expect(screen.getByText('Monthly automation roadmap')).toBeInTheDocument();
      expect(screen.getByText('Unlimited workflow adjustments')).toBeInTheDocument();
    });

    it('should display best for text', () => {
      render(<Services />);

      expect(screen.getByText(/Teams that want a long-term automation partner/)).toBeInTheDocument();
    });

    it('should have Schedule a Free AI Audit button', () => {
      render(<Services />);

      expect(screen.getByRole('button', { name: /schedule a free ai audit/i })).toBeInTheDocument();
    });
  });

  describe('One-off Service', () => {
    it('should switch to one-off service when toggled', async () => {
      render(<Services />);

      const oneOffButton = screen.getByRole('button', { name: /simple workflow/i });
      await act(async () => {
        fireEvent.click(oneOffButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Simple Workflow Automation (One-Off)')).toBeInTheDocument();
      });
    });

    it('should display all one-off features', async () => {
      render(<Services />);

      const oneOffButton = screen.getByRole('button', { name: /simple workflow/i });
      await act(async () => {
        fireEvent.click(oneOffButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Build a single workflow end-to-end')).toBeInTheDocument();
        expect(screen.getByText('Training + handoff documentation')).toBeInTheDocument();
        expect(screen.getByText('Optional maintenance packages')).toBeInTheDocument();
        expect(screen.getByText('Faster turnaround')).toBeInTheDocument();
      });
    });

    it('should display correct best for text for one-off', async () => {
      render(<Services />);

      const oneOffButton = screen.getByRole('button', { name: /simple workflow/i });
      await act(async () => {
        fireEvent.click(oneOffButton);
      });

      await waitFor(() => {
        expect(screen.getByText(/Teams starting small or solving a single/)).toBeInTheDocument();
      });
    });
  });

  describe('Service Toggle', () => {
    it('should toggle between services', async () => {
      render(<Services />);

      // Start with partnership
      expect(screen.getByText('AI Partnership (Full Service)')).toBeInTheDocument();

      // Switch to one-off
      const oneOffButton = screen.getByRole('button', { name: /simple workflow/i });
      await act(async () => {
        fireEvent.click(oneOffButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Simple Workflow Automation (One-Off)')).toBeInTheDocument();
      });

      // Switch back to partnership
      const partnershipButton = screen.getByRole('button', { name: /ai partnership/i });
      await act(async () => {
        fireEvent.click(partnershipButton);
      });

      await waitFor(() => {
        expect(screen.getByText('AI Partnership (Full Service)')).toBeInTheDocument();
      });
    });
  });

  describe('CTA Button', () => {
    it('should call scrollToElement when CTA is clicked in partnership view', async () => {
      render(<Services />);

      const ctaButton = screen.getByRole('button', { name: /schedule a free ai audit/i });
      await act(async () => {
        fireEvent.click(ctaButton);
      });

      expect(scrollToElement).toHaveBeenCalledWith('booking');
    });

    it('should call scrollToElement when CTA is clicked in one-off view', async () => {
      render(<Services />);

      // Switch to one-off
      const oneOffButton = screen.getByRole('button', { name: /simple workflow/i });
      await act(async () => {
        fireEvent.click(oneOffButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Simple Workflow Automation (One-Off)')).toBeInTheDocument();
      });

      const ctaButton = screen.getByRole('button', { name: /schedule a free ai audit/i });
      await act(async () => {
        fireEvent.click(ctaButton);
      });

      expect(scrollToElement).toHaveBeenCalledWith('booking');
    });
  });

  describe('Accessibility', () => {
    it('should have correct section id', () => {
      render(<Services />);

      const section = document.querySelector('#services');
      expect(section).toBeInTheDocument();
    });

    it('should have proper heading hierarchy', () => {
      render(<Services />);

      const h2 = screen.getByRole('heading', { level: 2 });
      expect(h2).toBeInTheDocument();

      const h3s = screen.getAllByRole('heading', { level: 3 });
      expect(h3s.length).toBeGreaterThan(0);
    });
  });
});
