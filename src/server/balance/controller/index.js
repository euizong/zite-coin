const balanceService = require('../service');

exports.getBalance = (req, res) => {
  // 실제 로직은 balanceService에서 처리
  res.json({ message: '잔액 조회' });
};
