const AUTH_COOKIE_NAME = 'bb_token';
const configuredSameSite = (process.env.AUTH_COOKIE_SAME_SITE || 'strict').toLowerCase();
const clientUsesHttps = new URL(process.env.CLIENT_URL || 'http://localhost:5173').protocol === 'https:';

if (!['strict', 'lax', 'none'].includes(configuredSameSite)) {
  throw new Error('AUTH_COOKIE_SAME_SITE must be strict, lax, or none.');
}

const authCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production' || clientUsesHttps || configuredSameSite === 'none',
  sameSite: configuredSameSite,
  path: '/'
});

const readAuthCookie = (req) => {
  const cookies = req.headers.cookie || '';
  const authCookie = cookies
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${AUTH_COOKIE_NAME}=`));

  return authCookie ? authCookie.slice(AUTH_COOKIE_NAME.length + 1) : null;
};

module.exports = { AUTH_COOKIE_NAME, authCookieOptions, readAuthCookie };
