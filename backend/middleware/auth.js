const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  const token = req.header('x-auth-token');

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'collabtoolsecret');
    req.user = decoded.user || decoded;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ msg: 'Invalid token payload' });
    }

    next();
  } catch (err) {
    return res.status(401).json({ msg: 'Token is not valid' });
  }
};
