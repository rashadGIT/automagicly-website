'use client';

const tools = [
  { name: 'Gmail', emoji: '📧' },
  { name: 'Slack', emoji: '💬' },
  { name: 'QuickBooks', emoji: '📊' },
  { name: 'HubSpot', emoji: '🎯' },
  { name: 'Google Sheets', emoji: '📋' },
  { name: 'Zapier', emoji: '⚡' },
  { name: 'Microsoft 365', emoji: '🏢' },
  { name: 'Stripe', emoji: '💳' },
];

export default function SocialProof() {
  return (
    <section className="border-y border-gray-100 bg-white py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <p className="text-sm text-gray-400 text-center mb-6 font-medium uppercase tracking-wide">
          Works with the tools you already use
        </p>
        <div className="flex flex-wrap justify-center items-center gap-3 md:gap-6">
          {tools.map((tool) => (
            <div
              key={tool.name}
              className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-brand-50 rounded-full border border-gray-200 hover:border-brand-200 transition-all duration-200 group"
            >
              <span className="text-lg">{tool.emoji}</span>
              <span className="text-sm font-medium text-gray-500 group-hover:text-brand-700 transition-colors">
                {tool.name}
              </span>
            </div>
          ))}
          <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400">
            + many more
          </div>
        </div>
      </div>
    </section>
  );
}
