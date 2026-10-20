// Validates and normalizes environment variables at startup.
// Required in every environment; optional ones get defaults.

const REQUIRED = [
  'MONGODB_URI',
  'CLIENT_URL',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
];

const OPTIONAL_DEFAULTS = {
  PORT: '5000',
  NODE_ENV: 'development',
  LOCATION_UPDATE_INTERVAL: '5000',
  LOCATION_RETENTION_DAYS: '7',
};

// Conditionally required only when the feature is active.
const CONDITIONAL = {
  production: ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET', 'RAZORPAY_WEBHOOK_SECRET'],
};

export function validateEnv() {
  const missing = REQUIRED.filter((k) => !process.env[k] || !String(process.env[k]).trim());

  for (const [k, v] of Object.entries(OPTIONAL_DEFAULTS)) {
    if (!process.env[k]) process.env[k] = v;
  }

  const env = process.env.NODE_ENV || 'development';
  const conditionalMissing = (CONDITIONAL[env] || []).filter((k) => !process.env[k]);
  if (conditionalMissing.length) {
    missing.push(...conditionalMissing);
  }

  if (missing.length) {
    throw new Error(`Missing required env vars: ${missing.join(', ')}`);
  }

  if (String(process.env.JWT_ACCESS_SECRET).length < 16) {
    throw new Error('JWT_ACCESS_SECRET must be at least 16 characters');
  }
  if (String(process.env.JWT_REFRESH_SECRET).length < 16) {
    throw new Error('JWT_REFRESH_SECRET must be at least 16 characters');
  }

  return {
    port: Number(process.env.PORT),
    env,
    mongoUri: process.env.MONGODB_URI,
    clientUrls: process.env.CLIENT_URL.split(',').map((s) => s.trim()),
    locationUpdateInterval: Number(process.env.LOCATION_UPDATE_INTERVAL),
    locationRetentionDays: Number(process.env.LOCATION_RETENTION_DAYS),
  };
}