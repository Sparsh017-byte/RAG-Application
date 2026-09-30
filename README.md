# RAG Project

This project is a lightweight Retrieval-Augmented Generation (RAG) application built for answering questions from a PDF document. It reads a PDF, splits it into smaller text chunks, stores those chunks in Pinecone, and then uses a Groq-hosted LLM to answer user questions using the most relevant chunks as context.

## Project purpose

The goal of this app is to let you ask questions about a document without manually reading everything. Instead of passing the whole PDF to the model, the app:

1. Loads a PDF file
2. Splits it into chunks
3. Stores the chunks in a vector database (Pinecone)
4. Finds the most relevant chunks for a question
5. Sends those chunks as context to a language model
6. Returns an answer based only on the document content

This is a classic RAG workflow for document Q&A.

## Project structure

```text
RAG/
├── README.md
├── backend/
│   ├── .env
│   ├── package.json
│   ├── tsconfig.json
│   ├── dist/                  # generated after build
│   ├── node_modules/         # installed dependencies
│   ├── files/
│   │   └── Tigers.pdf        # sample PDF used by the app
│   └── src/
│       ├── index.ts          # CLI entry point
│       └── services/
│           ├── prepare.ts    # PDF loading + chunk splitting
│           └── ragService.ts # Pinecone ingestion + query + LLM response
```

## Main files and their role

### backend/package.json
This file defines the project scripts and dependencies.

Scripts:

```bash
npm install
npm run dev
npm run build
npm start
```

- `npm run dev`: runs the app in development mode using `tsx`
- `npm run build`: compiles TypeScript into JavaScript
- `npm start`: runs the compiled app from `dist/`

### backend/src/index.ts
This is the entry point of the application.

It:
- loads the document into Pinecone
- starts an interactive terminal chat loop
- reads user questions from the terminal
- calls the RAG service to answer them

### backend/src/services/prepare.ts
This file handles loading the PDF and splitting it into smaller text chunks.

Important details:
- Uses `PDFLoader` from LangChain to read the PDF
- Uses `RecursiveCharacterTextSplitter` to split the PDF into manageable chunks
- Default chunk size is around `1000` characters with `200` characters overlap

### backend/src/services/ragService.ts
This is the core RAG logic.

It does the following:
- creates a Pinecone client
- connects to the configured Pinecone index
- loads the split document chunks
- uploads records to Pinecone with `upsertRecords`
- searches for the most relevant document chunks using semantic similarity
- builds a prompt with the retrieved context
- sends the context and question to a Groq model
- returns the answer

## Tech stack

This project uses:

- Node.js + TypeScript
- LangChain
- Pinecone vector database
- Groq LLM
- PDF parsing via `pdf-parse` and LangChain PDF loader
- dotenv for environment variables

## Setup instructions

### 1. Open the backend folder

```bash
cd backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

The project expects a `.env` file in the `backend` folder. Example:

```env
PORT=5000
PDF_FILE_PATH=your_file_path.pdf
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_HOST_URL=your_pinecone_index_host
GROQ_API_KEY=your_groq_api_key
```

Notes:
- `PDF_FILE_PATH` should point to the PDF you want to use
- `PINECONE_API_KEY` is your Pinecone access key
- `PINECONE_INDEX_HOST_URL` is the host URL for your Pinecone vector index
- `GROQ_API_KEY` is required for the model used in the answer generation step

### 4. Prepare your data source

The sample file currently lives in:

```text
backend/files/Tigers.pdf
```

You can replace this file with another PDF if you want to ask questions about a different document.

### 5. Run the app

```bash
npm run dev
```

This starts the terminal-based chat app. It will:
- ingest the PDF document
- ask the user a question from the terminal
- return an answer based on the document

### 6. Stop the conversation

Type:

```text
/bye
```

This exits the chat loop.

## How the app works internally

The flow is:

```text
PDF file
  -> load document
  -> split into text chunks
  -> store chunks in Pinecone
  -> ask a question
  -> retrieve the top relevant chunks
  -> inject context into Groq model
  -> return a grounded answer
```

This means the response is based on document context, not on random internet knowledge.

## Important notes

- The app currently runs as a terminal-based chat interface, not a web app.
- The `.env` file should not be committed to source control if it contains real secrets.
- Pinecone must already have an index created and reachable via the provided host URL.
- The model is configured as `openai/gpt-oss-120b` through Groq.

## Typical usage example

```bash
cd backend
npm install
npm run dev
```

Then in the prompt:

```text
Ask anything related to the document
You: What is this document about?
```

The app will search the stored chunks and answer using the document context.

## Summary

This project is a small but complete RAG application for PDF-based Q&A. It demonstrates the end-to-end architecture of loading documents, indexing them in a vector database, retrieving relevant information, and generating context-aware responses with an LLM.

## Demo Question Based on Tigers.pdf file

Ask anything related to the document 
To end the conversation type '/bye'

You:whats the total population of tigers in india
AI: Based on the document, the 2022 estimate for the total wild tiger population in India is about **3,682 tigers** (with a reported range of roughly 3,167 to 3,925).


You:what neccessary steps were taken for tiger conservation in india
AI: The document lists a series of actions that have been taken in India to conserve tigers:

1. **Creation of inviolate core areas** – protected zones where human activity is strictly limited.  
2. **Relocation of villages from core zones** – moving people out of the most sensitive tiger habitats.  
3. **Ban on hunting** – making it illegal to hunt tigers (and other wildlife).  
4. **Stopping commercial timber extraction in cores** – halting logging that degrades tiger habitat.  
5. **Deployment of guards and infrastructure** – establishing a permanent protection presence on the ground.  

These early measures were followed by the launch of **Project Tiger** (1 April 1973), which added further steps:

6. **Establishment of a centrally‑sponsored scheme** with nine initial tiger reserves covering about 9,000 km².  
7. **Formation of a statutory body** – the National Tiger Conservation Authority (NTCA) (statutory since 2006) to oversee the programme.  
8. **Legal protection** – tigers placed under Schedule I of the Wildlife (Protection) Act, 1972.  
9. **Regular tiger censuses** – a nation‑wide tiger estimation carried out every four years.  
10. **Adoption of Conservation Assured Tiger Standards (CA|TS)** – minimum standards for tiger conservation that many reserves have been accredited to.  
11. **Dedicated funding** – central government grants of several hundred crore rupees each year, supplemented by state budgets, compensatory afforestation funds,CSR contributions and tourism revenue, all earmarked for protection, habitat management, staff, relocation and monitoring.

Together, these steps constitute the core strategy that India has used to conserve its tiger populations.

You:/bye
