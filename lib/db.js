import mongoose from "mongoose";

const RETRY_COOLDOWN_MS = 20000;

const globalConnection = globalThis;
const cache = globalConnection.__roshpolliMongo || { connection: null, promise: null, failedAt: 0 };
globalConnection.__roshpolliMongo = cache;

export function isDatabaseConfigured() {
  return Boolean(process.env.MONGODB_URI);
}

function unavailableError(message) {
  const error = new Error(message);
  error.code = "DATABASE_UNAVAILABLE";
  return error;
}

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    const error = new Error("MONGODB_URI is not configured.");
    error.code = "DATABASE_NOT_CONFIGURED";
    throw error;
  }

  if (cache.connection?.connection?.readyState === 1) return cache.connection;
  if (cache.failedAt && Date.now() - cache.failedAt < RETRY_COOLDOWN_MS) {
    throw unavailableError("MongoDB connection is cooling down after a recent failure.");
  }
  if (!cache.promise) {
    cache.promise = mongoose.connect(uri, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 8000,
      maxPoolSize: 10,
      minPoolSize: 0,
    }).then((connection) => {
      cache.connection = connection;
      cache.failedAt = 0;
      return connection;
    }).catch((error) => {
      cache.promise = null;
      cache.failedAt = Date.now();
      const wrapped = new Error("MongoDB connection could not be established.");
      wrapped.code = "DATABASE_UNAVAILABLE";
      wrapped.cause = error;
      throw wrapped;
    });
  }
  return cache.promise;
}
