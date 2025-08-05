const txService = require('../service');

exports.getTransaction = (req, res) => {
  res.json({ message: '트랜잭션 정보' });
};
