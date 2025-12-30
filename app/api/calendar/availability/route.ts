import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

// Google Calendar API configuration
const GOOGLE_CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || 'primary';
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

export async function GET(request: NextRequest) {
  console.log('Received request for calendar availability, hahahaha');
  console.log('GOOGLE_SERVICE_ACCOUNT_EMAIL:', GOOGLE_SERVICE_ACCOUNT_EMAIL ? 'Set' : 'Not set');
  console.log('GOOGLE_PRIVATE_KEY:', GOOGLE_PRIVATE_KEY ? `Set (${GOOGLE_PRIVATE_KEY.substring(0, 50)}...)` : 'Not set');
  console.log('GOOGLE_CALENDAR_ID:', GOOGLE_CALENDAR_ID);

  try {
    // Get date range from query params (default to next 60 days)
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('start') || new Date().toISOString().split('T')[0];
    const endDate = searchParams.get('end') || new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const timezone = searchParams.get('timezone') || 'UTC';

    console.log('Date range:', startDate, 'to', endDate, 'timezone:', timezone);

    // If Google Calendar credentials are not configured, return empty array
    if (!GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY) {
      console.log('❌ Google Calendar API not configured, returning no busy dates');
      return NextResponse.json({ busyDates: [] });
    }

    console.log('✅ Credentials configured, calling Google Calendar API...');

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
      timeZone: timezone,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items || [];
    console.log('📋 Google Calendar API response:', {
      totalEvents: events.length,
      calendarId: GOOGLE_CALENDAR_ID,
      hasEvents: events.length > 0
    });

    if (events.length > 0) {
      console.log('First event:', {
        summary: events[0].summary,
        start: events[0].start,
        end: events[0].end
      });
    }

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
        console.log('Added busy date:', dateOnly, 'from event:', event.summary, 'transparency:', event.transparency);
      }
    });

    // Convert Set to sorted array
    const busyDates = Array.from(busyDatesSet).sort();

    console.log('📅 Found', busyDates.length, 'busy dates:', busyDates);

    return NextResponse.json({ busyDates });

  } catch (error) {
    console.error('❌ Calendar availability API error:', error);
    // Return empty array on error so booking still works
    return NextResponse.json(
      { busyDates: [], error: 'Failed to fetch calendar availability' },
      { status: 200 } // Still return 200 so booking flow isn't broken
    );
  }
}
