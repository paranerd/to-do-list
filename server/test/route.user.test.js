// Read ENV variables
require('dotenv').config();

const { authenticator } = require('@otplib/preset-default');

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
let tfaSecret;

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
  it('Should fail to create the admin user', async () => {
    const res = await request(app).post('/api/user/setup').send({
      username,
      password1: password,
      password2: '',
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('msg');
    expect(res.body.msg).toEqual('Passwords do not match');
  });

  it('Should create the admin user', async () => {
    const res = await request(app).post('/api/user/setup').send({
      username,
      password1: password,
      password2: password,
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('username');
    expect(res.body).toHaveProperty('isAdmin');
    expect(res.body).toHaveProperty('token');
    expect(res.body.username).toEqual(username);
    expect(res.body.isAdmin).toEqual(true);
  });

  it('Should fail to create the admin user again', async () => {
    const res = await request(app).post('/api/user/setup').send({
      username,
      password1: password,
      password2: password,
    });

    expect(res.statusCode).toEqual(401);
  });

  it('Should return token on successful login', async () => {
    const res = await request(app).post('/api/user/login').send({
      username,
      password,
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');

    token = res.body.token;
  });

  it('Should fail confirming Two-factor Authentication', async () => {
    const res = await request(app)
      .post('/api/user/confirm-tfa')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(400);
  });

  it('Should enable Two-factor Authentication', async () => {
    const res = await request(app)
      .post('/api/user/enable-tfa')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('secret');

    tfaSecret = res.body.secret;
  });

  it('Should fail confirming Two-factor Authentication due to wrong code', async () => {
    const res = await request(app)
      .post('/api/user/confirm-tfa')
      .send({
        code: '',
      })
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(401);
  });

  it('Should confirm Two-factor Authentication', async () => {
    const tfaToken = authenticator.generate(tfaSecret);

    const res = await request(app)
      .post('/api/user/confirm-tfa')
      .send({
        code: tfaToken,
      })
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
  });
});
