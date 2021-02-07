const mongoose = require("mongoose")
var app = require('./app')
var config = require('./config')

console.log('Поехали!')

app.listen(config.express.port, function (error) {
  if (error) {
    console.error('Шеф все пропало!', error)
    process.exit(10)
  }
  mongoose.set('useNewUrlParser', true);
  mongoose.set('useFindAndModify', false);
  mongoose.set('useCreateIndex', true);
  mongoose.connect(
    config.mongodb.url,
    { useUnifiedTopology: true, serverSelectionTimeoutMS: 5000 })
    .then(() => console.log('MongoDB connect'))
    .catch(error => console.log('База всё ...', error));

  console.log(`Работает здесь => http://localhost:${config.express.port}`)
})