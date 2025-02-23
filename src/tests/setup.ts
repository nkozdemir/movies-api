import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createClient } from "redis-mock";

let mongoServer: MongoMemoryServer;

// Mock Redis client
jest.mock("../config/redis", () => {
  const mockClient = createClient();
  return {
    __esModule: true,
    default: mockClient,
    connectRedis: async () => mockClient,
  };
});

beforeAll(async () => {
  // Setup MongoDB Memory Server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
}, 10000);

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});
