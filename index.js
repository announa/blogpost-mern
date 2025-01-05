const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/product.model.js')
dotenv.config();
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('What do you want?');
});

app.post('/api/products', async (req, res) => {
  console.log(req.body);
  try {
    const product = await Product.create(req.body);
    console.log(product);
    console.log('Product successfully created');
    res.status(200).json(product)
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

mongoose
  .connect(process.env.DB_CONNECTION_STRING)
  .then(() => {
    console.log('Connected to database');

    app.listen(3000, () => {
      console.log('App listening on port 3000');
    });
  })
  .catch(() => {
    console.log('Connection to database failed');
  });
