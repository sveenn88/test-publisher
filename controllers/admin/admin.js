var express = require('express')
var multer = require('multer')
const paginate = require('express-paginate');
var ProductManagement = require('../../tools/ProductManagement')
const passAuth = require('../../middleware/passAuth')
var config = require('../../config')
var join = require('path').join

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/img/product/')
  },
  filename: function (req, file, cb) {
    req.fileName = `${file.fieldname}_${Date.now()}.${file.originalname.split('.').pop()}`
    cb(null, req.fileName)
  }
})

var upload = multer({ storage: storage })

var router = new express.Router()
router.use(express.static(join(__dirname, '../../public')))

async function adminMain(req, res) {
  var Prod = new ProductManagement()
  var data = await Prod.getProducts({ ...req.query, skip: req.skip })
  data.query.pages = paginate.getArrayPages(req)(5, data.query.pageCount, data.query.page)
  res.render('./admin/main', { title: `${config.settingsShop.name} - Adminka`, data, token: res.token })
}

function getProductAdd(req, res) {
  res.render('./admin/add', { title: `${config.settingsShop.name} - Add product`, errorForm: {}, result: null, token: res.token })
}

async function postProductAdd(req, res, next) {
  var data = { ...req.body, imgName: req.fileName }
  var Prod = new ProductManagement()
  var result = await Prod.save(data)
  console.log(result)
  res.render('./admin/add', { title: `${config.settingsShop.name} - Add product`, errorForm: {}, result, token: res.token })
}

async function getProductEdit(req, res) {
  var Prod = new ProductManagement()
  var product = await Prod.getProductOne(req.params.id)
  res.render('./admin/edit', { title: `${config.settingsShop.name} - Edit product`, errorForm: {}, result: null, product, token: res.token })
}

async function postProductEdit(req, res) {
  var data = { ...req.body, imgName: req.fileName }
  var Prod = new ProductManagement()
  var result = await Prod.updateProductOne(data)
  var product = await Prod.getProductOne(data._id)
  
  res.render('./admin/edit', { title: `${config.settingsShop.name} - Edit product`, errorForm: {}, result, product, token: res.token })
}

async function ProductDelete(req, res) {
  var Prod = new ProductManagement()
  var result = await Prod.removeProduct(req.params.id)
  res.redirect('/admin')
}

router.get('/', passAuth(), adminMain)
router.get('/add', passAuth(), getProductAdd)
router.post('/add', passAuth(), upload.single('img'), postProductAdd)
router.get('/edit/:id', passAuth(), getProductEdit)
router.post('/edit', passAuth(), upload.single('img'), postProductEdit)
router.get('/delete/:id', passAuth(), ProductDelete)

module.exports = router