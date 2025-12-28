import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

const GOOGLE_CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || 'primary';
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

export async function GET(request: NextRequest) {
  const result: any = {
    message: 'Checking if private events are visible...',
    calendarId: GOOGLE_CALENDAR_ID,
    events: [],
    privateEventStats: {
      total: 0,
      public: 0,
      private: 0,
      default: 0
    }
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

    // Fetch all events in the next 90 days
    const now = new Date();
    const future = new Date();
    future.setDate(future.getDate() + 90);

    const eventsResponse = await calendar.events.list({
      calendarId: GOOGLE_CALENDAR_ID,
      timeMin: now.toISOString(),
      timeMax: future.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 100
    });

    const events = eventsResponse.data.items || [];

    result.events = events.map(event => ({
      summary: event.summary,
      start: event.start?.dateTime || event.start?.date,
      visibility: event.visibility || 'default',
      // Private events have their details hidden
      isPrivate: event.visibility === 'private',
      location: event.location,
      description: event.description?.substring(0, 50)
    }));

    // Count visibility types
    events.forEach(event => {
      result.privateEventStats.total++;
      const visibility = event.visibility || 'default';

      if (visibility === 'private') {
        result.privateEventStats.private++;
      } else if (visibility === 'public') {
        result.privateEventStats.public++;
      } else {
        result.privateEventStats.default++;
      }
    });

    // Generate recommendations
    result.recommendations = [];

    if (result.privateEventStats.total === 0) {
      result.recommendations.push('⚠️ No events found in the next 90 days');
    } else {
      result.recommendations.push(`✅ Found ${result.privateEventStats.total} total events`);

      if (result.privateEventStats.private > 0) {
        result.recommendations.push(`🔒 ${result.privateEventStats.private} private events are VISIBLE to the service account`);
        result.recommendations.push('✅ Private events will be blocked in the booking calendar');
      } else {
        result.recommendations.push('📝 No events marked as "private" found');
        result.recommendations.push('💡 To test: Create an event and set visibility to "Only me"');
      }

      if (result.privateEventStats.default > 0) {
        result.recommendations.push(`📅 ${result.privateEventStats.default} events with default visibility`);
      }

      if (result.privateEventStats.public > 0) {
        result.recommendations.push(`🌍 ${result.privateEventStats.public} public events`);
      }
    }

    // Check the sharing permission level
    try {
      const aclResponse = await calendar.acl.list({
        calendarId: GOOGLE_CALENDAR_ID
      });

      const serviceAccountAcl = aclResponse.data.items?.find(
        acl => acl.scope?.value === GOOGLE_SERVICE_ACCOUNT_EMAIL
      );

      if (serviceAccountAcl) {
        result.sharingPermission = {
          role: serviceAccountAcl.role,
          scope: serviceAccountAcl.scope
        };

        if (serviceAccountAcl.role === 'reader') {
          result.recommendations.push('✅ Service account has "See all event details" permission');
          result.recommendations.push('✅ Can see private events, event details, and all information');
        } else if (serviceAccountAcl.role === 'freeBusyReader') {
          result.recommendations.push('⚠️ Service account only has "See only free/busy" permission');
          result.recommendations.push('❌ Cannot see event details or private events');
          result.recommendations.push('📝 Update sharing to "See all event details" to see private events');
        }
      } else {
        result.recommendations.push('⚠️ Could not verify sharing permissions');
      }
    } catch (error: any) {
      result.aclError = error.message;
    }

    return NextResponse.json(result, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
