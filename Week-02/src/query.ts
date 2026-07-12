/**
 
  - Conver the userQuery to Vector Embedding
  - Search the vectors in the Qdrant DB
  - get similar vectors and chunks
  - Feed those chunks to LLM model & do a simple chat with userQuery
 */

import { openaiClient } from './utils/openaiClient.js';
import { vectorStore } from './utils/store.js';

const query = async (userQuery: string) => {
    const vectorRetriever = vectorStore.asRetriever({ k: 5 });
    const result = await vectorRetriever.invoke(userQuery);

    console.log(result);

    const SYSTEM_PROMPT = `
        You are an expert in answering the user query based on the provided context about document.
        Do not answer anything beyond that is not present in the document.

        Always also answer in very and tell in which page number that content is available as well as Name of the book.

        USER DOCUMENT:
        ${result
            .map((e) =>
                JSON.stringify({
                    bookName: e.metadata.source,
                    pageContent: e.pageContent,
                    pageNumber: e.metadata.loc.pageNumber,
                }),
            )
            .join('\n\n')}
    `;

    console.log(SYSTEM_PROMPT);
    const llmResponse = await openaiClient.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userQuery },
        ],
    });

    console.log('🐬', llmResponse.choices[0]?.message.content);
};

await query('What is fs module?');
