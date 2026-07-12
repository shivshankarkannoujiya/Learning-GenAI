import { config } from '../config/config.js';
import { QdrantVectorStore } from '@langchain/qdrant';
import { embeddings } from './embedder.js';

export const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
    url: config.QDRANT_URL,
    collectionName: 'Testing',
});
