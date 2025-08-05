const userService = require('../server');

exports.getUser = (req, res) => {
  res.json({ message: '유저 정보 조회' });
};
