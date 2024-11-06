const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../../models/userModel'); // Adjust the path as necessary

let mongoServer;

beforeAll(async () => {
  // Start MongoDB in-memory server
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  // Connect Mongoose to the in-memory database
  await mongoose.connect(uri);
});

afterEach(async () => {
  // Clear the database between tests
  await User.deleteMany({});
});

afterAll(async () => {
  // Disconnect Mongoose and stop the in-memory MongoDB server
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('User Model Test', () => {
  it('should throw an error if the email is not unique', async () => {
    const userData1 = {
      nombre: 'John Doe',
      email: 'johndoe@example.com',
      password: 'password123',
    };

    const userData2 = {
      nombre: 'Jane Doe',
      email: 'johndoe@example.com', // Same email as the first user
      password: 'password456',
    };

    await new User(userData1).save();

    const user2 = new User(userData2);

    // Verify that an error is thrown for the non-unique email
    await expect(user2.save()).rejects.toThrowError(/duplicate key error/);
  });

  it('should throw an error if the email is missing', async () => {
    const userData = {
      nombre: 'Missing Email',
      password: 'password789',
    };

    const user = new User(userData);

    // Verify that an error is thrown when email is missing
    await expect(user.save()).rejects.toThrowError(/`email` is required/);
  });
});
