'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, User, Mail, Building2, CheckCircle, Zap } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { format, addDays, setHours, setMinutes, isBefore, startOfDay, isWeekend } from 'date-fns';
import 'react-day-picker/dist/style.css';
import { sendToN8N, fetchBusyDates } from '@/lib/utils';

const BOOKING_WEBHOOK = process.env.NEXT_PUBLIC_N8N_AUDIT_WEBHOOK_URL;

// Available time slots (customize these to your availability)
const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30'
];

function toAmPm(time24 : string): string {
  const [h, m] = time24.split(':');
  const date = new Date();
  date.setHours(parseInt(h), parseInt(m));

  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

// Get timezone abbreviation (e.g., "EST", "CST", "PST")
function getTimezoneAbbr(): string {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const date = new Date();
  const timeString = date.toLocaleTimeString('en-US', { timeZone: timezone, timeZoneName: 'short' });
  const match = timeString.match(/\b[A-Z]{3,4}\b/);
  return match ? match[0] : timezone;
}

interface BookingData {
  name: string;
  email: string;
  company: string;
  date: Date | undefined;
  time: string;
  notes: string;
}

export default function CustomBooking() {
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [busyDates, setBusyDates] = useState<Date[]>([]);
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(true);

  const [formData, setFormData] = useState<BookingData>({
    name: '',
    email: '',
    company: '',
    date: undefined,
    time: '',
    notes: ''
  });

  // Fetch busy dates from calendar on component mount
  useEffect(() => {
    const loadBusyDates = async () => {
      setIsLoadingCalendar(true);
      const dates = await fetchBusyDates();
      setBusyDates(dates);
      setIsLoadingCalendar(false);
    };

    loadBusyDates();
  }, []);

  // Disable past dates and busy dates from calendar
  const disabledDays = [
    { before: addDays(new Date(), 1) },
    ...busyDates // Dates when you have calendar events
  ];

  const handleDateSelect = (date: Date | undefined) => {
    setSelected(date);
    setFormData({ ...formData, date });
    if (date) {
      setStep(2);
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setFormData({ ...formData, time });
    setStep(3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Get user's timezone
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      // Create a proper datetime object with timezone
      let dateTimeISO = '';
      let dateTimeFormatted = '';

      if (selected && selectedTime) {
        // Parse the time (e.g., "09:00")
        const [hours, minutes] = selectedTime.split(':');

        // Create a date object in the user's local timezone
        const bookingDateTime = new Date(selected);
        bookingDateTime.setHours(parseInt(hours, 10));
        bookingDateTime.setMinutes(parseInt(minutes, 10));
        bookingDateTime.setSeconds(0);
        bookingDateTime.setMilliseconds(0);

        // Get ISO string (includes timezone offset)
        dateTimeISO = bookingDateTime.toISOString();

        // Also format as readable string for n8n
        dateTimeFormatted = `${format(selected, 'yyyy-MM-dd')} ${selectedTime} ${userTimezone}`;
      }

      const bookingData = {
        ...formData,
        dateTime: dateTimeFormatted,
        dateTimeISO: dateTimeISO, // Proper ISO format with timezone
        timezone: userTimezone,
        type: 'AI Audit Booking'
      };

      const success = await sendToN8N(BOOKING_WEBHOOK, bookingData);

      if (success) {
        setBookingSuccess(true);
      }
    } catch (error) {
      alert('Something went wrong. Please try again or email us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (bookingSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass p-12 rounded-3xl text-center max-w-2xl mx-auto"
      >
        <div className="w-20 h-20 bg-gradient-to-br from-success-500 to-success-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-3xl font-bold text-gray-900 mb-4">
          Booking Confirmed! 🎉
        </h3>
        <p className="text-lg text-gray-600 mb-2">
          Your AI Audit is scheduled for:
        </p>
        <div className="text-2xl font-bold gradient-text mb-2">
          {selected && format(selected, 'EEEE, MMMM d, yyyy')} at {toAmPm(selectedTime)} {getTimezoneAbbr()}
        </div>
        <p className="text-sm text-gray-500 mb-6">
          ({Intl.DateTimeFormat().resolvedOptions().timeZone})
        </p>
        <p className="text-gray-600 mb-8">
          We've sent a confirmation email to <strong>{formData.email}</strong> with calendar invite and meeting details.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="btn-secondary"
        >
          Book Another Session
        </button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Progress Steps */}
      <div className="flex justify-center items-center gap-4 mb-12">
        {[1, 2, 3].map((num) => (
          <div key={num} className="flex items-center gap-2">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                step >= num
                  ? 'bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-lg'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {num}
            </div>
            {num < 3 && (
              <div
                className={`w-12 h-1 rounded transition-all duration-300 ${
                  step > num ? 'bg-brand-500' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left: Calendar & Time Selection */}
        <div className="space-y-6">
          {/* Step 1: Date Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900">Select a Date</h3>
                <p className="text-sm text-gray-600">
                  {isLoadingCalendar ? 'Checking availability...' : 'Choose your preferred day'}
                </p>
              </div>
              {isLoadingCalendar && (
                <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
              )}
            </div>

            <style jsx global>{`
              .rdp {
                --rdp-cell-size: 48px;
                --rdp-accent-color: #0ea5e9;
                --rdp-background-color: #e0f2fe;
                margin: 0 auto;
              }
              .rdp-months {
                justify-content: center;
              }
              .rdp-day_selected {
                background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
                color: white;
                font-weight: 600;
              }
              .rdp-day:hover:not(.rdp-day_disabled) {
                background-color: #e0f2fe;
              }
              .rdp-caption {
                font-weight: 600;
                color: #0f172a;
              }
            `}</style>

            <div className="flex justify-center">
              <DayPicker
                mode="single"
                selected={selected}
                onSelect={handleDateSelect}
                disabled={disabledDays}
                modifiersClassNames={{
                  selected: 'bg-brand-500',
                }}
              />
            </div>
          </motion.div>

          {/* Step 2: Time Selection */}
          <AnimatePresence>
            {step >= 2 && selected && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="card p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-accent-600 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">Select a Time</h3>
                    <p className="text-sm text-gray-600">
                      {format(selected, 'EEEE, MMMM d')}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Your timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {TIME_SLOTS.map((time) => (
                    <button
                      key={time}
                      onClick={() => handleTimeSelect(time)}
                      className={`py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                        selectedTime === time
                          ? 'bg-gradient-to-br from-accent-500 to-accent-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {toAmPm(time)}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Contact Form */}
        <AnimatePresence>
          {step >= 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="card p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-success-500 to-success-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Your Details</h3>
                  <p className="text-sm text-gray-600">Almost there!</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-field"
                    placeholder="john@company.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Building2 className="w-4 h-4 inline mr-1" />
                    Company *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="input-field"
                    placeholder="Acme Inc"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    What's your biggest time-waster?
                  </label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="input-field"
                    placeholder="e.g., Manual invoice processing, lead follow-up..."
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Booking...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        <span>Confirm Booking</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs text-gray-500 text-center">
                  You'll receive a calendar invite at {formData.email || 'your email'}
                </p>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
