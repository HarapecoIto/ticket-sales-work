import { defineConfig } from '@prisma/config';
import { config as loadEnv } from 'dotenv';

// Prisma 7 does not implicitly load .env in prisma.config.ts.
loadEnv({ path: '.env' });
loadEnv({ path: '.env.local', override: true });
loadEnv({ path: '.env.development.local', override: true });

if (!process.env.DATABASE_URL) {
    throw new Error(
        'DATABASE_URL is not set. Define it in your environment or .env files before running Prisma CLI commands.'
    );
}

export default defineConfig({
    datasource: {
        // Load environment variables here
        url: process.env.DATABASE_URL, 
    },
});
