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
      scopes: [
        'https://www.googleapis.com/auth/calendar.readonly',
        'https://www.googleapis.com/auth/calendar.calendars.readonly'
      ],
    });

    const calendar = google.calendar({ version: 'v3', auth });

    // Method 1: Get calendar list
    let calendarListResults: any[] = [];
    try {
      const listResponse = await calendar.calendarList.list();
      calendarListResults = listResponse.data.items?.map(cal => ({
        id: cal.id,
        summary: cal.summary,
        description: cal.description,
        primary: cal.primary,
        accessRole: cal.accessRole,
        backgroundColor: cal.backgroundColor
      })) || [];
    } catch (error: any) {
      console.error('CalendarList API error:', error.message);
    }

    // Method 2: Try accessing calendars owned by the user's email
    // Extract domain from service account email
    const userEmail = 'rashad.barnett@gmail.com'; // The email that owns the calendars

    const commonCalendarPatterns = [
      userEmail,
      'primary',
      `${userEmail.split('@')[0]}@group.calendar.google.com`,
      'automagicly@group.calendar.google.com',
    ];

    const accessibleCalendars: any[] = [];

    for (const calId of commonCalendarPatterns) {
      try {
        const testResponse = await calendar.calendars.get({
          calendarId: calId
        });

        accessibleCalendars.push({
          id: calId,
          summary: testResponse.data.summary,
          description: testResponse.data.description,
          timeZone: testResponse.data.timeZone,
          accessible: true
        });
      } catch (error: any) {
        // Calendar not accessible
      }
    }

    return NextResponse.json({
      message: 'Listing all calendars the service account can access',
      serviceAccount: GOOGLE_SERVICE_ACCOUNT_EMAIL,
      calendarListAPI: {
        count: calendarListResults.length,
        calendars: calendarListResults
      },
      directAccess: {
        count: accessibleCalendars.length,
        calendars: accessibleCalendars
      },
      instructions: [
        '📋 Calendar IDs found above',
        '🔧 To use a calendar, update .env.local:',
        '   GOOGLE_CALENDAR_ID=the-calendar-id-from-above',
        '',
        '⚠️ If no calendars found, you need to:',
        '   1. Go to Google Calendar settings',
        '   2. Find your "automagicly" calendar',
        '   3. Share it with: ' + GOOGLE_SERVICE_ACCOUNT_EMAIL,
        '   4. Give permission: "See all event details"',
      ]
    });

  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
