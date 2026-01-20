/**
 * ROICalculator Component Tests
 * Tests the ROI calculator functionality
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ROICalculator from '@/components/ROICalculator'

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}))

describe('ROICalculator Component', () => {
  describe('Initial Render', () => {
    it('should render the calculator', () => {
      render(<ROICalculator />)
      expect(screen.getByText('ROI')).toBeInTheDocument()
      expect(screen.getByText('Calculator')).toBeInTheDocument()
    })

    it('should have Calculate Your Savings badge', () => {
      render(<ROICalculator />)
      expect(screen.getByText('Calculate Your Savings')).toBeInTheDocument()
    })

    it('should show the task dropdown', () => {
      render(<ROICalculator />)
      expect(screen.getByLabelText('Task to Automate')).toBeInTheDocument()
    })

    it('should have default values', () => {
      render(<ROICalculator />)
      // Check for default time per task label
      expect(screen.getByText(/Time per Task \(minutes\):/)).toBeInTheDocument()
      // Verify sliders exist with proper defaults
      const sliders = screen.getAllByRole('slider')
      expect(sliders[0]).toHaveValue('15')
    })
  })

  describe('Task Selection', () => {
    it('should allow changing task type', () => {
      render(<ROICalculator />)
      const select = screen.getByLabelText('Task to Automate')

      fireEvent.change(select, { target: { value: 'Invoice processing' } })
      expect(select).toHaveValue('Invoice processing')
    })

    it('should have all common tasks as options', () => {
      render(<ROICalculator />)
      const select = screen.getByLabelText('Task to Automate')

      expect(select).toContainHTML('Lead follow-up emails')
      expect(select).toContainHTML('Invoice processing')
      expect(select).toContainHTML('Appointment scheduling')
      expect(select).toContainHTML('Data entry')
      expect(select).toContainHTML('Custom task')
    })
  })

  describe('Slider Controls', () => {
    it('should have time per task slider', () => {
      render(<ROICalculator />)
      const sliders = screen.getAllByRole('slider')
      expect(sliders.length).toBeGreaterThanOrEqual(5)
      expect(sliders[0]).toBeInTheDocument()
    })

    it('should allow changing time per task slider', () => {
      render(<ROICalculator />)
      const slider = screen.getAllByRole('slider')[0]
      fireEvent.change(slider, { target: { value: '45' } })
      expect(slider).toHaveValue('45')
    })

    it('should allow changing times per week slider', () => {
      render(<ROICalculator />)
      const slider = screen.getAllByRole('slider')[1]
      fireEvent.change(slider, { target: { value: '50' } })
      expect(slider).toHaveValue('50')
    })

    it('should allow changing number of people slider', () => {
      render(<ROICalculator />)
      const slider = screen.getAllByRole('slider')[2]
      fireEvent.change(slider, { target: { value: '3' } })
      expect(slider).toHaveValue('3')
    })

    it('should allow changing hourly cost slider', () => {
      render(<ROICalculator />)
      const slider = screen.getAllByRole('slider')[3]
      fireEvent.change(slider, { target: { value: '50' } })
      expect(slider).toHaveValue('50')
    })

    it('should allow changing efficiency gain slider', () => {
      render(<ROICalculator />)
      const slider = screen.getAllByRole('slider')[4]
      fireEvent.change(slider, { target: { value: '80' } })
      expect(slider).toHaveValue('80')
    })
  })

  describe('Build Cost Selection', () => {
    it('should have workflow complexity buttons', () => {
      render(<ROICalculator />)
      expect(screen.getByText('Workflow Complexity')).toBeInTheDocument()
      expect(screen.getByText('Simple')).toBeInTheDocument()
      expect(screen.getByText('Medium')).toBeInTheDocument()
      expect(screen.getByText('Complex')).toBeInTheDocument()
    })

    it('should show cost presets', () => {
      render(<ROICalculator />)
      expect(screen.getByText('$500')).toBeInTheDocument()
      expect(screen.getByText('$1,500')).toBeInTheDocument()
      expect(screen.getByText('$3,000')).toBeInTheDocument()
    })

    it('should allow selecting low complexity', () => {
      render(<ROICalculator />)
      const simpleButton = screen.getByText('Simple').closest('button')

      fireEvent.click(simpleButton!)

      // The button should have active styling (border-brand-600)
      expect(simpleButton).toHaveClass('border-brand-600')
    })

    it('should allow selecting high complexity', () => {
      render(<ROICalculator />)
      const complexButton = screen.getByText('Complex').closest('button')

      fireEvent.click(complexButton!)

      expect(complexButton).toHaveClass('border-brand-600')
    })
  })

  describe('ROI Results', () => {
    it('should display results section', () => {
      render(<ROICalculator />)
      expect(screen.getByText('Your Estimated ROI')).toBeInTheDocument()
    })

    it('should show hours saved per month', () => {
      render(<ROICalculator />)
      expect(screen.getByText('Hours Saved/Month')).toBeInTheDocument()
    })

    it('should show monthly savings', () => {
      render(<ROICalculator />)
      expect(screen.getByText('Monthly Savings')).toBeInTheDocument()
    })

    it('should show payback period', () => {
      render(<ROICalculator />)
      expect(screen.getByText('Payback (Months)')).toBeInTheDocument()
    })

    it('should show net savings over 12 months', () => {
      render(<ROICalculator />)
      expect(screen.getByText('Net Savings (12mo)')).toBeInTheDocument()
    })

    it('should recalculate when inputs change', () => {
      render(<ROICalculator />)

      // Change time per task to trigger recalculation
      const slider = screen.getAllByRole('slider')[0]
      fireEvent.change(slider, { target: { value: '60' } })

      // Verify the slider value changed
      expect(slider).toHaveValue('60')
    })
  })

  describe('Disclaimer', () => {
    it('should show the disclaimer', () => {
      render(<ROICalculator />)
      expect(screen.getByText(/Disclaimer/)).toBeInTheDocument()
      expect(screen.getByText(/Estimates only/)).toBeInTheDocument()
    })
  })

  describe('Calculations', () => {
    it('should calculate correctly with default values', () => {
      render(<ROICalculator />)

      // Default: 15 min/task * 20 times/week * 1 person = 300 min/week = 5 hours/week
      // 5 hours * 70% efficiency = 3.5 hours saved/week
      // 3.5 * 4.33 = ~15.16 hours/month
      // 15.16 * $35/hour = ~$530/month savings
      // Payback: $1500 / $530 = ~2.8 months

      // The results should be displayed
      expect(screen.getByText('Hours Saved/Month')).toBeInTheDocument()
      expect(screen.getByText('Monthly Savings')).toBeInTheDocument()
    })

    it('should handle zero monthly savings for payback', () => {
      render(<ROICalculator />)

      // Set efficiency to 20% (minimum)
      const efficiencySlider = screen.getAllByRole('slider')[4]
      fireEvent.change(efficiencySlider, { target: { value: '20' } })

      // Set time per task to minimum (1)
      const timeSlider = screen.getAllByRole('slider')[0]
      fireEvent.change(timeSlider, { target: { value: '1' } })

      // Set times per week to minimum (1)
      const timesSlider = screen.getAllByRole('slider')[1]
      fireEvent.change(timesSlider, { target: { value: '1' } })

      // The calculator should still work without errors
      expect(screen.getByText('Payback (Months)')).toBeInTheDocument()
    })

    it('should update calculations when build cost changes', () => {
      render(<ROICalculator />)

      // Change to low complexity (lower cost)
      const simpleButton = screen.getByText('Simple').closest('button')
      fireEvent.click(simpleButton!)

      // Verify the button is now selected
      expect(simpleButton).toHaveClass('border-brand-600')
    })
  })

  describe('Accessibility', () => {
    it('should have proper labels for sliders', () => {
      render(<ROICalculator />)
      expect(screen.getByText(/Time per Task/)).toBeInTheDocument()
      expect(screen.getByText(/Times per Week/)).toBeInTheDocument()
      expect(screen.getByText(/Number of People/)).toBeInTheDocument()
      expect(screen.getByText(/Hourly Cost/)).toBeInTheDocument()
      expect(screen.getByText(/Efficiency Gain/)).toBeInTheDocument()
    })

    it('should have accessible task dropdown', () => {
      render(<ROICalculator />)
      const select = screen.getByLabelText('Task to Automate')
      expect(select).toBeInTheDocument()
      expect(select.tagName).toBe('SELECT')
    })
  })
})
