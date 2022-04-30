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

beforeAll(async () => {
  // Remove data from user collection
  await User.deleteMany({});

  // Remove data from item collection
  await Item.deleteMany({});
});

afterAll(async () => {
  // Disconnect from DB
  mongoose.connection.close();
});

describe('User routes', () => {
  it('Should create the admin user', async () => {
    const res = await request(app).post('/api/auth/setup').send({
      username,
      password1: password,
      password2: password,
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');

    token = res.body.token;
  });

  it('Should fail creating the same user again', async () => {
    const res = await request(app)
      .post('/api/user')
      .send({
        username,
        password1: 'pass',
        password2: 'pass',
      })
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(400);
    expect(res.body.msg).toContain('User already exists');
  });

  it('Should fail creating user with mismatch passwords', async () => {
    const res = await request(app)
      .post('/api/user')
      .send({
        username,
        password1: 'pass',
        password2: '',
      })
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(400);
    expect(res.body.msg).toContain('Passwords do not match');
  });

  it('Should create a new user', async () => {
    const res = await request(app)
      .post('/api/user')
      .send({
        username: 'test',
        password1: 'pass',
        password2: 'pass',
      })
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('username');
    expect(res.body).toHaveProperty('isAdmin');
    expect(res.body.isAdmin).toBe(false);
  });
});
