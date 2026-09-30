# ProofReferral integrations

ProofReferral contracts remain the authority. The SDK lets applications use the protocol, the MCP server lets agents call the SDK through STDIO, and the portable Skill teaches agents the correct lifecycle and safety rules. The existing frontend remains an independent client.

The frozen v1 packages are publicly available on npm:

```sh
npm install @proofreferral/sdk
npx @proofreferral/mcp
```

Current public versions:

- `@proofreferral/sdk@0.1.0`
- `@proofreferral/mcp@0.1.0`

See `integrations/sdk/README.md`, `integrations/mcp/README.md`, and `.agents/skills/proofreferral/SKILL.md` for source-level details.

Dependency review: production dependencies report zero advisories. The full development install currently reports five moderate transitive advisories through the pinned GenLayer test toolchain (`vitest` and `dockerode`/`uuid`). The available remediation requires a breaking GenLayer toolchain change, so no blind upgrade was applied to the finished deployment-compatible stack.
