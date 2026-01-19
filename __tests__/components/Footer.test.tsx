/**
 * Footer Component Tests
 * Tests the footer component rendering and interactions
 */
import { render, screen, fireEvent } from '@testing-library/react'
import Footer from '@/components/Footer'

// Mock the scrollToElement function
jest.mock('@/lib/utils', () => ({
  scrollToElement: jest.fn(),
}))

import { scrollToElement } from '@/lib/utils'

const mockScrollToElement = scrollToElement as jest.MockedFunction<typeof scrollToElement>

describe('Footer Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Initial Render', () => {
    it('should render the footer', () => {
      render(<Footer />)
      expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    })

    it('should display the company name', () => {
      render(<Footer />)
      expect(screen.getByText('AutoMagicly')).toBeInTheDocument()
    })

    it('should display the tagline', () => {
      render(<Footer />)
      expect(screen.getByText(/AI automation that feels like magic/)).toBeInTheDocument()
    })
  })

  describe('CTA Section', () => {
    it('should display the CTA heading', () => {
      render(<Footer />)
      expect(screen.getByText('Ready to Automate Your Busywork?')).toBeInTheDocument()
    })

    it('should display the CTA description', () => {
      render(<Footer />)
      expect(screen.getByText(/Schedule a free AI Audit/)).toBeInTheDocument()
    })

    it('should have the Schedule AI Audit button', () => {
      render(<Footer />)
      expect(screen.getByText('Schedule Your Free AI Audit')).toBeInTheDocument()
    })

    it('should call scrollToElement when CTA button is clicked', () => {
      render(<Footer />)
      const ctaButton = screen.getByText('Schedule Your Free AI Audit')

      fireEvent.click(ctaButton)

      expect(mockScrollToElement).toHaveBeenCalledWith('booking')
    })

    it('should display the ready badge', () => {
      render(<Footer />)
      expect(screen.getByText('Ready to transform your workflow?')).toBeInTheDocument()
    })
  })

  describe('Quick Links Section', () => {
    it('should display Quick Links heading', () => {
      render(<Footer />)
      expect(screen.getByText('Quick Links')).toBeInTheDocument()
    })

    it('should have What We Do link', () => {
      render(<Footer />)
      expect(screen.getByText('What We Do')).toBeInTheDocument()
    })

    it('should have Services link', () => {
      render(<Footer />)
      expect(screen.getByText('Services')).toBeInTheDocument()
    })

    it('should have FAQ link', () => {
      render(<Footer />)
      expect(screen.getByText('FAQ')).toBeInTheDocument()
    })

    it('should have Coming Soon link', () => {
      render(<Footer />)
      expect(screen.getByText('Coming Soon')).toBeInTheDocument()
    })

    it('should call scrollToElement when What We Do is clicked', () => {
      render(<Footer />)
      const link = screen.getByText('What We Do')

      fireEvent.click(link)

      expect(mockScrollToElement).toHaveBeenCalledWith('what-we-do')
    })

    it('should call scrollToElement when Services is clicked', () => {
      render(<Footer />)
      const link = screen.getByText('Services')

      fireEvent.click(link)

      expect(mockScrollToElement).toHaveBeenCalledWith('services')
    })

    it('should call scrollToElement when FAQ is clicked', () => {
      render(<Footer />)
      const link = screen.getByText('FAQ')

      fireEvent.click(link)

      expect(mockScrollToElement).toHaveBeenCalledWith('faq')
    })

    it('should call scrollToElement when Coming Soon is clicked', () => {
      render(<Footer />)
      const link = screen.getByText('Coming Soon')

      fireEvent.click(link)

      expect(mockScrollToElement).toHaveBeenCalledWith('coming-soon')
    })
  })

  describe('Contact Section', () => {
    it('should display Contact heading', () => {
      render(<Footer />)
      expect(screen.getByText('Contact')).toBeInTheDocument()
    })

    it('should have email link', () => {
      render(<Footer />)
      const emailLink = screen.getByText('hello@automagicly.com')

      expect(emailLink).toBeInTheDocument()
      expect(emailLink.closest('a')).toHaveAttribute('href', 'mailto:hello@automagicly.com')
    })

    it('should have Schedule a Call button', () => {
      render(<Footer />)
      expect(screen.getByText('Schedule a Call')).toBeInTheDocument()
    })

    it('should call scrollToElement when Schedule a Call is clicked', () => {
      render(<Footer />)
      const link = screen.getByText('Schedule a Call')

      fireEvent.click(link)

      expect(mockScrollToElement).toHaveBeenCalledWith('booking')
    })
  })

  describe('Legal Section', () => {
    it('should have Privacy Policy link', () => {
      render(<Footer />)
      expect(screen.getByText('Privacy Policy')).toBeInTheDocument()
    })

    it('should have Terms of Service link', () => {
      render(<Footer />)
      expect(screen.getByText('Terms of Service')).toBeInTheDocument()
    })

    it('should display copyright notice', () => {
      render(<Footer />)
      const currentYear = new Date().getFullYear()
      expect(screen.getByText(new RegExp(`© ${currentYear} AutoMagicly`))).toBeInTheDocument()
    })

    it('should display All rights reserved', () => {
      render(<Footer />)
      expect(screen.getByText(/All rights reserved/)).toBeInTheDocument()
    })
  })

  describe('Styling and Structure', () => {
    it('should have proper footer tag', () => {
      render(<Footer />)
      const footer = screen.getByRole('contentinfo')
      expect(footer.tagName).toBe('FOOTER')
    })

    it('should have grid layout for links', () => {
      const { container } = render(<Footer />)
      const grid = container.querySelector('.grid')
      expect(grid).toBeInTheDocument()
    })
  })
})
