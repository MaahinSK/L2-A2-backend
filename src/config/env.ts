import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
  port: number;
  databaseUrl: string;
  jwtSecret: string;
  bcryptSaltRounds: number;
  corsOrigin: string;
}

export const env: EnvConfig = {
  port: parseInt(process.env.PORT || '5000', 10),
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || 'default-secret-change-this',
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),
  corsOrigin: process.env.CORS_ORIGIN || '*',
};

// Validate required environment variables
if (!env.databaseUrl) {
  throw new Error('DATABASE_URL is required');
}

if (!env.jwtSecret || env.jwtSecret === 'default-secret-change-this') {
  throw new Error('JWT_SECRET must be set to a secure value');
}