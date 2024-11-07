const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const express = require('express');
const Proyecto = require('../../models/proyectoModel'); // Adjust path if necessary
const User = require('../../models/userModel'); // Adjust path if necessary
const proyectoRouter = require('../../controllers/procesar_proyecto'); // Adjust path if necessary

let app;
let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), { useNewUrlParser: true, useUnifiedTopology: true });

  app = express();
  app.use(express.json());
  app.use('/proyecto', proyectoRouter); // Mount the proyecto router
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Proyecto.deleteMany();
  await User.deleteMany();
});

describe('POST /proyecto - Create Project', () => {
  it('should create a project successfully when the user exists', async () => {
    // Create a user to associate with the project
    const user = await User.create({ email: 'test@example.com', nombre: 'Test User', password: 'password123' });

    const projectData = {
      email: 'test@example.com',
      titulo: 'Nuevo Proyecto',
      descripcion: 'Descripción del proyecto',
      imagen: 'http://example.com/image.png',
      video: 'http://example.com/video.mp4'
    };

    const response = await request(app)
      .post('/proyecto')
      .send(projectData);

    expect(response.status).toBe(200);
    expect(response.text).toBe('Proyecto publicado');

    // Verify that the project was created in the database
    const createdProject = await Proyecto.findOne({ titulo: 'Nuevo Proyecto' });
    expect(createdProject).not.toBeNull();
    expect(createdProject.descripcion).toBe('Descripción del proyecto');
    expect(createdProject.imagen).toBe('http://example.com/image.png');
    expect(createdProject.video).toBe('http://example.com/video.mp4');
    expect(createdProject.usuario.toString()).toBe(user._id.toString());
  });

  it('should return 404 if the user does not exist', async () => {
    const projectData = {
      email: 'nonexistent@example.com',
      titulo: 'Proyecto Inexistente',
      descripcion: 'Descripción del proyecto',
      imagen: 'http://example.com/image.png',
      video: 'http://example.com/video.mp4'
    };

    const response = await request(app)
      .post('/proyecto')
      .send(projectData);

    expect(response.status).toBe(404);
    expect(response.text).toBe('Usuario no encontrado');
  });

  it('should return 500 if there is an error during project creation', async () => {
    // Mock User.findOne to throw an error
    const originalFindOne = User.findOne;
    User.findOne = jest.fn().mockRejectedValue(new Error('Unexpected error'));

    const projectData = {
      email: 'test@example.com',
      titulo: 'Proyecto Erróneo',
      descripcion: 'Descripción del proyecto erróneo',
      imagen: 'http://example.com/image.png',
      video: 'http://example.com/video.mp4'
    };

    const response = await request(app)
      .post('/proyecto')
      .send(projectData);

    expect(response.status).toBe(500);
    expect(response.text).toBe('Error al procesar el proyecto');

    // Restore original User.findOne
    User.findOne = originalFindOne;
  });
});
