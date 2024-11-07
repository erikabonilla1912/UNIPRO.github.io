const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Reclamo = require('../../models/reclamoModel'); // Adjust the path if necessary

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Reclamo.deleteMany(); // Clear the database after each test
});

describe('Reclamo Model Test Suite', () => {
  it('should create and save a Reclamo successfully', async () => {
    const reclamoData = {
      titulo: 'Reclamo de Ejemplo',
      descripcion: 'Descripción del reclamo de ejemplo',
      autor: new mongoose.Types.ObjectId(),
    };
    const reclamo = new Reclamo(reclamoData);
    const savedReclamo = await reclamo.save();

    // Validate that the data was saved correctly
    expect(savedReclamo._id).toBeDefined();
    expect(savedReclamo.titulo).toBe(reclamoData.titulo);
    expect(savedReclamo.descripcion).toBe(reclamoData.descripcion);
    expect(savedReclamo.autor).toEqual(reclamoData.autor);
  });


  it('should update a Reclamo successfully', async () => {
    const reclamo = new Reclamo({
      titulo: 'Título Original',
      descripcion: 'Descripción Original',
      autor: new mongoose.Types.ObjectId(),
    });
    await reclamo.save();

    // Update title and save
    reclamo.titulo = 'Título Actualizado';
    const updatedReclamo = await reclamo.save();

    expect(updatedReclamo.titulo).toBe('Título Actualizado');
  });

  it('should delete a Reclamo successfully', async () => {
    const reclamo = new Reclamo({
      titulo: 'Reclamo a Eliminar',
      descripcion: 'Este reclamo será eliminado',
      autor: new mongoose.Types.ObjectId(),
    });
    await reclamo.save();

    await Reclamo.findByIdAndDelete(reclamo._id);
    const deletedReclamo = await Reclamo.findById(reclamo._id);
    expect(deletedReclamo).toBeNull();
  });
});
