const jwt = require('jsonwebtoken')

var cookieExtractor = function (req) {
  var token = null;
  if (req.cookies['token']) token = jwt.decode(req.cookies['token'])
  return token;
};

module.exports = async (req, res, next) => {
  try {
    var tokenDecode = cookieExtractor(req)
    if (tokenDecode) {
      res.token = tokenDecode
      next()
    } else {
      next()
    }
  } catch (e) {
    console.log(e)
  }
}