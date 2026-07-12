/**
 
  - Conver the userQuery to Vector Embedding
  - Search the vectors in the Qdrant DB
  - get similar vectors and chunks
  - Feed those chunks to LLM model & do a simple chat with userQuery
 */

import { openaiClient } from './utils/openaiClient.js';
import { vectorStore } from './utils/store.js';

const query = async (userQuery: string) => {
    const QUERY_SYSTEM_PROMPT = `
        You are an expert Query Rewriting AI for a Retrieval-Augmented Generation (RAG) system.

        Your task is to rewrite the user's query to maximize semantic retrieval from the vector database.

        Rules:
            - Preserve the original intent exactly.
            - Do not answer the question.
            - Do not introduce new facts or assumptions.
            - Expand the query with relevant synonyms, alternative terminology, abbreviations, and domain-specific keywords when appropriate.
            - Make implicit concepts explicit only if they are clearly implied by the user's query.
            - Return only the rewritten query.
            - Do not include explanations, notes, bullet points, or markdown.

        User Query:
        ${userQuery}
    `;

    const response = await openaiClient.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            { role: 'system', content: QUERY_SYSTEM_PROMPT },
            { role: 'user', content: userQuery },
        ],
    });

    const enhancedQuery = response.choices[0]?.message.content;
    console.log(enhancedQuery);

    const vectorRetriever = vectorStore.asRetriever({ k: 5 });
    const result = await vectorRetriever.invoke(userQuery);

    // console.log(result);

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

    // console.log(SYSTEM_PROMPT);
    const llmResponse = await openaiClient.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: enhancedQuery! },
        ],
    });

    console.log('🐬', llmResponse.choices[0]?.message.content);
};

await query('How to create http server ?');
