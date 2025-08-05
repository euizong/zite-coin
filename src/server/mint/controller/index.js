const mintService = require('../service');

exports.mintToken = (req, res) => {
  res.json({ message: '토큰 발행' });
};
