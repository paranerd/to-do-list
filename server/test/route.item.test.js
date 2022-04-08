// Read ENV variables
require('dotenv').config();

const request = require('supertest');
const mongoose = require('mongoose');
const User = require('../models/user');
const Item = require('../models/item');
const app = require('../app');

// Connect to MongoDB
require('../util/database').connect();

const username = 'admin';
const password = 'password';
let token;
let item;

beforeAll(async () => {
  // Remove data from user collection
  await User.deleteMany({});

  // Remove data from item collection
  await Item.deleteMany({});

  // Create admin user
  const user = await new User({
    username,
    password: await User.hashPassword(password),
    isAdmin: true,
  });

  // Save user
  await user.save();
});

afterAll(async () => {
  // Disconnect from DB
  mongoose.connection.close();
});

describe('Item routes', () => {
  it('Should return token on successful login', async () => {
    const res = await request(app).post('/api/user/login').send({
      username,
      password,
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');

    token = res.body.token;
  });

  it('Should return an empty items array', async () => {
    const res = await request(app)
      .get('/api/item')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveLength(0);
  });

  it('Should confirm 1 added item', async () => {
    const res = await request(app)
      .post('/api/item')
      .send({ name: 'test' })
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toMatchObject({
      name: 'test',
      pos: 0,
    });

    item = res.body;
  });

  it('Should confirm 1 added item with position 0', async () => {
    const res = await request(app)
      .post('/api/item')
      .send({ name: 'ting' })
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toMatchObject({
      name: 'ting',
      pos: 0,
    });
  });

  it('Should confirm 2 items', async () => {
    const res = await request(app)
      .get('/api/item')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveLength(2);
  });

  it('Should confirm 1 updated item', async () => {
    item.name = 'bar';
    const res = await request(app)
      .patch('/api/item')
      .send(item)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toMatchObject({
      name: 'bar',
      pos: 0,
    });
  });

  it('Should return an items array of length 2', async () => {
    const res = await request(app)
      .get('/api/item')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveLength(2);
  });

  it('Should confirm 1 deleted item', async () => {
    const res = await request(app)
      .delete('/api/item')
      .send(item)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
  });

  it('Should return an items array of length 1', async () => {
    const res = await request(app)
      .get('/api/item')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveLength(1);
  });
});
