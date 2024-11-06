const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../../models/userModel');
const loginRouter = require('../../controllers/procesar_login');

jest.mock('../../models/userModel');

const app = express();
app.use(express.json());
app.use('/login', loginRouter);

describe('POST /login', () => {
  const email = 'test@example.com';
  const password = 'password123';
  const hashedPassword = bcrypt.hashSync(password, 10);
  const userId = '123456';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should log in successfully and return a token', async () => {
    User.findOne.mockResolvedValue({ _id: userId, email, password: hashedPassword });

    // Mock bcrypt.compare using jest.spyOn instead of direct assignment
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
    
    // Mock jwt.sign
    jest.spyOn(jwt, 'sign').mockReturnValue('mocked_token');

    const response = await request(app).post('/login').send({ email, password });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Login successful');
    expect(response.body.token).toBe('mocked_token');
  });

  it('should return an error if the user does not exist', async () => {
    User.findOne.mockResolvedValue(null);

    const response = await request(app).post('/login').send({ email, password });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('User not found');
  });

  it('should return an error if the password is incorrect', async () => {
    User.findOne.mockResolvedValue({ _id: userId, email, password: hashedPassword });

    // Mock bcrypt.compare for incorrect password
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

    const response = await request(app).post('/login').send({ email, password });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Incorrect password');
  });

  it('should return a server error in case of an exception', async () => {
    User.findOne.mockRejectedValue(new Error('DB error'));

    const response = await request(app).post('/login').send({ email, password });

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Error logging in');
  });
});
