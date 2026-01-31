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
    // Return mock data in CI/test environments to avoid Google API calls
    if (process.env.CI === 'true' || process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL === 'test@test.iam.gserviceaccount.com') {
      // Return some mock busy dates for realistic E2E testing
      return NextResponse.json({
        busyDates: ['2026-01-10', '2026-01-11', '2026-01-12']
      });
    }

    // Get date range from query params (default to next 60 days)
    const searchParams = request.nextUrl.searchParams;
    const start = searchParams.get('start') ?? undefined;
    const end = searchParams.get('end') ?? undefined;
    const timezone = searchParams.get('timezone') ?? undefined;

    // Validate query parameters
    const validation = bookingQuerySchema.safeParse({ start, end, timezone });
    if (!validation.success) {
      return NextResponse.json({
        busyDates: [],
        error: 'Invalid query parameters',
        details: validation.error.issues
      }, { status: 400 });
    }

    const tz = timezone || 'America/New_York';

    // Get current date in the user's timezone by using toLocaleString with dateStyle
    // This properly handles timezone conversion
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    const todayInUserTz = formatter.format(new Date()); // Returns YYYY-MM-DD format

    const startDate = start || todayInUserTz;

    // Calculate end date (60 days from start in user's timezone)
    const startDateObj = new Date(startDate + 'T00:00:00');
    const endDateObj = new Date(startDateObj.getTime() + 60 * 24 * 60 * 60 * 1000);
    const endDate = end || formatter.format(endDateObj);

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
