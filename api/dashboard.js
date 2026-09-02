const { userFromRequest } = require('./_lib/auth');

module.exports = async function handler(req, res) {
  if (!userFromRequest(req)) return res.status(401).json({ error: 'Unauthorized' });
  return res.status(200).json({
    isEmpty: true,
    kpis: { totalRevenue: 0, outstanding: 0, netProfit: 0, expenses: 0, pendingPaymentsCount: 0, totalProjects: 0, profitMargin: 0 },
    settings: { profit_threshold_healthy: 30, profit_threshold_moderate: 20, profit_threshold_low: 10 },
    monthlyData: [],
    expenseByCategory: {},
    recentActivity: [],
    upcomingPayments: [],
    projects: []
  });
};
