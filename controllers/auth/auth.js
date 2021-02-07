var express = require('express')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
var config = require('../../config')
const bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false })
var join = require('path').join
var User = require('../../models/User')

var router = new express.Router()
router.use(express.static(join(__dirname, '../../public')))

var _isValidUsername = async (username) => {
  var result = { valid: true, message: [] }
  // меньше 5
  if (username.length < 5) {
    result.valid = false
    result.message.push('Мало символов.')
  }
  // Начинается на число, просто так захотелось 
  if (!isNaN(username[0])) {
    result.valid = false
    result.message.push('Логин не должен начинаться с цифры.')
  }
  // Есть ли такой логин?
  const candidate = await User.findOne({ login: username })
  if (!candidate) {
    result.valid = false
    result.message.push('Логин не найден.')
  }
  return result
}

var _isValidPassword = (pass) => {
  var result = { valid: true, message: [] }
  // меньше 5
  if (pass.length < 5) {
    result.valid = false
    result.message.push('Мало символов.')
  }
  return result
}

var validFormLogin = async (body) => {
  var errorForm = {
    username: [],
    password: []
  }
  var valudUsername = await _isValidUsername(body.username)
  var valudPassword = _isValidPassword(body.password)
  if (!valudUsername.valid) {
    errorForm.username = valudUsername.message
  }
  if (!valudPassword.valid) {
    errorForm.password = valudPassword.message
  }
  return errorForm
}

var authUser = async (body) => {
  const candidate = await User.findOne({ login: body.username })
  // проверка пароля
  const passwordResult = bcrypt.compareSync(body.password, candidate.password)
  var token = false
  if (passwordResult) {
    // Генерация токена Пароли совпали
    token = jwt.sign({
      login: candidate.login,
      userId: candidate._id
    }, config.settingsShop.jwt, { expiresIn: 86400 })
    return token
  } else {
    return token
  }
}

function loginGet(req, res) {
  res.render('./auth/login', { title: `${config.settingsShop.name} - Login`, errorForm: null })
}

async function loginPost(req, res) {
  var errorForm = {
    username: [],
    password: []
  }
  // валидация
  errorForm = await validFormLogin(req.body)
  if (errorForm.username.length > 0 || errorForm.password.length > 0) {
    res.render('./auth/login', { title: `${config.settingsShop.name} - Login`, errorForm })
  } else {
    // авторизация
    var token = await authUser(req.body)
    if (!token) {
      errorForm = {
        username: [],
        password: ['Не верный пароль.']
      }
      res.render('./auth/login', { title: `${config.settingsShop.name} - Login`, errorForm })
    } else {
      res.cookie("token", `${token}`, { domain: config.settingsShop.cookies })
      res.redirect('/admin')
    }
  }
}

function logout(req, res) {
  res.clearCookie('token')
  res.redirect('/')
}

router.get('/login', loginGet)
router.post('/login', urlencodedParser, loginPost)
router.get('/logout', logout)

module.exports = router