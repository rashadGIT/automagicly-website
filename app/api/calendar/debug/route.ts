import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

export async function GET(request: NextRequest) {
  const result: any = {
    message: 'Scanning ALL accessible calendars for events...',
    serviceAccount: GOOGLE_SERVICE_ACCOUNT_EMAIL,
    calendarsFound: [],
    allEvents: [],
    recommendations: []
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

    // List all calendars this service account can access
    const calendarList = await calendar.calendarList.list();
    const calendars = calendarList.data.items || [];

    result.totalCalendarsAccessible = calendars.length;

    // For each calendar, try to fetch events
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 90); // Next 90 days

    for (const cal of calendars) {
      const calendarInfo: any = {
        id: cal.id,
        summary: cal.summary,
        primary: cal.primary,
        accessRole: cal.accessRole,
        backgroundColor: cal.backgroundColor,
        events: []
      };

      try {
        const eventsResponse = await calendar.events.list({
          calendarId: cal.id!,
          timeMin: now.toISOString(),
          timeMax: futureDate.toISOString(),
          singleEvents: true,
          orderBy: 'startTime',
          maxResults: 100
        });

        const events = eventsResponse.data.items || [];
        calendarInfo.eventCount = events.length;

        // Add detailed event info
        calendarInfo.events = events.map(event => ({
          summary: event.summary,
          description: event.description?.substring(0, 100),
          start: event.start?.dateTime || event.start?.date,
          end: event.end?.dateTime || event.end?.date,
          status: event.status,
          location: event.location
        }));

        // Add all events to master list
        events.forEach(event => {
          result.allEvents.push({
            calendar: cal.summary,
            calendarId: cal.id,
            summary: event.summary,
            start: event.start?.dateTime || event.start?.date,
            end: event.end?.dateTime || event.end?.date,
            location: event.location
          });
        });

      } catch (error: any) {
        calendarInfo.error = error.message;
        calendarInfo.eventCount = 0;
      }

      result.calendarsFound.push(calendarInfo);
    }

    // Generate recommendations
    if (calendars.length === 0) {
      result.recommendations.push('⚠️ No calendars accessible! You need to share your Google Calendar with: ' + GOOGLE_SERVICE_ACCOUNT_EMAIL);
      result.recommendations.push('📝 Go to Google Calendar → Settings → Share with specific people → Add the service account email above');
    } else {
      const calendarsWithEvents = result.calendarsFound.filter((c: any) => c.eventCount > 0);

      if (calendarsWithEvents.length === 0) {
        result.recommendations.push('⚠️ No events found in any accessible calendar');
        result.recommendations.push('💡 Make sure you have events in the next 90 days');
      } else {
        result.recommendations.push(`✅ Found ${result.allEvents.length} events across ${calendarsWithEvents.length} calendar(s)`);

        // Suggest which calendar to use
        calendarsWithEvents.forEach((cal: any) => {
          result.recommendations.push(`📅 Use calendar ID: "${cal.id}" (${cal.eventCount} events)`);
        });
      }
    }

    // Sort events by date
    result.allEvents.sort((a: any, b: any) => {
      const dateA = new Date(a.start);
      const dateB = new Date(b.start);
      return dateA.getTime() - dateB.getTime();
    });

    result.summary = {
      totalCalendars: calendars.length,
      totalEvents: result.allEvents.length,
      dateRange: `${now.toISOString().split('T')[0]} to ${futureDate.toISOString().split('T')[0]}`
    };

    return NextResponse.json(result, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
}
