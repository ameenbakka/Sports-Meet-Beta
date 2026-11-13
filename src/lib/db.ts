import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sports-meet';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn && cached.conn.connection.readyState === 1) {
    return cached.conn;
  }

  const uri = process.env.MONGODB_URI;

  if (!uri && process.env.NODE_ENV === 'production') {
    throw new Error(
      'MONGODB_URI is not set in Vercel Environment Variables. Please go to Vercel Project Settings > Environment Variables, add MONGODB_URI with your MongoDB Atlas connection string, and redeploy.'
    );
  }

  const connString = uri || MONGODB_URI;

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000, // 10s timeout
    };

    cached.promise = mongoose.connect(connString, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e: any) {
    cached.promise = null;
    console.error('MongoDB connection error:', e);
    throw new Error(
      `Database connection failed: ${e.message}. (Make sure MONGODB_URI is set in Vercel and 0.0.0.0/0 is added to MongoDB Atlas Network Access)`
    );
  }

  return cached.conn;
}
