const express = require('express')
const app = express()
const paginate = require('express-paginate');
var cookieParser = require('cookie-parser') 
var config = require('./config')
var Auth = require('./middleware/auth')
const passport = require('passport')
const ProductManagement = require('./tools/ProductManagement') 
app.set('views', './views');
app.set('view engine', 'pug');
app.use(passport.initialize())
require('./middleware/passport')(passport)
app.use(cookieParser())
app.use(function(req, res, next){
  Auth(req, res, next);
});
app.use(paginate.middleware(10, 5000));
app.use(express.static(__dirname + '/public'));

app.get('/', async (req, res, next) => {
  var Prod = new ProductManagement()
  var data = await Prod.getProducts({...req.query, skip: req.skip})
  data.query.pages = paginate.getArrayPages(req)(5, data.query.pageCount, data.query.page)
  res.render('main', { title: `${config.settingsShop.name} - Home`, data, token: res.token });
});

app.use(require('./controllers/auth/auth'))
app.use('/admin', require('./controllers/admin/admin'))

module.exports = app