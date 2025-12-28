import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

const GOOGLE_CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || 'primary';
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

export async function POST(request: NextRequest) {
  try {
    if (!GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY) {
      return NextResponse.json({ error: 'Credentials not configured' }, { status: 500 });
    }

    // Initialize with WRITE permissions
    const auth = new google.auth.JWT({
      email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: GOOGLE_PRIVATE_KEY,
      scopes: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events'
      ],
    });

    const calendar = google.calendar({ version: 'v3', auth });

    // Create a test private event tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    const event = {
      summary: '🔒 TEST PRIVATE EVENT (Created by API)',
      description: 'This event was created via API to test private event visibility. You can delete this after testing.',
      start: {
        date: dateStr, // All-day event
      },
      end: {
        date: dateStr,
      },
      visibility: 'private', // This is the key setting!
      colorId: '11', // Red color to make it stand out
    };

    console.log('Creating test private event:', event);

    const response = await calendar.events.insert({
      calendarId: GOOGLE_CALENDAR_ID,
      requestBody: event,
    });

    return NextResponse.json({
      success: true,
      message: 'Test private event created successfully!',
      event: {
        id: response.data.id,
        summary: response.data.summary,
        visibility: response.data.visibility,
        date: dateStr,
        htmlLink: response.data.htmlLink,
      },
      instructions: [
        '✅ A private event was created for tomorrow',
        '🔍 Check Google Calendar - you should see it in red',
        '🧪 Run: curl -s http://localhost:3000/api/calendar/check-private | python3 -m json.tool',
        '📊 Visit: http://localhost:3000/calendar-diagnostic',
        '🗑️ You can delete this test event after verifying',
      ]
    });

  } catch (error: any) {
    console.error('Error creating test event:', error);

    // Check if it's a permission error
    if (error.message?.includes('403') || error.message?.includes('Forbidden')) {
      return NextResponse.json({
        error: 'Permission denied',
        message: 'Service account does not have permission to CREATE events',
        details: error.message,
        solution: [
          '📝 The service account only has READ permission',
          '🔧 To create events via API, you need to:',
          '   1. Go to Google Calendar settings',
          '   2. Find the service account in sharing settings',
          '   3. Change permission from "See all event details" to "Make changes to events"',
          '',
          '⚠️ For security, you might NOT want to do this',
          '💡 Instead, manually create a private event in Google Calendar web interface',
        ]
      }, { status: 403 });
    }

    return NextResponse.json({
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}

// GET endpoint to check if we have write permissions
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Use POST to create a test private event',
    instructions: 'curl -X POST http://localhost:3000/api/calendar/create-test-private',
    note: 'This requires the service account to have "Make changes to events" permission'
  });
}
