const logsService = require('../service');

exports.getLogs = (req, res) => {
  res.json({ message: '이벤트 로그' });
};
