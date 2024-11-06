// tests/controllers/registerUser.test.js
const request = require('supertest');
const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../../models/userModel');
const registerRouter = require('../../controllers/procesar_registro');


jest.mock('../../models/userModel');
jest.mock('bcrypt');

const app = express();
app.use(express.json());
app.use('/register', registerRouter);

describe('POST /register', () => {
  const name = 'Test User';
  const email = 'test@example.com';
  const password = 'password123';
  const hashedPassword = 'hashed_password';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should register a user successfully', async () => {
    bcrypt.hash.mockResolvedValue(hashedPassword);
    User.prototype.save = jest.fn().mockResolvedValue();

    const response = await request(app).post('/register').send({
      nombre: name,
      email,
      password,
    });

    expect(response.status).toBe(200);
    expect(response.text).toBe('Registration successful');
    expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
    expect(User.prototype.save).toHaveBeenCalled();
  });

  it('should return a server error in case of an exception', async () => {
    bcrypt.hash.mockRejectedValue(new Error('Hashing error'));

    const response = await request(app).post('/register').send({
      nombre: name,
      email,
      password,
    });

    expect(response.status).toBe(500);
    expect(response.text).toBe('Error registering the user');
  });
});
