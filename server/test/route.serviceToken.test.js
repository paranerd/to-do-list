// Read ENV variables
require('dotenv').config();

const request = require('supertest');
const mongoose = require('mongoose');
const User = require('../models/user');
const ServiceToken = require('../models/serviceToken');
const app = require('../app');

// Connect to MongoDB
require('../util/database').connect();

const username = 'admin';
const password = 'password';
let token;
let serviceToken;

beforeAll(async () => {
  // Remove data from user collection
  await User.deleteMany({});

  // Remove all service tokens
  await ServiceToken.deleteMany({});

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

describe('Service Token routes', () => {
  it('Should return token on successful login', async () => {
    const res = await request(app).post('/api/auth/login').send({
      username,
      password,
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');

    token = res.body.token;
  });

  it('Should return empty list of service tokens', async () => {
    const res = await request(app)
      .get('/api/service-token')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveLength(0);
  });

  it('Should fail to create new service token without name', async () => {
    const res = await request(app)
      .post('/api/service-token')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(400);
  });

  it('Should still return empty list of service tokens', async () => {
    const res = await request(app)
      .get('/api/service-token')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveLength(0);
  });

  it('Should create new service token', async () => {
    const res = await request(app)
      .post('/api/service-token')
      .send({ name: 'test' })
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('token');
    expect(res.body).not.toHaveProperty('expiresIn');
    expect(res.body).toMatchObject({
      name: 'test',
    });

    serviceToken = res.body;
    console.log(serviceToken);
  });

  it('Should return an array containing 1 service token', async () => {
    const res = await request(app)
      .get('/api/service-token')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveLength(1);
  });

  it('Should result in a successful request', async () => {
    const res = await request(app)
      .get('/api/item')
      .set('Authorization', `Bearer ${serviceToken.token}`);

    expect(res.statusCode).toEqual(200);
  });

  it('Should fail removing service token', async () => {
    const res = await request(app)
      .delete(`/api/service-token/${serviceToken.id}`)
      .set('Authorization', `Bearer ${serviceToken.token}`);

    expect(res.statusCode).toEqual(403);
  });

  it('Should remove service token', async () => {
    const res = await request(app)
      .delete(`/api/service-token/${serviceToken.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
  });

  it('Should return empty list of service tokens again', async () => {
    const res = await request(app)
      .get('/api/service-token')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveLength(0);
  });

  it('Should fail using revoked service token', async () => {
    const res = await request(app)
      .get('/api/item')
      .set('Authorization', `Bearer ${serviceToken.token}`);

    expect(res.statusCode).toEqual(403);
  });
});
