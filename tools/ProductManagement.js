var Product = require('../models/Product')
const fs = require('fs')

class ProductManagement {
  constructor() { }

  async _getArticle() {
    var article = ''
    var prevArticle = await Product.findOne({}, {}, { sort: { 'date': -1 } }).select('article')
    if (!prevArticle) {
      article = '000001'
    } else {
      var num = +prevArticle.article
      num = (num + 1).toString()
      var len = num.length
      for (var i = 0; i < 6 - len; i++) {
        num = '0' + num
      }
      article = num
    }
    return article
  }

  async getProducts(query = false) {
    if (!query) {
      return await Product.find({}).sort({ date: -1 })
    } else {
      var data = { products: [], query: { ...query } }
      var sort = {}
      if(query.date !== '0'){
        sort.date = +query.date
      }
      if(query.price !== '0'){
        sort.price = +query.price
      }
      const [result, itemCount] = await Promise.all([
        Product.find({}).limit(query.limit).sort(sort).skip(query.skip).lean().exec(),
        Product.countDocuments({})
      ]);
      data.products = result

      data.query.pageCount = Math.ceil(itemCount / query.limit);

      if (query.page > 1) {
        data.query.activePage = query.page
        data.query.prevlink = query.page - 1
      } else {
        data.query.activePage = 1
        data.query.prevlink = null
      }
      if (query.page == data.query.pageCount) {
        data.query.nextlink = null
      } else {
        data.query.nextlink = query.page + 1
      }
      return data
    }
  }

  async getProductOne(id) {
    return await Product.findOne({ _id: id });
  }

  async updateProductOne(product) {
    var valid = this._validProdObj(product)
    if (!valid) {
      if (product && product.fileName) {
        this._deleteFile(product.fileName)
      }
      console.log('Ошибка в форме!')
      return { error: 'Ошибка в форме!' }
    } else {
      var prodForUpdate = await Product.findOne({ _id: product._id });
      prodForUpdate = { ...prodForUpdate._doc, ...product }
      var id = prodForUpdate._id
      delete prodForUpdate._id
      if (product && product.fileName) {
        this._deleteFile(product.fileName)
      }
      return await Product.updateOne({ _id: id }, { $set: { ...prodForUpdate } });
    }
  }

  async _deleteFile(name) {
    fs.unlink("./public/img/product/" + name, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Файл удалён");
      }
    });
  }

  async removeProduct(id) {
    var result = await Product.findOne({ _id: id });
    await this._deleteFile(result.imgName)
    return await Product.deleteOne({ _id: id });
  }

  async save(data) {
    var productObj = {
      name: data.name,
      desc: data.desc,
      price: data.price,
      imgName: data.imgName,
      article: await this._getArticle()
    }
    var valid = this._validProdObj(productObj)
    if (!valid) {
      this._deleteFile(data.imgName)
      console.log('Ошибка в форме!')
      return { error: 'Ошибка в форме!' }
    } else {
      const product = new Product(productObj)
      var result = await product.save()
      return result
    }
  }

  // без замарочек Просто для примера
  _validProdObj(prod) {
    var valid = true
    if (prod.name && prod.name.length < 5) {
      valid = false
    }
    if (prod.desc && prod.desc.length < 5) {
      valid = false
    }
    if (prod.price && +prod.price < 0) {
      valid = false
    }
    return valid
  }
}

module.exports = ProductManagement