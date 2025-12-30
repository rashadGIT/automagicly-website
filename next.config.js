/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    // Expose Google Calendar credentials to serverless functions
    GOOGLE_SERVICE_ACCOUNT_EMAIL: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    GOOGLE_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY,
    GOOGLE_CALENDAR_ID: process.env.GOOGLE_CALENDAR_ID,
    // Expose DynamoDB credentials to serverless functions
    DB_ACCESS_KEY_ID: process.env.DB_ACCESS_KEY_ID,
    DB_SECRET_ACCESS_KEY: process.env.DB_SECRET_ACCESS_KEY,
    REGION: process.env.REGION,
  },
};

module.exports = nextConfig;
