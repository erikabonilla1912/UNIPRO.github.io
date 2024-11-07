const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../../models/userModel'); // Adjust the path if necessary

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
  await User.deleteMany(); // Clear the database after each test
});

describe('User Model Test Suite', () => {
  it('should create and save a User successfully', async () => {
    const userData = {
      nombre: 'Juan Pérez',
      email: 'juan.perez@example.com',
      password: 'securepassword123',
    };
    const user = new User(userData);
    const savedUser = await user.save();

    // Validate that the data was saved correctly
    expect(savedUser._id).toBeDefined();
    expect(savedUser.nombre).toBe(userData.nombre);
    expect(savedUser.email).toBe(userData.email);
    expect(savedUser.password).toBe(userData.password);
  });



  it('should not save a User with a duplicate email', async () => {
    const userData1 = {
      nombre: 'Juan Pérez',
      email: 'juan.perez@example.com',
      password: 'securepassword123',
    };
    const userData2 = {
      nombre: 'Maria Gómez',
      email: 'juan.perez@example.com', // Duplicate email
      password: 'anotherpassword456',
    };

    await new User(userData1).save();
    let err;
    try {
      await new User(userData2).save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeDefined();
    expect(err.code).toBe(11000); // MongoDB duplicate key error code
  });

  it('should update a User\'s email successfully', async () => {
    const userData = {
      nombre: 'Juan Pérez',
      email: 'juan.perez@example.com',
      password: 'securepassword123',
    };

    const user = new User(userData);
    await user.save();

    user.email = 'juan.updated@example.com';
    const updatedUser = await user.save();

    expect(updatedUser.email).toBe('juan.updated@example.com');
  });

  it('should delete a User successfully', async () => {
    const userData = {
      nombre: 'Juan Pérez',
      email: 'juan.perez@example.com',
      password: 'securepassword123',
    };

    const user = new User(userData);
    await user.save();

    await User.findByIdAndDelete(user._id);
    const deletedUser = await User.findById(user._id);

    expect(deletedUser).toBeNull();
  });
});
