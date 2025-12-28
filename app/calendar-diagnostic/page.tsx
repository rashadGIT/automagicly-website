'use client';

import { useState, useEffect } from 'react';

export default function CalendarDiagnostic() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/calendar/raw-events')
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Checking your calendar events...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">❌ Error Loading Calendar</h1>
          <p className="text-gray-700">Failed to fetch calendar data. Check your API credentials.</p>
        </div>
      </div>
    );
  }

  const { visibilityBreakdown, events, totalEvents } = data;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📅 Calendar Event Diagnostic</h1>
          <p className="text-gray-600">Calendar ID: <code className="bg-gray-100 px-2 py-1 rounded">{data.calendarId}</code></p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-blue-600">{totalEvents}</div>
            <div className="text-sm text-gray-600 mt-1">Total Events</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-red-600">{visibilityBreakdown.private}</div>
            <div className="text-sm text-gray-600 mt-1">🔒 Private Events</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-green-600">{visibilityBreakdown.public}</div>
            <div className="text-sm text-gray-600 mt-1">🌍 Public Events</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-gray-600">{visibilityBreakdown.default}</div>
            <div className="text-sm text-gray-600 mt-1">📋 Default Events</div>
          </div>
        </div>

        {/* Alert if no private events */}
        {visibilityBreakdown.private === 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <span className="text-2xl">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-bold text-yellow-800">No Private Events Found</h3>
                <p className="text-yellow-700 mt-2">
                  Your calendar events are not marked as "private". To block dates for private events:
                </p>
                <ol className="list-decimal list-inside mt-3 space-y-1 text-yellow-700">
                  <li>Open Google Calendar</li>
                  <li>Click on an event (or create a new one)</li>
                  <li>Click "Edit" → "More options"</li>
                  <li>Scroll down to the <strong>"Visibility"</strong> dropdown</li>
                  <li>Select <strong>"Private"</strong></li>
                  <li>Save the event</li>
                  <li>Refresh this page to verify</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* Success message if private events found */}
        {visibilityBreakdown.private > 0 && (
          <div className="bg-green-50 border-l-4 border-green-400 p-6 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-bold text-green-800">Private Events Detected!</h3>
                <p className="text-green-700 mt-2">
                  Found {visibilityBreakdown.private} private event(s). These dates will be blocked in your booking calendar.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Events List */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Event Details</h2>
          {events.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No events found in the next 90 days</p>
          ) : (
            <div className="space-y-4">
              {events.map((event: any, idx: number) => (
                <div
                  key={idx}
                  className={`border rounded-lg p-4 ${
                    event.visibility === 'private'
                      ? 'border-red-300 bg-red-50'
                      : event.visibility === 'public'
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-300 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{event.summary || 'Untitled Event'}</h3>
                        {event.visibility === 'private' && (
                          <span className="bg-red-600 text-white text-xs px-3 py-1 rounded-full font-semibold">
                            🔒 PRIVATE
                          </span>
                        )}
                        {event.visibility === 'public' && (
                          <span className="bg-green-600 text-white text-xs px-3 py-1 rounded-full font-semibold">
                            🌍 PUBLIC
                          </span>
                        )}
                        {(!event.visibility || event.visibility === 'default') && (
                          <span className="bg-gray-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
                            📋 DEFAULT
                          </span>
                        )}
                      </div>
                      <div className="space-y-1 text-sm text-gray-700">
                        <div>
                          <strong>Start:</strong>{' '}
                          {event.start?.dateTime || event.start?.date || 'N/A'}
                        </div>
                        {event.location && (
                          <div>
                            <strong>Location:</strong> {event.location}
                          </div>
                        )}
                        {event.description && (
                          <div>
                            <strong>Description:</strong> {event.description}...
                          </div>
                        )}
                        <div className="mt-2 pt-2 border-t">
                          <strong>Visibility Field:</strong>{' '}
                          <code className="bg-gray-100 px-2 py-1 rounded">
                            {event.visibility || 'null (default)'}
                          </code>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-3">📖 How to Interpret Results</h3>
          <ul className="space-y-2 text-blue-800">
            <li>🔒 <strong>Private:</strong> Event will be blocked in booking calendar ✅</li>
            <li>🌍 <strong>Public:</strong> Event is visible to everyone (also blocked in booking)</li>
            <li>📋 <strong>Default:</strong> Uses calendar default visibility (also blocked in booking)</li>
          </ul>
          <div className="mt-4 p-4 bg-blue-100 rounded">
            <p className="text-sm text-blue-900">
              <strong>Note:</strong> ALL events (private, public, and default) will block dates in your booking calendar.
              The "private" setting mainly affects whether event DETAILS are visible to others who have access to your calendar.
            </p>
          </div>
        </div>

        {/* Refresh Button */}
        <div className="text-center">
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow transition"
          >
            🔄 Refresh Check
          </button>
        </div>
      </div>
    </div>
  );
}
