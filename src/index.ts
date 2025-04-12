#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js'
import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { z } from 'zod'

import { logger } from './logger.js'

// Define memory file path using environment variable with fallback
const defaultMemoryPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'memory.json'
)

// If MEMORY_FILE_PATH is just a filename, put it in the same directory as the script
const MEMORY_FILE_PATH = process.env.MEMORY_FILE_PATH
  ? path.isAbsolute(process.env.MEMORY_FILE_PATH)
    ? process.env.MEMORY_FILE_PATH
    : path.join(
        path.dirname(fileURLToPath(import.meta.url)),
        process.env.MEMORY_FILE_PATH
      )
  : defaultMemoryPath

const EntitySchema = z.object({
  name: z.string(),
  entityType: z.string(),
  observations: z.array(z.string()),
})

const RelationSchema = z.object({
  from: z.string(),
  to: z.string(),
  relationType: z.string(),
})

const KnowledgeGraphSchema = z.object({
  entities: z.array(EntitySchema),
  relations: z.array(RelationSchema),
})

type Entity = z.infer<typeof EntitySchema>
type Relation = z.infer<typeof RelationSchema>
type KnowledgeGraph = z.infer<typeof KnowledgeGraphSchema>

class KnowledgeGraphManager {
  private async loadGraph(): Promise<KnowledgeGraph> {
    try {
      const data = await fs.readFile(MEMORY_FILE_PATH, 'utf-8')
      const lines = data.split('\n').filter((line) => line.trim() !== '')
      const graph = lines.reduce(
        (acc: KnowledgeGraph, line) => {
          const item = JSON.parse(line)
          if (item.type === 'entity') {
            acc.entities.push(EntitySchema.parse(item))
          }
          if (item.type === 'relation') {
            acc.relations.push(RelationSchema.parse(item))
          }
          return acc
        },
        { entities: [], relations: [] }
      )
      return KnowledgeGraphSchema.parse(graph)
    } catch (error) {
      if (
        error instanceof Error &&
        'code' in error &&
        (error as any).code === 'ENOENT'
      ) {
        return { entities: [], relations: [] }
      }
      throw error
    }
  }

  private async saveGraph(graph: KnowledgeGraph): Promise<void> {
    const lines = [
      ...graph.entities.map((e) => JSON.stringify({ type: 'entity', ...e })),
      ...graph.relations.map((r) => JSON.stringify({ type: 'relation', ...r })),
    ]
    await fs.writeFile(MEMORY_FILE_PATH, lines.join('\n'))
  }

  async createEntities(entities: Entity[]): Promise<Entity[]> {
    const graph = await this.loadGraph()
    const newEntities = entities.filter(
      (e) =>
        !graph.entities.some((existingEntity) => existingEntity.name === e.name)
    )
    graph.entities.push(...newEntities)
    await this.saveGraph(graph)
    return newEntities
  }

  async createRelations(relations: Relation[]): Promise<Relation[]> {
    const graph = await this.loadGraph()
    const newRelations = relations.filter(
      (r) =>
        !graph.relations.some(
          (existingRelation) =>
            existingRelation.from === r.from &&
            existingRelation.to === r.to &&
            existingRelation.relationType === r.relationType
        )
    )
    graph.relations.push(...newRelations)
    await this.saveGraph(graph)
    return newRelations
  }

  async addObservations(
    observations: { entityName: string; contents: string[] }[]
  ): Promise<{ entityName: string; addedObservations: string[] }[]> {
    const graph = await this.loadGraph()
    const results = observations.map((o) => {
      const entity = graph.entities.find((e) => e.name === o.entityName)
      if (!entity) {
        throw new Error(`Entity with name ${o.entityName} not found`)
      }
      const newObservations = o.contents.filter(
        (content) => !entity.observations.includes(content)
      )
      entity.observations.push(...newObservations)
      return { entityName: o.entityName, addedObservations: newObservations }
    })
    await this.saveGraph(graph)
    return results
  }

  async deleteEntities(entityNames: string[]): Promise<void> {
    const graph = await this.loadGraph()
    graph.entities = graph.entities.filter((e) => !entityNames.includes(e.name))
    graph.relations = graph.relations.filter(
      (r) => !entityNames.includes(r.from) && !entityNames.includes(r.to)
    )
    await this.saveGraph(graph)
  }

  async deleteObservations(
    deletions: { entityName: string; observations: string[] }[]
  ): Promise<void> {
    const graph = await this.loadGraph()
    deletions.forEach((d) => {
      const entity = graph.entities.find((e) => e.name === d.entityName)
      if (entity) {
        entity.observations = entity.observations.filter(
          (o) => !d.observations.includes(o)
        )
      }
    })
    await this.saveGraph(graph)
  }

  async deleteRelations(relations: Relation[]): Promise<void> {
    const graph = await this.loadGraph()
    graph.relations = graph.relations.filter(
      (r) =>
        !relations.some(
          (delRelation) =>
            r.from === delRelation.from &&
            r.to === delRelation.to &&
            r.relationType === delRelation.relationType
        )
    )
    await this.saveGraph(graph)
  }

  async readGraph(): Promise<KnowledgeGraph> {
    return this.loadGraph()
  }

  async searchNodes(query: string): Promise<KnowledgeGraph> {
    const graph = await this.loadGraph()
    const filteredEntities = graph.entities.filter(
      (e) =>
        e.name.toLowerCase().includes(query.toLowerCase()) ||
        e.entityType.toLowerCase().includes(query.toLowerCase()) ||
        e.observations.some((o) =>
          o.toLowerCase().includes(query.toLowerCase())
        )
    )
    const filteredEntityNames = new Set(filteredEntities.map((e) => e.name))
    const filteredRelations = graph.relations.filter(
      (r) => filteredEntityNames.has(r.from) && filteredEntityNames.has(r.to)
    )
    return {
      entities: filteredEntities,
      relations: filteredRelations,
    }
  }

