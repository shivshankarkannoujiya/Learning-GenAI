import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { vectorStore } from './utils/store.js';

const generateVectorEmbeddingsForFile = async (filePath: string) => {
    const loader = new PDFLoader(filePath);
    const documents = await loader.load();

    console.log(documents); // Array documents[Document]

    /*
    documents (Array)
│
├── documents[0]
│     │
│     ├── pageContent
│     │      "What is RAG?
│     │       RAG stands for..."
│     │
│     └── metadata
│            │
│            ├── source: "./node.pdf"
│            ├── page: 1
│            └── totalPages: 2
│
└── documents[1]
      │
      ├── pageContent
      │      "Advantages..."
      │
      └── metadata
             ├── source: "./node.pdf"
             ├── page: 2
             └── totalPages: 2
    */

    vectorStore.addDocuments(documents);
    console.log('All the documents are indexed...');
};

await generateVectorEmbeddingsForFile('./node.pdf');
