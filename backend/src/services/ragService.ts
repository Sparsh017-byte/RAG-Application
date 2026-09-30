import "dotenv/config";
import { Pinecone } from "@pinecone-database/pinecone";
import { ChatGroq } from "@langchain/groq";
import { loadAndSplitDocument } from "./prepare.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";




const pinecone = new Pinecone({
    apiKey:process.env.PINECONE_API_KEY as string,
})


const index = pinecone.index({
    host:process.env.PINECONE_INDEX_HOST_URL as string
});


const model = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY as string,
    model: "openai/gpt-oss-120b",
    temperature: 0
});


export async function ingestDocument(){
    const chunks = await loadAndSplitDocument();

    const records = chunks.map((chunk,i)=>({
        _id: `document-${i}`,
        text:chunk.pageContent,
        page: Number(chunk.metadata.loc?.pageNumber || 0)
    }))

    const batchSize = 90;

    for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);

        await index.upsertRecords({
            records: batch
        });

        console.log(
            `Uploaded ${Math.min(i + batchSize, records.length)}/${records.length} records`
        );
    }

    console.log("Document successfully stored in Pinecone");
    return {
        chunks: chunks.length
    }
}

export async function retrieveDocuments(question:string){
    const result = await index.searchRecords({
        query:{
            inputs:{
                text:question
            },
            topK:4
        }
    });

    return result;
}

export async function askQuestion(question: string){
    const result = await retrieveDocuments(question);

    const matches = result.result?.hits || [];

    const context = matches.map((match:any)=>match.fields?.text || "").filter(Boolean).join("\n\n");

    const SYSTEM_PROMPT = `You are a helpful assistant answering questions about a document.

Use only the provided context.

Rules:
- Do not make up information.
- Do not use outside knowledge.
- If the answer is not present in the context, say:
  "I don't know based on the document."
`
    const response = await model.invoke([
        new SystemMessage(SYSTEM_PROMPT),
        new HumanMessage(`Context:
            ${context}
            Question:
            ${question}
            Answer:    
        `)
    ])
    
    return {
        answer:response.content
    }
  
}