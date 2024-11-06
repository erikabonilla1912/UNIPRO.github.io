const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Proyecto = require('../../models/proyectoModel'); // Ensure the path is correct

let mongoServer;

beforeAll(async () => {
  // Start MongoDB in-memory server
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  // Connect Mongoose to the in-memory database
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  // Disconnect Mongoose and stop the in-memory MongoDB server
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Proyecto Model Test', () => {
  it('should create a project with title, description, images, and videos', async () => {
    const proyectoData = {
      titulo: 'Test Project',
      descripcion: 'This is a test project for unit testing',
      imagenes: ['http://example.com/image1.jpg', 'http://example.com/image2.jpg'],
      videos: ['http://example.com/video1.mp4', 'http://example.com/video2.mp4'],
      autor: mongoose.Types.ObjectId(), // Simulate a user ID
    };

    const proyecto = new Proyecto(proyectoData);
    await proyecto.save();

    // Verify that the project was saved correctly
    const savedProyecto = await Proyecto.findById(proyecto._id);

    expect(savedProyecto.titulo).toBe(proyectoData.titulo);
    expect(savedProyecto.descripcion).toBe(proyectoData.descripcion);
    expect(savedProyecto.imagenes).toEqual(proyectoData.imagenes);
    expect(savedProyecto.videos).toEqual(proyectoData.videos);
    expect(savedProyecto.autor.toString()).toBe(proyectoData.autor.toString());
  });

  it('should throw an error if the title is missing', async () => {
    const proyectoData = {
      descripcion: 'This project has no title',
      imagenes: ['http://example.com/image1.jpg'],
      videos: ['http://example.com/video1.mp4'],
      autor: mongoose.Types.ObjectId(),
    };

    const proyecto = new Proyecto(proyectoData);
    
    // Verify that an error is thrown
    await expect(proyecto.save()).rejects.toThrow();
  });
});
