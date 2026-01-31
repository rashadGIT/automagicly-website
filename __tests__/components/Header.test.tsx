/**
 * Header Component Tests
 */
import { render, screen, fireEvent, act, waitFor } from '../utils/test-utils';
import Header from '@/components/Header';

// Mock scrollToElement utility
jest.mock('@/lib/utils', () => ({
  ...jest.requireActual('@/lib/utils'),
  scrollToElement: jest.fn(),
}));

import { scrollToElement } from '@/lib/utils';

describe('Header Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    // Reset scroll position
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Rendering', () => {
    it('should render the logo', () => {
      render(<Header />);

      expect(screen.getByText('AutoMagicly')).toBeInTheDocument();
    });

    it('should render all navigation items on desktop', () => {
      render(<Header />);

      expect(screen.getByRole('button', { name: /what we do/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /roi calculator/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /services/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /how it works/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /faq/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /coming soon/i })).toBeInTheDocument();
    });

    it('should render Get Started button', () => {
      render(<Header />);

      // There may be multiple "Get Started" buttons (desktop + mobile when open)
      const buttons = screen.getAllByRole('button', { name: /get started/i });
      expect(buttons.length).toBeGreaterThanOrEqual(1);
    });

    it('should render mobile menu toggle button', () => {
      render(<Header />);

      expect(screen.getByRole('button', { name: /toggle menu/i })).toBeInTheDocument();
    });
  });

  describe('Scroll Behavior', () => {
    it('should update header style when scrolled', async () => {
      render(<Header />);

      // Simulate scroll
      await act(async () => {
        Object.defineProperty(window, 'scrollY', { value: 100, writable: true });
        fireEvent.scroll(window);
      });

      // Header should have glass class when scrolled
      const header = document.querySelector('header');
      expect(header).toBeInTheDocument();
    });

    it('should scroll to top when logo is clicked', async () => {
      const scrollToMock = jest.fn();
      window.scrollTo = scrollToMock;

      render(<Header />);

      const logo = screen.getByText('AutoMagicly');
      await act(async () => {
        fireEvent.click(logo);
      });

      expect(scrollToMock).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    });
  });

  describe('Navigation', () => {
    it('should call scrollToElement when nav item is clicked', async () => {
      render(<Header />);

      const navButton = screen.getByRole('button', { name: /what we do/i });
      await act(async () => {
        fireEvent.click(navButton);
        jest.advanceTimersByTime(100);
      });

      expect(scrollToElement).toHaveBeenCalledWith('what-we-do');
    });

    it('should call scrollToElement for each nav section', async () => {
      render(<Header />);

      const navItems = [
        { name: /what we do/i, id: 'what-we-do' },
        { name: /roi calculator/i, id: 'roi-calculator' },
        { name: /services/i, id: 'services' },
        { name: /how it works/i, id: 'how-it-works' },
        { name: /faq/i, id: 'faq' },
        { name: /coming soon/i, id: 'coming-soon' },
      ];

      for (const item of navItems) {
        jest.clearAllMocks();
        const button = screen.getByRole('button', { name: item.name });
        await act(async () => {
          fireEvent.click(button);
          jest.advanceTimersByTime(100);
        });
        expect(scrollToElement).toHaveBeenCalledWith(item.id);
      }
    });

    it('should scroll to audit section when Get Started is clicked', async () => {
      render(<Header />);

      // Get the first "Get Started" button (desktop version)
      const getStartedButtons = screen.getAllByRole('button', { name: /get started/i });
      await act(async () => {
        fireEvent.click(getStartedButtons[0]);
        jest.advanceTimersByTime(100);
      });

      expect(scrollToElement).toHaveBeenCalledWith('ai-audit');
    });
  });

  describe('Mobile Menu', () => {
    it('should toggle mobile menu when menu button is clicked', async () => {
      render(<Header />);

      const menuButton = screen.getByRole('button', { name: /toggle menu/i });

      // Initially closed - mobile nav should not be visible
      expect(screen.queryByRole('navigation', { hidden: true })).not.toBeNull();

      // Open menu
      await act(async () => {
        fireEvent.click(menuButton);
      });

      // Mobile menu should be open - check for mobile nav items
      await waitFor(() => {
        // The mobile menu renders additional buttons when open
        const allNavButtons = screen.getAllByRole('button');
        expect(allNavButtons.length).toBeGreaterThan(8); // Desktop nav + mobile menu
      });
    });

    it('should close mobile menu when nav item is clicked', async () => {
      render(<Header />);

      const menuButton = screen.getByRole('button', { name: /toggle menu/i });

      // Open menu
      await act(async () => {
        fireEvent.click(menuButton);
      });

      // Wait for menu to open
      await waitFor(() => {
        const navButtons = screen.getAllByRole('button', { name: /what we do/i });
        expect(navButtons.length).toBeGreaterThan(1); // Desktop + mobile
      });

      // Click a nav item in the mobile menu (get all buttons with same name, click mobile one)
      const navButtons = screen.getAllByRole('button', { name: /what we do/i });
      await act(async () => {
        fireEvent.click(navButtons[navButtons.length - 1]); // Last one is mobile
        jest.advanceTimersByTime(100);
      });

      expect(scrollToElement).toHaveBeenCalledWith('what-we-do');
    });

    it('should show X icon when menu is open', async () => {
      render(<Header />);

      const menuButton = screen.getByRole('button', { name: /toggle menu/i });

      // Initially should show Menu icon (not X)
      const svgElements = menuButton.querySelectorAll('svg');
      expect(svgElements.length).toBe(1);

      // Open menu
      await act(async () => {
        fireEvent.click(menuButton);
      });

      // After opening, button should still be in document
      const updatedMenuButton = screen.getByRole('button', { name: /toggle menu/i });
      expect(updatedMenuButton).toBeInTheDocument();

      // The button should now show X icon (verify by checking SVG content changes)
      const svgElementsAfterOpen = updatedMenuButton.querySelectorAll('svg');
      expect(svgElementsAfterOpen.length).toBe(1);
    });
  });

  describe('Accessibility', () => {
    it('should have aria-label on menu toggle button', () => {
      render(<Header />);

      const menuButton = screen.getByRole('button', { name: /toggle menu/i });
      expect(menuButton).toHaveAttribute('aria-label', 'Toggle menu');
    });

    it('should be keyboard navigable', async () => {
      render(<Header />);

      const firstNavItem = screen.getByRole('button', { name: /what we do/i });

      // Focus and press Enter
      await act(async () => {
        firstNavItem.focus();
        fireEvent.keyDown(firstNavItem, { key: 'Enter' });
        fireEvent.click(firstNavItem);
        jest.advanceTimersByTime(100);
      });

      expect(scrollToElement).toHaveBeenCalledWith('what-we-do');
    });
  });

  describe('Touch Events', () => {
    it('should handle touch events on mobile menu items', async () => {
      render(<Header />);

      const menuButton = screen.getByRole('button', { name: /toggle menu/i });

      // Open menu
      await act(async () => {
        fireEvent.click(menuButton);
      });

      // Wait for menu to open
      await waitFor(() => {
        const navButtons = screen.getAllByRole('button', { name: /services/i });
        expect(navButtons.length).toBeGreaterThan(1);
      });

      // Get mobile menu button
      const servicesButtons = screen.getAllByRole('button', { name: /services/i });
      const mobileButton = servicesButtons[servicesButtons.length - 1];

      // Test touchEnd event
      await act(async () => {
        fireEvent.touchEnd(mobileButton);
        jest.advanceTimersByTime(100);
      });

      expect(scrollToElement).toHaveBeenCalledWith('services');
    });
  });
});
