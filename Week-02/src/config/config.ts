import dotenv from 'dotenv';

dotenv.config();

function getEnv(name: string): string {
    const value = process.env[name];

    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }

    return value;
}

export const config = {
    PORT: getEnv('PORT'),
    QDRANT_URL: getEnv('QDRANT_URL'),
    OPENAI_API_KEY: getEnv('OPENAI_API_KEY'),
} as const;
