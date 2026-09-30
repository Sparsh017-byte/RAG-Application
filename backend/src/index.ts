import * as readline from "node:readline/promises";
import { askQuestion, ingestDocument } from "./services/ragService.js";
import "dotenv/config";

export async function chat(){
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })
    

    while(true){
        console.log("\n\nAsk anything related to the document \nTo end the conversation type '/bye'\n\n")
        const question = await rl.question("You:");
        if(question === '/bye')break;

        const result = await askQuestion(question);
        console.log(`AI: ${result.answer}`)
    }
    rl.close()
}

async function main() {
    await ingestDocument();
    await chat();
}

main();