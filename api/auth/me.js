const { userFromRequest } = require('../_lib/auth');

module.exports = async function handler(req, res) {
  const user = userFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  return res.status(200).json({ user });
};
