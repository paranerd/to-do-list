// Read ENV variables
require('dotenv').config();

const { authenticator } = require('@otplib/preset-default');

const request = require('supertest');
const mongoose = require('mongoose');
const User = require('../models/user');
const Item = require('../models/item');
const auth = require('../middleware/auth');
const app = require('../app');

// Connect to MongoDB
require('../util/database').connect();

const username = 'admin';
const password = 'password';
let token;
let refreshToken;
let expiredAccessToken;
let expiredRefreshToken;
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

describe('Auth routes', () => {
  it('Should fail to create the admin user', async () => {
    const res = await request(app).post('/api/auth/setup').send({
      username,
      password1: password,
      password2: '',
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('msg');
    expect(res.body.msg).toEqual('Passwords do not match');
  });

  it('Should create the admin user', async () => {
    const res = await request(app).post('/api/auth/setup').send({
      username,
      password1: password,
      password2: password,
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('username');
    expect(res.body).toHaveProperty('isAdmin');
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('refreshToken');
    expect(res.body.username).toEqual(username);
    expect(res.body.isAdmin).toEqual(true);
  });

  it('Should fail to create the admin user again', async () => {
    const res = await request(app).post('/api/auth/setup').send({
      username,
      password1: password,
      password2: password,
    });

    expect(res.statusCode).toEqual(401);
  });

  it('Should return token on successful login', async () => {
    const res = await request(app).post('/api/auth/login').send({
      username,
      password,
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');

    token = res.body.token;
    refreshToken = res.body.refreshToken;
  });

  it('Should obtain almost expired access token', async () => {
    expiredAccessToken = auth.generateToken({}, { expiresIn: '1s' });

    expect(expiredAccessToken).not.toBeNull();
  });

  it('Should obtain almost expired refresh token', async () => {
    expiredRefreshToken = auth.generateRefreshToken({}, { expiresIn: '1s' });

    expect(expiredRefreshToken).not.toBeNull();
  });

  it('Should fail with expired access token', async () => {
    // Wait for 2s for token to expire
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 2000);
    });

    const res = await request(app)
      .post('/api/item')
      .set('Authorization', `Bearer ${expiredAccessToken}`);

    expect(res.statusCode).toEqual(401);
    expect(res.body.msg).toContain('TokenExpired');
  });

  it('Should fail with expired refresh token', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .set('Authorization', `Bearer ${expiredRefreshToken}`);

    expect(res.statusCode).toEqual(401);
    expect(res.body.msg).toContain('TokenExpired');
  });

  it('Should fail with wrong token type', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(401);
    expect(res.body.msg).toContain('Unauthorized');
  });

  it('Should return refreshed access token', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .set('Authorization', `Bearer ${refreshToken}`);

    expect(res.statusCode).toEqual(200);
  });

  it('Should fail confirming Two-factor Authentication', async () => {
    const res = await request(app)
      .post('/api/auth/confirm-tfa')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(400);
    expect(res.body.msg).toContain('not enabled');
  });

  it('Should enable Two-factor Authentication', async () => {
    const res = await request(app)
      .post('/api/auth/enable-tfa')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('secret');

    tfaSecret = res.body.secret;
  });

  it('Should fail confirming Two-factor Authentication due to wrong code', async () => {
    const res = await request(app)
      .post('/api/auth/confirm-tfa')
      .send({
        code: '',
      })
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(401);
  });

  it('Should confirm Two-factor Authentication', async () => {
    const tfaToken = authenticator.generate(tfaSecret);

    const res = await request(app)
      .post('/api/auth/confirm-tfa')
      .send({
        code: tfaToken,
      })
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
  });
});
