const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Proyecto = require('../../models/proyectoModel');

let mongoServer;

// Connect to in-memory MongoDB before all tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), { useNewUrlParser: true, useUnifiedTopology: true });
});

// Disconnect and close server after all tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Clear the database after each test
afterEach(async () => {
  await Proyecto.deleteMany();
});

describe('Proyecto Model Test Suite', () => {
  it('should create and save a Proyecto successfully', async () => {
    const proyectoData = {
      titulo: 'Proyecto de Ejemplo',
      descripcion: 'Descripción de ejemplo para el proyecto',
      imagenes: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
      videos: ['https://example.com/video1.mp4'],
      autor: new mongoose.Types.ObjectId(),
    };
    const proyecto = new Proyecto(proyectoData);
    const savedProyecto = await proyecto.save();

    expect(savedProyecto._id).toBeDefined();
    expect(savedProyecto.titulo).toBe(proyectoData.titulo);
    expect(savedProyecto.descripcion).toBe(proyectoData.descripcion);
    expect(savedProyecto.imagenes).toEqual(expect.arrayContaining(proyectoData.imagenes));
    expect(savedProyecto.videos).toEqual(expect.arrayContaining(proyectoData.videos));
    expect(savedProyecto.autor).toEqual(proyectoData.autor);
  });

  it('should update a Proyecto successfully', async () => {
    const proyecto = new Proyecto({
      titulo: 'Original Title',
      descripcion: 'Original Description',
      imagenes: [],
      videos: [],
      autor: new mongoose.Types.ObjectId(),
    });
    await proyecto.save();

    proyecto.titulo = 'Updated Title';
    const updatedProyecto = await proyecto.save();

    expect(updatedProyecto.titulo).toBe('Updated Title');
  });

  it('should delete a Proyecto successfully', async () => {
    const proyecto = new Proyecto({
      titulo: 'Project to Delete',
      descripcion: 'This project will be deleted',
      imagenes: [],
      videos: [],
      autor: new mongoose.Types.ObjectId(),
    });
    await proyecto.save();

    await Proyecto.findByIdAndDelete(proyecto._id);
    const deletedProyecto = await Proyecto.findById(proyecto._id);
    expect(deletedProyecto).toBeNull();
  });
});
