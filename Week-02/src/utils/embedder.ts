import { OpenAIEmbeddings } from '@langchain/openai';
import { config } from '../config/config.js';

export const embeddings = new OpenAIEmbeddings({
    model: 'text-embedding-3-small',
    apiKey: config.OPENAI_API_KEY,
});
