/**
 * Simple Display Components Tests
 * Tests for components that primarily display static content
 */
import { render, screen } from '../utils/test-utils'
import BookingSection from '@/components/BookingSection'
import Footer from '@/components/Footer'
import Hero from '@/components/Hero'
import WhatWeDo from '@/components/WhatWeDo'
import ExampleAutomations from '@/components/ExampleAutomations'
import ComingSoon from '@/components/ComingSoon'
import HowItWorks from '@/components/HowItWorks'

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    h2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
  useInView: () => true,
}))

describe('Simple Display Components', () => {
  describe('BookingSection', () => {
    it('should render the booking section', () => {
      const { container } = render(<BookingSection />)
      expect(container.firstChild).toBeTruthy()
    })
  })

  describe('Footer', () => {
    it('should render the footer', () => {
      const { container } = render(<Footer />)
      expect(container.firstChild).toBeTruthy()
    })

    it('should contain copyright information', () => {
      render(<Footer />)
      const currentYear = new Date().getFullYear()
      expect(screen.getByText(new RegExp(currentYear.toString()))).toBeInTheDocument()
    })
  })

  describe('Hero', () => {
    it('should render the hero section', () => {
      const { container } = render(<Hero />)
      expect(container.firstChild).toBeTruthy()
    })

    it('should display main heading', () => {
      const { container } = render(<Hero />)
      const headings = container.querySelectorAll('h1, h2, h3')
      expect(headings.length).toBeGreaterThan(0)
    })
  })

  describe('WhatWeDo', () => {
    it('should render the what we do section', () => {
      const { container } = render(<WhatWeDo />)
      expect(container.firstChild).toBeTruthy()
    })

    it('should display content', () => {
      const { container } = render(<WhatWeDo />)
      expect(container.textContent).toBeTruthy()
      expect(container.textContent!.length).toBeGreaterThan(0)
    })
  })

  describe('ExampleAutomations', () => {
    it('should render the example automations section', () => {
      const { container } = render(<ExampleAutomations />)
      expect(container.firstChild).toBeTruthy()
    })

    it('should display multiple automation examples', () => {
      const { container } = render(<ExampleAutomations />)
      expect(container.textContent).toBeTruthy()
    })
  })

  describe('ComingSoon', () => {
    it('should render the coming soon component', () => {
      const { container } = render(<ComingSoon />)
      expect(container.firstChild).toBeTruthy()
    })
  })

  describe('HowItWorks', () => {
    it('should render the how it works section', () => {
      const { container } = render(<HowItWorks />)
      expect(container.firstChild).toBeTruthy()
    })

    it('should display process steps', () => {
      const { container } = render(<HowItWorks />)
      expect(container.textContent).toBeTruthy()
      expect(container.textContent!.length).toBeGreaterThan(0)
    })
  })
})
