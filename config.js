var config = module.exports
var PRODUCTION = process.env.NODE_ENV === 'production'

config.express = {
  port: process.env.EXPRESS_PORT || 3000,
  ip: '127.0.0.1'
}

config.mongodb = {
  url: "mongodb://user2:CWBceENi81vGdv2V@87.239.108.111/test-task"
}

config.settingsShop = {
  name: "Celestial Body Shop",
  jwt: 'keys-publisher-keys',
  passportOptions: { session: false, failureRedirect: '/logout' },
  cookies: 'localhost'
}

if (PRODUCTION) {
  // Для примера
  config.express.ip = '0.0.0.0'
  config.settingsShop.cookies = 'myDomain.ru'
}