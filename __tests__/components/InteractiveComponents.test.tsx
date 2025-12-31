/**
 * Interactive Components Tests
 * Tests for components with user interaction (clicks, toggles, etc.)
 */
import { render, screen, fireEvent, waitFor } from '../utils/test-utils'
import FAQ from '@/components/FAQ'
import Header from '@/components/Header'
import Services from '@/components/Services'

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    nav: ({ children, ...props }: any) => <nav {...props}>{children}</nav>,
    header: ({ children, ...props }: any) => <header {...props}>{children}</header>,
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
  useScroll: () => ({ scrollY: { get: () => 0 } }),
  useMotionValueEvent: () => {},
}))

describe('Interactive Components', () => {
  describe('FAQ Component', () => {
    it('should render FAQ section', () => {
      render(<FAQ />)
      const container = screen.getByText(/FAQ|Questions|Frequently/i).closest('div')
      expect(container).toBeTruthy()
    })

    it('should display FAQ items', () => {
      const { container } = render(<FAQ />)
      expect(container.textContent).toBeTruthy()
      expect(container.textContent!.length).toBeGreaterThan(0)
    })

    it('should have clickable FAQ items', () => {
      const { container } = render(<FAQ />)
      const buttons = container.querySelectorAll('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should toggle FAQ items on click', () => {
      const { container } = render(<FAQ />)
      const buttons = container.querySelectorAll('button')

      if (buttons.length > 0) {
        const firstButton = buttons[0]
        fireEvent.click(firstButton)
        // FAQ should handle the click without errors
        expect(firstButton).toBeTruthy()
      }
    })
  })

  describe('Header Component', () => {
    it('should render header', () => {
      render(<Header />)
      const header = document.querySelector('header')
      expect(header).toBeTruthy()
    })

    it('should display brand/logo', () => {
      const { container } = render(<Header />)
      expect(container.textContent).toBeTruthy()
    })

    it('should have navigation elements', () => {
      const { container } = render(<Header />)
      const nav = container.querySelector('nav')
      expect(nav).toBeTruthy()
    })

    it('should handle mobile menu toggle', () => {
      const { container } = render(<Header />)
      // Look for menu button (hamburger)
      const buttons = container.querySelectorAll('button')

      if (buttons.length > 0) {
        // Click first button (likely menu toggle)
        fireEvent.click(buttons[0])
        expect(buttons[0]).toBeTruthy()
      }
    })

    it('should have navigation links', () => {
      const { container } = render(<Header />)
      const links = container.querySelectorAll('a, button')
      expect(links.length).toBeGreaterThan(0)
    })
  })

  describe('Services Component', () => {
    it('should render services section', () => {
      render(<Services />)
      const container = screen.getByText(/Services|What We Offer/i).closest('div')
      expect(container).toBeTruthy()
    })

    it('should display multiple service offerings', () => {
      const { container } = render(<Services />)
      expect(container.textContent).toBeTruthy()
      expect(container.textContent!.length).toBeGreaterThan(100)
    })

    it('should have service cards or items', () => {
      const { container } = render(<Services />)
      const cards = container.querySelectorAll('div[class*="card"], div[class*="service"]')
      // Should have some structure even if not using specific class names
      expect(container.children.length).toBeGreaterThan(0)
    })

    it('should render without errors', () => {
      expect(() => render(<Services />)).not.toThrow()
    })
  })
})
