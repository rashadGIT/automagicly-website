import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

const GOOGLE_CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || 'primary';
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
        'https://www.googleapis.com/auth/calendar.events.readonly'
      ],
    });

    const calendar = google.calendar({ version: 'v3', auth });

    // Fetch all events in the next 90 days
    const now = new Date();
    const future = new Date();
    future.setDate(future.getDate() + 90);

    console.log('Fetching events from', now.toISOString(), 'to', future.toISOString());

    const eventsResponse = await calendar.events.list({
      calendarId: GOOGLE_CALENDAR_ID,
      timeMin: now.toISOString(),
      timeMax: future.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 100,
      // Request ALL fields
      fields: '*'
    });

    const events = eventsResponse.data.items || [];

    const result = {
      message: 'Raw event data including ALL fields',
      calendarId: GOOGLE_CALENDAR_ID,
      totalEvents: events.length,
      events: events.map(event => ({
        id: event.id,
        summary: event.summary,
        description: event.description?.substring(0, 100),
        start: event.start,
        end: event.end,

        // VISIBILITY FIELDS - THE KEY ONES
        visibility: event.visibility,
        privateCopy: event.privateCopy,

        // Other relevant fields
        status: event.status,
        transparency: event.transparency,
        location: event.location,
        creator: event.creator,
        organizer: event.organizer,

        // Access control
        guestsCanSeeOtherGuests: event.guestsCanSeeOtherGuests,

        // All raw data for debugging
        rawEvent: event
      })),

      visibilityBreakdown: {
        private: events.filter(e => e.visibility === 'private').length,
        public: events.filter(e => e.visibility === 'public').length,
        default: events.filter(e => !e.visibility || e.visibility === 'default').length,
        confidential: events.filter(e => e.visibility === 'confidential').length,
      },

      instructions: [
        '🔍 Check the "visibility" field for each event',
        '🔒 Private events should have visibility: "private"',
        '📋 If all events show visibility: null or "default", then:',
        '   1. The events are not marked as private in Google Calendar, OR',
        '   2. The service account doesn\'t have permission to see the visibility flag',
        '',
        '🛠️ To test: Create a new event and set "Visibility" to "Private" in Google Calendar'
      ]
    };

    return NextResponse.json(result, {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error: any) {
    console.error('Error fetching raw events:', error);
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
      details: error.response?.data || 'No additional details'
    }, { status: 500 });
  }
}
