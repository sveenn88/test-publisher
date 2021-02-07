const JwtStrategy = require('passport-jwt').Strategy
const passport = require('passport')
const User = require('../models/User')
var config = require('../config')

var cookieExtractor = function (req) {
  var token = null;
  if (req && req.cookies) token = req.cookies['token'];
  return token;
};

const options = {
  jwtFromRequest: cookieExtractor,
  secretOrKey: config.settingsShop.jwt
}

module.exports = passport => {
  passport.use(
    new JwtStrategy(options, async (payload, done) => {
      try {
        const user = await User.findById(payload.userId).select('login id')
        if (user) {
          done(null, user)
        } else {
          done(null, false)
        }
      } catch (e) {
        console.log(e)
      }
    })
  )
}

/* module.exports = passAuth => {
  return passport.authenticate('jwt', { session: false, failureRedirect: '/logout' })
} */