/**
 * Hero Component Tests
 */
import { render, screen, fireEvent, act } from '../utils/test-utils';
import Hero from '@/components/Hero';

// Mock scrollToElement utility
jest.mock('@/lib/utils', () => ({
  ...jest.requireActual('@/lib/utils'),
  scrollToElement: jest.fn(),
}));

import { scrollToElement } from '@/lib/utils';

describe('Hero Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the main headline', () => {
      render(<Hero />);

      expect(screen.getByText('Automate the')).toBeInTheDocument();
      expect(screen.getByText('busywork.')).toBeInTheDocument();
      expect(screen.getByText('Run your business')).toBeInTheDocument();
      expect(screen.getByText('faster.')).toBeInTheDocument();
    });

    it('should render the badge text', () => {
      render(<Hero />);

      expect(screen.getByText('Automation that feels like magic')).toBeInTheDocument();
    });

    it('should render the subheadline', () => {
      render(<Hero />);

      expect(
        screen.getByText(/We design and implement AI-powered workflows/)
      ).toBeInTheDocument();
    });

    it('should render both CTA buttons', () => {
      render(<Hero />);

      expect(screen.getByRole('button', { name: /schedule a free ai audit/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /see what we automate/i })).toBeInTheDocument();
    });
  });

  describe('Trust Indicators', () => {
    it('should render all three trust indicators', () => {
      render(<Hero />);

      expect(screen.getByText('Practical builds')).toBeInTheDocument();
      expect(screen.getByText('Deployed in days, not months')).toBeInTheDocument();

      expect(screen.getByText('Secure-by-default')).toBeInTheDocument();
      expect(screen.getByText('Built with best practices')).toBeInTheDocument();

      expect(screen.getByText('Documented workflows')).toBeInTheDocument();
      expect(screen.getByText('Support when you need it')).toBeInTheDocument();
    });
  });

  describe('CTA Interactions', () => {
    it('should call scrollToElement with booking when primary CTA is clicked', async () => {
      render(<Hero />);

      const primaryCTA = screen.getByRole('button', { name: /schedule a free ai audit/i });
      await act(async () => {
        fireEvent.click(primaryCTA);
      });

      expect(scrollToElement).toHaveBeenCalledWith('booking');
    });

    it('should call scrollToElement with examples when secondary CTA is clicked', async () => {
      render(<Hero />);

      const secondaryCTA = screen.getByRole('button', { name: /see what we automate/i });
      await act(async () => {
        fireEvent.click(secondaryCTA);
      });

      expect(scrollToElement).toHaveBeenCalledWith('examples');
    });
  });

  describe('Visual Elements', () => {
    it('should render animated background elements', () => {
      render(<Hero />);

      // Background elements are decorative, check that component renders without error
      const section = document.querySelector('section');
      expect(section).toBeInTheDocument();
      expect(section?.classList.contains('relative')).toBe(true);
    });

    it('should have gradient overlay at bottom', () => {
      render(<Hero />);

      // The gradient overlay is at the bottom
      const gradientOverlay = document.querySelector('.bg-gradient-to-t');
      expect(gradientOverlay).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should render heading with responsive classes', () => {
      render(<Hero />);

      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toBeInTheDocument();
      expect(h1.className).toContain('text-5xl');
    });

    it('should have flex column layout for CTA buttons on mobile', () => {
      render(<Hero />);

      const ctaContainer = document
        .querySelector('.flex-col')
        ?.closest('.flex');
      expect(ctaContainer).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<Hero />);

      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toBeInTheDocument();
    });

    it('should have accessible buttons', () => {
      render(<Hero />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBe(2);
      buttons.forEach((button) => {
        expect(button).toBeInTheDocument();
      });
    });
  });

  describe('Content', () => {
    it('should mention key services in subheadline', () => {
      render(<Hero />);

      const subheadline = screen.getByText(/We design and implement AI-powered workflows/);
      expect(subheadline.textContent).toContain('email');
      expect(subheadline.textContent).toContain('CRM');
      expect(subheadline.textContent).toContain('documents');
      expect(subheadline.textContent).toContain('scheduling');
      expect(subheadline.textContent).toContain('reporting');
    });
  });
});
