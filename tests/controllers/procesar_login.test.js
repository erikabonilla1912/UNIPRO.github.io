const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const express = require('express');
const authRouter = require('../../controllers/procesar_login'); // Adjust path if necessary
const User = require('../../models/userModel'); // Adjust path if necessary

let app;
let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), { useNewUrlParser: true, useUnifiedTopology: true });
  
  app = express();
  app.use(express.json());
  app.use('/auth', authRouter); // Mount the auth router
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany();
});

describe('POST /auth - User Login', () => {
  it('should login successfully with correct credentials', async () => {
    const hashedPassword = await bcrypt.hash('securepassword123', 10);
    const user = await User.create({ email: 'test@example.com', password: hashedPassword });
    
    const response = await request(app)
      .post('/auth')
      .send({ email: 'test@example.com', password: 'securepassword123' });

    expect(response.status).toBe(200);
    expect(response.text).toContain('Inicio de sesión exitoso');
    
    const token = response.text.split('Token: ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    expect(decoded.id).toBe(user._id.toString());
  });

  it('should return 400 if email is not found', async () => {
    const response = await request(app)
      .post('/auth')
      .send({ email: 'nonexistent@example.com', password: 'somepassword' });

    expect(response.status).toBe(400);
    expect(response.text).toBe('Usuario no encontrado');
  });

  it('should return 400 if password is incorrect', async () => {
    const hashedPassword = await bcrypt.hash('securepassword123', 10);
    await User.create({ email: 'test@example.com', password: hashedPassword });

    const response = await request(app)
      .post('/auth')
      .send({ email: 'test@example.com', password: 'wrongpassword' });

    expect(response.status).toBe(400);
    expect(response.text).toBe('Contraseña incorrecta');
  });

  it('should return 500 if an error occurs during login', async () => {
    const originalFindOne = User.findOne;
    User.findOne = jest.fn().mockRejectedValue(new Error('Unexpected error'));

    const response = await request(app)
      .post('/auth')
      .send({ email: 'test@example.com', password: 'securepassword123' });

    expect(response.status).toBe(500);
    expect(response.text).toBe('Error al iniciar sesión');

    User.findOne = originalFindOne; // Restore the original function
  });
});
