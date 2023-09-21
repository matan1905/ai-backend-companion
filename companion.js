import OpenAI from 'openai';
import express from "express";
import fs from 'fs/promises';
import path from 'path';
import bodyParser from "body-parser";

export class AiBackendCompanion{
    options = {}
    getCompletion = async (request)=>{
        return ''
    }
    getUserMessage = (request)=>{
        const cleanQuery = {...request.query, doc_should:undefined,doc_overwrite:undefined,doc_context:undefined}
        return `
        The javascript file should: ${request.query['doc_should']?? ""}
        The handler is handling the ${request.method} request for path ${request.path}
        an example of the query is:
            ${JSON.stringify(cleanQuery)}
            
        an example of the body is:
            ${JSON.stringify(request.body)}
            
        the type of the body is ${typeof request.body}

        `
    }
    getSystemMessage = (request)=>{
        return `
        Your job is to produce a javascript file contents for the user's specification.
        ${request.query['doc_context']?'The project context is: '+request.query['doc_context']:''}
        FYI, The javascript file job is to handle an http request and to return a proper response.
        you can have async functions
        answer only with the contents of the javascript file.
        do not write anything else.
        DO NOT wrap your answer in code block or any markdown block.
        Be concise, and DO NOT make assumptions about the user's code, if you need - create mock data.
        IF you HAVE to import, do NOT use require, use only import 
        Use only ES MODULE compatible code
        you may only import nodejs modules, do not import anything else, NOT EVEN relative code.
        Import only OUTSIDE of the handle function
        DO NOT USE ANY FUNCTION OR MODULE YOU DIDNT CREATE YOURSELF
        this should be the structure of your response:
        

        async function handle(query, body) {
           // logic and return
        }

        export default handle;
        `
    }
    constructor(options = {}) {
        this.options = options

        if(options.getCompletion){
            this.getCompletion = options.getCompletion
        }
        if(options.getSystemMessage){
            this.getSystemMessage = options.getSystemMessage
        }
        if(options.getUserMessage){
            this.getUserMessage = options.getUserMessage
        }
        else {
            const openai = new OpenAI({
                apiKey: options.apiKey, // defaults to process.env["OPENAI_API_KEY"]
            });
            this.getCompletion = async (request) => {
                const sysMessage = {role:"system",content:this.getSystemMessage(request)}
                const usrMessage = {role:"user",content:this.getUserMessage(request)}
                const messages = [sysMessage,usrMessage]
                const completion = await openai.chat.completions.create({
                    model: options?.model ?? 'gpt-3.5-turbo-16k',
                    messages: messages,
                });
                return completion.choices[0].message.content
            }
        }
    }
    getPaths(request){
        let serializedPath = request.method+'_index'
        if(request.path !=='/') {
            serializedPath = `${request.method}_handle${request.path.replaceAll('/', "-")}`;
        }

        // Define the directory where you want to save the file
        const saveDirectory = 'handlers'; // Update with your desired directory path

        // Construct the full path for the file
        const folderPath = path.join(process.cwd(),saveDirectory);
        const filePath = path.join(folderPath, `${serializedPath}.js`);

        return {folderPath,filePath}
    }
    async generateFile(request) {
        try {
            // Use getCompletion function to get the content
            const completionResult = await this.getCompletion(request);

            // Serialize the request path to use as the filename
            const {folderPath,filePath} =this.getPaths(request)

            await fs.mkdir(folderPath, { recursive: true })
            // Write the content to the file
            await fs.writeFile(filePath, completionResult, 'utf-8');
            console.log(`- Added new handler at ${filePath}`)
        } catch (error) {
            console.error('Error generating and saving the file:', error);
        }
    }
    async requireOrGenerateFile(request, throwOnFailure = false) {
        if(request.query['doc_overwrite']){
            await this.generateFile(request);
        }
        try {
            const {filePath} =this.getPaths(request)
            // Check if the file exists
            await fs.access(filePath, fs.constants.F_OK);

            // The file exists, so require it
            const handler = await import(filePath);
            return await handler.default(request.query, request.body)
        } catch (err) {
            if (err.code === 'ENOENT') {
                // The file doesn't exist, so generate it
                await this.generateFile(request);
                if(throwOnFailure){
                    throw "Can't create a file"
                }
                return await this.requireOrGenerateFile(request,true);
            } else {
                console.error(`Error: ${err.message}`);
            }
        }
    }
    start(port){
        const app = express()
        app.use(bodyParser.json())
        app.all('*', async (req, res) => {
            const result = await this.requireOrGenerateFile(req)
            res.send(result)
        })
        console.log(`Starting AI Backend Companion on  http://localhost:${port}`)
        app.listen(port)
    }



}