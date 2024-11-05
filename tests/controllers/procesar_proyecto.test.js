// tests/controllers/publicarProyecto.test.js
const request = require('supertest');
const express = require('express');
const User = require('../../models/userModel');
const Proyecto = require('../../models/proyectoModel');
const publicarProyectoRouter = require('../../controllers/publicarProyecto');

jest.mock('../../models/userModel');
jest.mock('../../models/proyectoModel');

const app = express();
app.use(express.json());
app.use('/publish-project', publicarProyectoRouter);

describe('POST /publish-project', () => {
  const email = 'test@example.com';
  const title = 'Test Project';
  const description = 'Description of the test project';
  const image = 'image.jpg';
  const video = 'video.mp4';
  const userId = '123456';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should publish a project successfully', async () => {
    User.findOne.mockResolvedValue({ _id: userId, email });
    Proyecto.prototype.save = jest.fn().mockResolvedValue();

    const response = await request(app).post('/publish-project').send({
      email,
      title,
      description,
      image,
      video,
    });

    expect(response.status).toBe(200);
    expect(response.text).toBe('Project published');
    expect(User.findOne).toHaveBeenCalledWith({ email });
    expect(Proyecto.prototype.save).toHaveBeenCalled();
  });

  it('should return an error if the user does not exist', async () => {
    User.findOne.mockResolvedValue(null);

    const response = await request(app).post('/publish-project').send({
      email,
      title,
      description,
      image,
      video,
    });

    expect(response.status).toBe(404);
    expect(response.text).toBe('User not found');
  });

  it('should return a server error in case of an exception', async () => {
    User.findOne.mockRejectedValue(new Error('DB error'));

    const response = await request(app).post('/publish-project').send({
      email,
      title,
      description,
      image,
      video,
    });

    expect(response.status).toBe(500);
    expect(response.text).toBe('Error processing the project');
  });
});
