const crypto = require('node:crypto');

function tokenFor(user) {
  const payload = Buffer.from(JSON.stringify({ id: user.id, role: user.role, exp: Date.now() + 86400000 })).toString('base64url');
  const signature = crypto.createHmac('sha256', process.env.LUMIQ_TOKEN_SECRET || 'configure-a-token-secret').update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

function userFromRequest(req) {
  const value = req.headers.authorization || '';
  const [payload, signature] = value.replace(/^Bearer\s+/i, '').split('.');
  if (!payload || !signature) return null;
  const expected = crypto.createHmac('sha256', process.env.LUMIQ_TOKEN_SECRET || 'configure-a-token-secret').update(payload).digest('base64url');
  if (signature.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  let user;
  try { user = JSON.parse(Buffer.from(payload, 'base64url').toString()); } catch (_error) { return null; }
  return user.exp > Date.now() ? user : null;
}

module.exports = { tokenFor, userFromRequest };
