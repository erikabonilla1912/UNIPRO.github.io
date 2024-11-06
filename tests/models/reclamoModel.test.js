const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Reclamo = require('../../models/reclamoModel'); // Ensure the path is correct

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

describe('Reclamo Model Test', () => {
  it('should create a claim with title, description, and author', async () => {
    const reclamoData = {
      titulo: 'Test Claim',
      descripcion: 'This is a test claim for unit testing',
      autor: mongoose.Types.ObjectId(), // Simulate a user ID
    };

    const reclamo = new Reclamo(reclamoData);
    await reclamo.save();

    // Verify that the claim was saved correctly
    const savedReclamo = await Reclamo.findById(reclamo._id);

    expect(savedReclamo.titulo).toBe(reclamoData.titulo);
    expect(savedReclamo.descripcion).toBe(reclamoData.descripcion);
    expect(savedReclamo.autor.toString()).toBe(reclamoData.autor.toString());
  });

  it('should throw an error if the title is missing', async () => {
    const reclamoData = {
      descripcion: 'This claim has no title',
      autor: mongoose.Types.ObjectId(),
    };

    const reclamo = new Reclamo(reclamoData);
    
    // Verify that an error is thrown
    await expect(reclamo.save()).rejects.toThrow();
  });
});
