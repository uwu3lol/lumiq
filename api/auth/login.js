const { tokenFor } = require('../_lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { email = '', password = '', login_type: loginType = 'owner', name = '' } = req.body || {};
  const expectedEmail = process.env.LUMIQ_OWNER_EMAIL;
  const expectedPassword = process.env.LUMIQ_OWNER_PASSWORD;
  if (!expectedEmail || !expectedPassword) {
    return res.status(503).json({ error: 'Owner login is not configured. Add LUMIQ_OWNER_EMAIL and LUMIQ_OWNER_PASSWORD in Vercel.' });
  }
  const identifier = loginType === 'worker' ? name : email;
  if (loginType !== 'owner' || identifier.toLowerCase() !== expectedEmail.toLowerCase() || password !== expectedPassword) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const user = { id: 'owner', name: 'LUMIQ Owner', email: expectedEmail, role: 'owner' };
  return res.status(200).json({ token: tokenFor(user), user });
};
