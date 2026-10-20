const REQUIRED = ['MONGODB_URI', 'CLIENT_URL'];
const OPTIONAL = ['PORT', 'NODE_ENV'];

export function validateEnv() {
  const missing = REQUIRED.filter((k) => !process.env[k]);
  if (missing.length) {
    throw new Error(`Missing required env vars: ${missing.join(', ')}`);
  }
  OPTIONAL.forEach((k) => {
    if (!process.env[k] && k === 'PORT') process.env.PORT = '5000';
    if (!process.env[k] && k === 'NODE_ENV') process.env.NODE_ENV = 'development';
  });
}