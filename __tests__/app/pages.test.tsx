/**
 * App Pages Tests
 * Tests for main app layout and page components
 */
import { render } from '../utils/test-utils'

// Mock all components used in the pages
jest.mock('@/components/Header', () => ({
  __esModule: true,
  default: () => <div data-testid="header">Header</div>,
}))

jest.mock('@/components/Hero', () => ({
  __esModule: true,
  default: () => <div data-testid="hero">Hero</div>,
}))

jest.mock('@/components/WhatWeDo', () => ({
  __esModule: true,
  default: () => <div data-testid="what-we-do">WhatWeDo</div>,
}))

jest.mock('@/components/Services', () => ({
  __esModule: true,
  default: () => <div data-testid="services">Services</div>,
}))

jest.mock('@/components/ExampleAutomations', () => ({
  __esModule: true,
  default: () => <div data-testid="examples">Examples</div>,
}))

jest.mock('@/components/HowItWorks', () => ({
  __esModule: true,
  default: () => <div data-testid="how-it-works">HowItWorks</div>,
}))

jest.mock('@/components/CustomBooking', () => ({
  __esModule: true,
  default: () => <div data-testid="booking">Booking</div>,
}))

jest.mock('@/components/Reviews', () => ({
  __esModule: true,
  default: () => <div data-testid="reviews">Reviews</div>,
}))

jest.mock('@/components/ROICalculator', () => ({
  __esModule: true,
  default: () => <div data-testid="roi">ROI</div>,
}))

jest.mock('@/components/Referrals', () => ({
  __esModule: true,
  default: () => <div data-testid="referrals">Referrals</div>,
}))

jest.mock('@/components/FAQ', () => ({
  __esModule: true,
  default: () => <div data-testid="faq">FAQ</div>,
}))

jest.mock('@/components/Footer', () => ({
  __esModule: true,
  default: () => <div data-testid="footer">Footer</div>,
}))

jest.mock('@/components/ChatWidget', () => ({
  __esModule: true,
  default: () => <div data-testid="chat">Chat</div>,
}))

describe('App Pages', () => {
  describe('Layout', () => {
    it('should render layout component', async () => {
      const RootLayout = (await import('@/app/layout')).default

      const { container } = render(
        <RootLayout>
          <div>Test Content</div>
        </RootLayout>
      )

      expect(container).toBeTruthy()
    })

    it('should include children content', async () => {
      const RootLayout = (await import('@/app/layout')).default

      const { container } = render(
        <RootLayout>
          <div data-testid="child-content">Child Content</div>
        </RootLayout>
      )

      const child = container.querySelector('[data-testid="child-content"]')
      expect(child).toBeTruthy()
    })
  })

  describe('Home Page', () => {
    it('should render home page', async () => {
      const HomePage = (await import('@/app/page')).default

      const { container } = render(<HomePage />)
      expect(container).toBeTruthy()
    })

    it('should render without errors', async () => {
      const HomePage = (await import('@/app/page')).default

      expect(() => render(<HomePage />)).not.toThrow()
    })

    it('should have main content structure', async () => {
      const HomePage = (await import('@/app/page')).default

      const { container } = render(<HomePage />)
      expect(container.firstChild).toBeTruthy()
    })
  })
})
