import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

// Google Calendar API configuration
const GOOGLE_CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || 'primary';
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

export async function GET(request: NextRequest) {
  const result: any = {
    status: 'Testing Google Calendar API connection...',
    checks: {},
    errors: []
  };

  try {
    // Check 1: Credentials configured
    result.checks.credentialsConfigured = {
      serviceAccountEmail: !!GOOGLE_SERVICE_ACCOUNT_EMAIL,
      privateKey: !!GOOGLE_PRIVATE_KEY,
      calendarId: GOOGLE_CALENDAR_ID
    };

    if (!GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY) {
      result.status = 'FAILED';
      result.errors.push('Google Calendar credentials not configured in .env.local');
      return NextResponse.json(result, { status: 500 });
    }

    result.serviceAccountEmail = GOOGLE_SERVICE_ACCOUNT_EMAIL;

    // Check 2: Can authenticate
    const auth = new google.auth.JWT({
      email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: GOOGLE_PRIVATE_KEY,
      scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
    });

    const calendar = google.calendar({ version: 'v3', auth });
    result.checks.authenticationSuccess = true;

    // Check 3: List calendars the service account can access
    try {
      const calendarList = await calendar.calendarList.list();
      result.checks.accessibleCalendars = {
        count: calendarList.data.items?.length || 0,
        calendars: calendarList.data.items?.map(cal => ({
          id: cal.id,
          summary: cal.summary,
          primary: cal.primary,
          accessRole: cal.accessRole
        })) || []
      };
    } catch (error: any) {
      result.errors.push(`Failed to list calendars: ${error.message}`);
    }

    // Check 4: Try to access the specific calendar
    try {
      const calendarResponse = await calendar.calendars.get({
        calendarId: GOOGLE_CALENDAR_ID
      });

      result.checks.targetCalendarAccess = {
        success: true,
        id: calendarResponse.data.id,
        summary: calendarResponse.data.summary,
        timeZone: calendarResponse.data.timeZone
      };
    } catch (error: any) {
      result.checks.targetCalendarAccess = {
        success: false,
        error: error.message
      };
      result.errors.push(`Cannot access calendar '${GOOGLE_CALENDAR_ID}': ${error.message}`);
    }

    // Check 5: Try to fetch events
    try {
      const now = new Date();
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);

      const eventsResponse = await calendar.events.list({
        calendarId: GOOGLE_CALENDAR_ID,
        timeMin: now.toISOString(),
        timeMax: futureDate.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: 10
      });

      result.checks.eventsQuery = {
        success: true,
        eventCount: eventsResponse.data.items?.length || 0,
        sampleEvents: eventsResponse.data.items?.slice(0, 3).map(event => ({
          summary: event.summary,
          start: event.start?.dateTime || event.start?.date,
          end: event.end?.dateTime || event.end?.date
        })) || []
      };
    } catch (error: any) {
      result.checks.eventsQuery = {
        success: false,
        error: error.message
      };
      result.errors.push(`Failed to fetch events: ${error.message}`);
    }

    // Final status
    if (result.errors.length === 0) {
      result.status = 'SUCCESS - Google Calendar API is working!';
    } else {
      result.status = 'PARTIAL - Some checks failed';
    }

    return NextResponse.json(result, { status: 200 });

  } catch (error: any) {
    result.status = 'FAILED';
    result.errors.push(`Unexpected error: ${error.message}`);
    return NextResponse.json(result, { status: 500 });
  }
}
