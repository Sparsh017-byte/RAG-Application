import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import "dotenv/config";

export async function loadAndSplitDocument(){
    const filePath = process.env.PDF_FILE_PATH;
    const loader = new PDFLoader(filePath as string,{
        splitPages:true
    })

    const pages = await loader.load()


    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize:1000,
        chunkOverlap:200
    })

    const chunks = await splitter.splitDocuments(pages)
    console.log(`Total chunks: ${chunks.length}`);
    return chunks;
}