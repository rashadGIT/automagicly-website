import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { bookingQuerySchema } from '@/lib/validation';
import { logger } from '@/lib/logger';

// Google Calendar API configuration
const GOOGLE_CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || 'primary';
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

export async function GET(request: NextRequest) {
  try {
    // Get date range from query params (default to next 60 days)
    const searchParams = request.nextUrl.searchParams;
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    const timezone = searchParams.get('timezone');

    // Validate query parameters
    const validation = bookingQuerySchema.safeParse({ start, end, timezone });
    if (!validation.success) {
      return NextResponse.json({
        busyDates: [],
        error: 'Invalid query parameters',
        details: validation.error.issues
      }, { status: 400 });
    }

    const startDate = start || new Date().toISOString().split('T')[0];
    const endDate = end || new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const tz = timezone || 'UTC';

    // Validate Google credentials are properly configured
    if (!GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY) {
      logger.error('Missing Google Calendar credentials', {
        path: '/api/calendar/availability',
        method: 'GET'
      });
      return NextResponse.json({
        busyDates: [],
        error: 'Calendar service not configured'
      }, { status: 500 });
    }

    // Initialize Google Calendar API with service account
    const auth = new google.auth.JWT({
      email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: GOOGLE_PRIVATE_KEY,
      scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
    });

    const calendar = google.calendar({ version: 'v3', auth });

    // Fetch events from Google Calendar
    const response = await calendar.events.list({
      calendarId: GOOGLE_CALENDAR_ID,
      timeMin: new Date(startDate + 'T00:00:00').toISOString(),
      timeMax: new Date(endDate + 'T23:59:59').toISOString(),
      timeZone: tz,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items || [];

    // Extract unique dates from events
    // Treat ALL calendar events as busy, regardless of transparency
    const busyDatesSet = new Set<string>();

    events.forEach((event) => {
      // Get event start date (handle both all-day and timed events)
      const startDate = event.start?.date || event.start?.dateTime;

      if (startDate) {
        // Convert to YYYY-MM-DD format
        const dateOnly = startDate.split('T')[0];
        busyDatesSet.add(dateOnly);
      }
    });

    // Convert Set to sorted array
    const busyDates = Array.from(busyDatesSet).sort();

    return NextResponse.json({ busyDates });

  } catch (error: any) {
    logger.error('Failed to fetch calendar availability', {
      path: '/api/calendar/availability',
      method: 'GET',
    }, error);
    // Return error status so frontend can handle gracefully
    return NextResponse.json(
      { busyDates: [], error: 'Failed to fetch calendar availability' },
      { status: 500 }
    );
  }
}
