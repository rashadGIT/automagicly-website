import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const testCalendarId = searchParams.get('calendarId') || 'primary';

  const result: any = {
    message: `Testing calendar access with ID: "${testCalendarId}"`,
    calendarId: testCalendarId,
    serviceAccount: GOOGLE_SERVICE_ACCOUNT_EMAIL,
    tests: {}
  };

  try {
    if (!GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY) {
      return NextResponse.json({ error: 'Credentials not configured' }, { status: 500 });
    }

    const auth = new google.auth.JWT({
      email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: GOOGLE_PRIVATE_KEY,
      scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
    });

    const calendar = google.calendar({ version: 'v3', auth });

    // Test 1: Can we get calendar metadata?
    try {
      const calendarResponse = await calendar.calendars.get({
        calendarId: testCalendarId
      });

      result.tests.calendarAccess = {
        success: true,
        id: calendarResponse.data.id,
        summary: calendarResponse.data.summary,
        description: calendarResponse.data.description,
        timeZone: calendarResponse.data.timeZone
      };
    } catch (error: any) {
      result.tests.calendarAccess = {
        success: false,
        error: error.message,
        code: error.code
      };
    }

    // Test 2: Can we list events?
    try {
      const now = new Date();
      const future = new Date();
      future.setDate(future.getDate() + 90);

      const eventsResponse = await calendar.events.list({
        calendarId: testCalendarId,
        timeMin: now.toISOString(),
        timeMax: future.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: 20
      });

      const events = eventsResponse.data.items || [];

      result.tests.eventsAccess = {
        success: true,
        eventCount: events.length,
        events: events.map(event => ({
          summary: event.summary,
          start: event.start?.dateTime || event.start?.date,
          end: event.end?.dateTime || event.end?.date,
          location: event.location,
          status: event.status
        }))
      };

      // Extract unique dates
      const busyDates = new Set<string>();
      events.forEach(event => {
        const startDate = event.start?.date || event.start?.dateTime;
        if (startDate) {
          busyDates.add(startDate.split('T')[0]);
        }
      });

      result.busyDates = Array.from(busyDates).sort();

    } catch (error: any) {
      result.tests.eventsAccess = {
        success: false,
        error: error.message,
        code: error.code
      };
    }

    // Generate recommendations
    result.recommendations = [];

    if (!result.tests.calendarAccess?.success) {
      if (result.tests.calendarAccess?.code === 404) {
        result.recommendations.push(`❌ Calendar "${testCalendarId}" not found or not accessible`);
        result.recommendations.push('💡 Try using your Gmail address instead (e.g., yourname@gmail.com)');
      } else if (result.tests.calendarAccess?.code === 403) {
        result.recommendations.push(`❌ Access forbidden to calendar "${testCalendarId}"`);
        result.recommendations.push(`📝 Make sure you shared this calendar with: ${GOOGLE_SERVICE_ACCOUNT_EMAIL}`);
        result.recommendations.push('📝 Permission must be "See all event details" (not "See only free/busy")');
      } else {
        result.recommendations.push(`❌ Error accessing calendar: ${result.tests.calendarAccess?.error}`);
      }
    } else if (result.tests.eventsAccess?.success && result.tests.eventsAccess.eventCount === 0) {
      result.recommendations.push('⚠️ Calendar is accessible but has no events in the next 90 days');
      result.recommendations.push('💡 Add some test events to verify blocking works');
    } else if (result.tests.eventsAccess?.success && result.tests.eventsAccess.eventCount > 0) {
      result.recommendations.push(`✅ SUCCESS! Found ${result.tests.eventsAccess.eventCount} events`);
      result.recommendations.push(`✅ Update your .env.local: GOOGLE_CALENDAR_ID=${testCalendarId}`);
      result.recommendations.push(`📅 Busy dates that will be blocked: ${result.busyDates.join(', ')}`);
    }

    return NextResponse.json(result, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
