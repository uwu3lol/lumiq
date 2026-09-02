const { tokenFor } = require('../_lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { email = '', password = '', login_type: loginType = 'owner', name = '' } = req.body || {};
  const credentials = {
    owner: { email: process.env.LUMIQ_OWNER_EMAIL, password: process.env.LUMIQ_OWNER_PASSWORD, role: 'owner', name: 'LUMIQ Owner' },
    co_owner: { email: process.env.LUMIQ_COOWNER_EMAIL, password: process.env.LUMIQ_COOWNER_PASSWORD, role: 'co_owner', name: 'LUMIQ Co-Owner' },
    worker: { email: process.env.LUMIQ_WORKER_NAME, password: process.env.LUMIQ_WORKER_PASSWORD, role: 'worker', name: process.env.LUMIQ_WORKER_NAME },
  };
  const account = credentials[loginType];
  if (!account?.email || !account.password) {
    return res.status(503).json({ error: `${loginType} login is not configured in Vercel environment variables.` });
  }
  const identifier = loginType === 'worker' ? name : email;
  if (identifier.toLowerCase() !== account.email.toLowerCase() || password !== account.password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const user = { id: account.role, name: account.name, email: loginType === 'worker' ? '' : account.email, role: account.role };
  return res.status(200).json({ token: tokenFor(user), user });
};
