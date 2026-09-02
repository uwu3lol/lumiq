const { userFromRequest } = require('./_lib/auth');

module.exports = async function handler(req, res) {
  if (!userFromRequest(req)) return res.status(401).json({ error: 'Unauthorized' });
  if (req.method === 'GET') {
    return res.status(200).json({ organization: { name: 'LUMIQ' }, settings: { profit_threshold_healthy: 30, profit_threshold_moderate: 20, profit_threshold_low: 10 } });
  }
  if (req.method === 'PUT') return res.status(200).json({ success: true });
  return res.status(405).json({ error: 'Method not allowed' });
};
