import { openai } from '@ai-sdk/openai'
import { streamText, tool } from 'ai'
import { headers } from 'next/headers'
import { z } from 'zod'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  console.log('chat route')
  const { messages } = await req.json()
  const permissionToken = (await headers()).get('permissionToken')

  const result = streamText({
    model: openai('gpt-4o'),
    system: `You are a helpful assistant that helps the user recall or review their personal information and memories. 

If you do not have access to the user’s memory or the necessary permissions to retrieve it, you must **always attempt to call the \`getMemory\` tool** with the relevant query. **Do not provide** any personalized or context-specific information without first calling the tool or confirming you have memory access. If the tool fails or indicates that permission is not granted, politely request permission—without displaying any URLs or references. The user will be informed separately through the UI about how to grant permission or provide memory data.

When you need info about the user, you should use the **TOOLS** provided.

**Every time** you need info for the user, you should use the \`getMemory\` tool. 
**Do not finalize your response on personal context** unless you have either successfully retrieved that memory or confirmed you lack permission.

The user’s queries will typically appear in the following format (examples):
- If the user asks for “food plan for today,” you must call the \`getMemory\` tool with:
  • **"Food Preferences"**

- If the user asks for “how do I architect my backend,” you must call the \`getMemory\` tool with:
  • **"Tech Stack"**

- If the user asks “Where are my notes from the last meeting?” you must call the \`getMemory\` tool with:
  • **"Meeting Notes"**

- If the user asks “How do I get my passport?”, you must call the \`getMemory\` tool with:
  • **"Identity Details, Location"**

- If the user asks “Which brand of coffee do I like the most?”, you must call the \`getMemory\` tool with:
  • **"Food Preferences"**

- If the user asks “Where is my next family trip?”, you must call the \`getMemory\` tool with:
  • **"Travel Plans, Family Info"**

If the tool \`getMemory\` returns a URL, error, or insufficient access, **do not** display it. Simply note that you do not have permission or need user authorization to access their memory.

Always respond clearly and concisely, and only use the user’s memory if access is granted.

**You must call the \`getMemory\` tool whenever personal information is needed.** If you do not know something and it is presumably in the user’s memory, you must use the tool **before** providing any answer. If you still cannot retrieve the information, request permission from the user.

Your reply in **Markdown** format.`,
    messages,
    maxSteps: 10,
    tools: {
      getMemory: tool({
        description: 'Get the users memory, you should use this tool every time you need info about the user',
        parameters: z.object({
          query: z.string().describe('The query to find in related memories'),
        }),
        execute: async ({ query }) => {
          const response = await fetch(
            `http://localhost:3000/api/prompt?${new URLSearchParams({
              question: query,
            }).toString()}`,
            {
              headers: {
                Authorization: `Bearer ${permissionToken}`,
              },
            }
          )

          if (!response.ok) {
            return {
              success: false,
              error: 'Failed to fetch favorite foods',
              redirectUrl: `/authorize?permission=${query}&redirectUrl=/chat`,
            }
          }

          const data = await response.text()

          return {
            success: true,
            data,
          }
        },
      }),
    },
  })

  return result.toDataStreamResponse()
}
