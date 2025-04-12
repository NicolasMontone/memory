    #!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';
import { logger } from './logger.js';
// Define memory file path using environment variable with fallback
const defaultMemoryPath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'memory.json');
// If MEMORY_FILE_PATH is just a filename, put it in the same directory as the script
const MEMORY_FILE_PATH = process.env.MEMORY_FILE_PATH
    ? path.isAbsolute(process.env.MEMORY_FILE_PATH)
        ? process.env.MEMORY_FILE_PATH
        : path.join(path.dirname(fileURLToPath(import.meta.url)), process.env.MEMORY_FILE_PATH)
    : defaultMemoryPath;
const EntitySchema = z.object({
    name: z.string(),
    entityType: z.string(),
    observations: z.array(z.string()),
});
const RelationSchema = z.object({
    from: z.string(),
    to: z.string(),
    relationType: z.string(),
});
const KnowledgeGraphSchema = z.object({
    entities: z.array(EntitySchema),
    relations: z.array(RelationSchema),
});
async function readMemory() {
    const data = await fs.readFile(MEMORY_FILE_PATH, 'utf-8');
    return JSON.parse(data);
}
async function saveMemory(memory) {
    const previousMemory = await readMemory();
    await fs.writeFile(MEMORY_FILE_PATH, JSON.stringify([...previousMemory, { memory, timestamp: new Date().toISOString() }]));
}
// Create the MCP server
const server = new McpServer({
    name: 'memory-server',
    version: '1.0.0',
});
server.tool("save_memory", "Call this tool every time the user says something to be remembered, like it's preferences, what its working on, etc", {
    memory: z.string().describe("Memory to save, save it in third person, as if you were a third person observer"),
}, async ({ memory }) => {
    await saveMemory(memory);
    return {
        content: [{ type: "text", text: "Memory saved" }],
    };
});
server.tool("get_all_memory", "Get all the memories of the user", {}, async () => {
    return {
        content: [{ type: "text", text: (await readMemory()).map((m) => m.memory).join("\n") }],
    };
});
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    logger.error('Knowledge Graph MCP Server running on stdio');
}
main().catch((error) => {
    logger.error('Fatal error in main():', error);
    process.exit(1);
});
