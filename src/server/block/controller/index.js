const blockService = require('../service');

exports.getBlock = (req, res) => {
  res.json({ message: '블록 정보' });
};
