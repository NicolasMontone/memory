# memory


To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.2.2. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.


Integrate it with claude

```json
{
  "mcpServers": {
    "memory-server": {
      "command": "node",
      "args": [
        "/Users/YOUR_USER/mcp-server/build/index.js"
      ]
    }
  }
}
```
