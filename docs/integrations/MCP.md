# MCP

`@proofreferral/mcp@0.1.0` is the public npm package for the frozen v1 ProofReferral STDIO MCP server. It is built on `@proofreferral/sdk` and is read-only by default.

Run it directly from npm:

```sh
npx @proofreferral/mcp
```

Example MCP client configuration:

```json
{
  "mcpServers": {
    "proofreferral": {
      "command": "npx",
      "args": ["-y", "@proofreferral/mcp"],
      "env": {
        "PROOFREFERRAL_WRITE_ENABLED": "false"
      }
    }
  }
}
```

Writes require both `PROOFREFERRAL_PRIVATE_KEY` and `PROOFREFERRAL_WRITE_ENABLED=true`. Keep credentials in process environment only. Do not place secrets in tool arguments or configuration committed to Git. The server does not expose arbitrary contract calls or off-chain judgment.
