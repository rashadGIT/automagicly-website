import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

export async function GET(request: NextRequest) {
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

    // Common calendar ID patterns to try
    const possibleCalendarIds = [
      'automagicly',
      'automagicly@gmail.com',
      'rashad.barnett@gmail.com',
      'primary',
      // Calendar IDs often end with @group.calendar.google.com
      'automagicly@group.calendar.google.com',
    ];

    const results: any[] = [];

    for (const calendarId of possibleCalendarIds) {
      try {
        console.log(`Trying calendar ID: ${calendarId}`);

        const eventsResponse = await calendar.events.list({
          calendarId: calendarId,
          timeMin: new Date().toISOString(),
          timeMax: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          maxResults: 5,
          singleEvents: true,
        });

        // If we get here without error, this calendar ID works!
        results.push({
          calendarId: calendarId,
          status: 'accessible',
          eventCount: eventsResponse.data.items?.length || 0,
          summary: eventsResponse.data.summary || 'Unknown',
          events: eventsResponse.data.items?.map(e => ({
            summary: e.summary,
            start: e.start?.dateTime || e.start?.date
          }))
        });

      } catch (error: any) {
        results.push({
          calendarId: calendarId,
          status: 'not accessible',
          error: error.message
        });
      }
    }

    // Try to get calendar list (might be empty but worth checking)
    let calendarList: any[] = [];
    try {
      const listResponse = await calendar.calendarList.list();
      calendarList = listResponse.data.items?.map(cal => ({
        id: cal.id,
        summary: cal.summary,
        description: cal.description,
        primary: cal.primary,
        accessRole: cal.accessRole
      })) || [];
    } catch (error: any) {
      console.error('Could not list calendars:', error.message);
    }

    const accessibleCalendars = results.filter(r => r.status === 'accessible');

    return NextResponse.json({
      message: 'Searching for "automagicly" calendar...',
      accessibleCalendars,
      allAttempts: results,
      calendarList,
      recommendations: accessibleCalendars.length > 0 ? [
        `✅ Found ${accessibleCalendars.length} accessible calendar(s)`,
        accessibleCalendars.map(cal =>
          `📅 Use this calendar ID: "${cal.calendarId}" (${cal.eventCount} events)`
        ).join('\n'),
      ] : [
        '❌ No calendars found with "automagicly" in the ID',
        '💡 Your "automagicly" calendar might be a secondary calendar',
        '📝 To find the calendar ID:',
        '   1. Go to Google Calendar settings',
        '   2. Click on the "automagicly" calendar in the left sidebar',
        '   3. Scroll down to "Integrate calendar"',
        '   4. Copy the "Calendar ID"',
        '   5. Share that calendar with: ' + GOOGLE_SERVICE_ACCOUNT_EMAIL,
      ]
    });

  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