  async openNodes(names: string[]): Promise<KnowledgeGraph> {
    const graph = await this.loadGraph()
    const filteredEntities = graph.entities.filter((e) =>
      names.includes(e.name)
    )
    const filteredEntityNames = new Set(filteredEntities.map((e) => e.name))
    const filteredRelations = graph.relations.filter(
      (r) => filteredEntityNames.has(r.from) && filteredEntityNames.has(r.to)
    )
    return {
      entities: filteredEntities,
      relations: filteredRelations,
    }
  }
}

const knowledgeGraphManager = new KnowledgeGraphManager()

// Create the MCP server
const server = new McpServer({
  name: 'memory-server',
  version: '1.0.0',
})

// Register tools
server.tool(
  'create_entities',
  'Create multiple new entities in the knowledge graph',
  {
    entities: z.array(EntitySchema),
  },
  async (args) => {
    try {
      const result = await knowledgeGraphManager.createEntities(args.entities)
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      }
    } catch (error) {
      logger.error('Failed to create entities', {
        error: error instanceof Error ? error.message : String(error),
      })
      throw new McpError(ErrorCode.InternalError, 'Failed to create entities')
    }
  }
)

server.tool(
  'create_relations',
  'Create multiple new relations between entities in the knowledge graph',
  {
    relations: z.array(RelationSchema),
  },

  async (args) => {
    try {
      const result = await knowledgeGraphManager.createRelations(args.relations)
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      }
    } catch (error) {
      logger.error('Failed to create relations', {
        error: error instanceof Error ? error.message : String(error),
      })
      throw new McpError(ErrorCode.InternalError, 'Failed to create relations')
    }
  }
)

server.tool(
  'add_observations',
  'Add new observations to existing entities in the knowledge graph',
  {
    observations: z.array(
      z.object({
        entityName: z.string(),
        contents: z.array(z.string()),
      })
    ),
  },
  async (args) => {
    try {
      const result = await knowledgeGraphManager.addObservations(
        args.observations
      )
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      }
    } catch (error) {
      logger.error('Failed to add observations', {
        error: error instanceof Error ? error.message : String(error),
      })
      throw new McpError(ErrorCode.InternalError, 'Failed to add observations')
    }
  }
)

server.tool(
  'delete_entities',
  'Delete multiple entities and their associated relations from the knowledge graph',
  {
    entityNames: z.array(z.string()),
  },
  async (args) => {
    try {
      await knowledgeGraphManager.deleteEntities(args.entityNames)
      return {
        content: [{ type: 'text', text: 'Entities deleted successfully' }],
      }
    } catch (error) {
      logger.error('Failed to delete entities', {
        error: error instanceof Error ? error.message : String(error),
      })
      throw new McpError(ErrorCode.InternalError, 'Failed to delete entities')
    }
  }
)

server.tool(
  'delete_observations',
  'Delete specific observations from entities in the knowledge graph',
  {
    deletions: z.array(
      z.object({
        entityName: z.string(),
        observations: z.array(z.string()),
      })
    ),
  },
  async (args) => {
    try {
      await knowledgeGraphManager.deleteObservations(args.deletions)
      return {
        content: [{ type: 'text', text: 'Observations deleted successfully' }],
      }
    } catch (error) {
      logger.error('Failed to delete observations', {
        error: error instanceof Error ? error.message : String(error),
      })
      throw new McpError(
        ErrorCode.InternalError,
        'Failed to delete observations'
      )
    }
  }
)

server.tool(
  'delete_relations',
  'Delete multiple relations from the knowledge graph',
  {
    relations: z.array(RelationSchema),
  },
  async (args) => {
    try {
      await knowledgeGraphManager.deleteRelations(args.relations)
      return {
        content: [{ type: 'text', text: 'Relations deleted successfully' }],
      }
    } catch (error) {
      logger.error('Failed to delete relations', {
        error: error instanceof Error ? error.message : String(error),
      })
      throw new McpError(ErrorCode.InternalError, 'Failed to delete relations')
    }
  }
)

server.tool('read_graph', 'Read the entire knowledge graph', {}, async () => {
  try {
    const result = await knowledgeGraphManager.readGraph()
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    }
  } catch (error) {
    logger.error('Failed to read graph', {
      error: error instanceof Error ? error.message : String(error),
    })
    throw new McpError(ErrorCode.InternalError, 'Failed to read graph')
  }
})

server.tool(
  'search_nodes',
  'Search for nodes in the knowledge graph based on a query',
  {
    query: z.string(),
  },
  async (args) => {
    try {
      const result = await knowledgeGraphManager.searchNodes(args.query)
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      }
    } catch (error) {
      logger.error('Failed to search nodes', {
        error: error instanceof Error ? error.message : String(error),
      })
      throw new McpError(ErrorCode.InternalError, 'Failed to search nodes')
    }
  }
)

server.tool(
  'open_nodes',
  'Open specific nodes in the knowledge graph by their names',
  {
    names: z.array(z.string()),
  },
  async (args) => {
    try {
      const result = await knowledgeGraphManager.openNodes(args.names)
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      }
    } catch (error) {
      logger.error('Failed to open nodes', {
        error: error instanceof Error ? error.message : String(error),
      })
      throw new McpError(ErrorCode.InternalError, 'Failed to open nodes')
    }
  }
)

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  logger.error('Knowledge Graph MCP Server running on stdio')
}

main().catch((error) => {
  logger.error('Fatal error in main():', error)
  process.exit(1)
})
