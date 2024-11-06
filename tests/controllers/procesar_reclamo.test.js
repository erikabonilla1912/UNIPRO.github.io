// tests/controllers/submitClaim.test.js
const request = require('supertest');
const express = require('express');
const User = require('../../models/userModel');
const Reclamo = require('../../models/reclamoModel');
const claimRouter = require('../../controllers/procesar_reclamo');


jest.mock('../../models/userModel');
jest.mock('../../models/reclamoModel');

const app = express();
app.use(express.json());
app.use('/submit-claim', claimRouter);

describe('POST /submit-claim', () => {
  const email = 'test@example.com';
  const subject = 'Test Claim';
  const message = 'This is a test message';
  const userId = '123456';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should submit a claim successfully', async () => {
    User.findOne.mockResolvedValue({ _id: userId, email });
    Reclamo.prototype.save = jest.fn().mockResolvedValue();

    const response = await request(app).post('/submit-claim').send({
      email,
      subject,
      message,
    });

    expect(response.status).toBe(200);
    expect(response.text).toBe('Claim submitted');
    expect(User.findOne).toHaveBeenCalledWith({ email });
    expect(Reclamo.prototype.save).toHaveBeenCalled();
  });

  it('should return an error if the user does not exist', async () => {
    User.findOne.mockResolvedValue(null);

    const response = await request(app).post('/submit-claim').send({
      email,
      subject,
      message,
    });

    expect(response.status).toBe(404);
    expect(response.text).toBe('User not found');
  });

  it('should return a server error in case of an exception', async () => {
    User.findOne.mockRejectedValue(new Error('DB error'));

    const response = await request(app).post('/submit-claim').send({
      email,
      subject,
      message,
    });

    expect(response.status).toBe(500);
    expect(response.text).toBe('Error processing the claim');
  });
});
