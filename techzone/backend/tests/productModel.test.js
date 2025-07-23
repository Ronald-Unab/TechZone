const mongoose = require('mongoose');
const Product = require('../models/Product');

beforeAll(async () => {
  await mongoose.connect('mongodb://localhost:27017/techzone_test');
});

afterAll(async () => {
  //await mongoose.connection.db.dropDatabase();
  await mongoose.disconnect();
});

describe('Modelo Product', () => {
  it('debería crear un producto válido', async () => {
    const product = new Product({
      name: 'Laptop HP',
      price: 1000,
      stock: 5,
      owner: '123abc' // 🔁 CAMPO CORRECTO SEGÚN TU MODELO
    });
    const savedProduct = await product.save();
    expect(savedProduct._id).toBeDefined();
    expect(savedProduct.name).toBe('Laptop HP');
  });

  it('debería fallar sin nombre', async () => {
    const product = new Product({
      price: 1000,
      stock: 5,
      owner: '123abc'
    });
    let err;
    try {
      await product.save();
    } catch (e) {
      err = e;
    }
    expect(err).toBeDefined();
  });

  it('debería fallar con precio negativo', async () => {
    const product = new Product({
      name: 'Tablet',
      price: -200,
      stock: 3,
      owner: '123abc'
    });
    let err;
    try {
      await product.save();
    } catch (e) {
      err = e;
    }
    expect(err).toBeDefined();
  });

  it('debería fallar con stock negativo', async () => {
    const product = new Product({
      name: 'Monitor',
      price: 300,
      stock: -1,
      owner: '123abc'
    });
    let err;
    try {
      await product.save();
    } catch (e) {
      err = e;
    }
    expect(err).toBeDefined();
  });
});