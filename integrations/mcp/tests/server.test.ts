import { describe, expect, it, vi } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createProofReferralServer } from "../src/server.js";
import { configuredClient, requireWrite } from "../src/config.js";

async function connected() {
  vi.stubEnv("PROOFREFERRAL_WRITE_ENABLED", "false"); vi.stubEnv("PROOFREFERRAL_PRIVATE_KEY", "");
  const server = createProofReferralServer(); const client = new Client({ name: "test", version: "0.1.0" });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport); await client.connect(clientTransport); return { client, server };
}

describe("ProofReferral MCP", () => {
  it("constructs and discovers the complete safe tool surface", async () => {
    const { client } = await connected(); const result = await client.listTools(); const names = result.tools.map(tool => tool.name);
    expect(names).toContain("proofreferral_get_protocol"); expect(names).toContain("proofreferral_get_available_actions"); expect(names).toContain("proofreferral_settle_opportunity"); expect(names).not.toContain("set_judge"); expect(names).not.toContain("record_outcome"); expect(names).not.toContain("writeAnyMethod");
  });
  it("is read-only by default and rejects writes without explicit enablement", () => { vi.stubEnv("PROOFREFERRAL_WRITE_ENABLED", "false"); vi.stubEnv("PROOFREFERRAL_PRIVATE_KEY", "0x" + "1".repeat(64)); expect(configuredClient().writeEnabled).toBe(false); expect(() => requireWrite(false, undefined)).toThrow(/disabled/); });
  it("requires both signer and explicit write mode", () => { vi.stubEnv("PROOFREFERRAL_WRITE_ENABLED", "true"); vi.stubEnv("PROOFREFERRAL_PRIVATE_KEY", ""); expect(() => configuredClient()).toThrow(/requires/); expect(() => requireWrite(true, undefined)).toThrow(/signing/); });
  it("rejects malformed IDs and addresses through MCP schemas", async () => { const { client } = await connected(); const badId = await client.callTool({ name: "proofreferral_get_opportunity", arguments: { opportunityId: 0 } }); const badAddress = await client.callTool({ name: "proofreferral_get_available_actions", arguments: { opportunityId: 1, address: "not-an-address" } }); expect(badId.isError).toBe(true); expect(badAddress.isError).toBe(true); });
  it("keeps judgment and settlement delegated to the SDK", async () => { const source = await import("node:fs/promises"); const text = await source.readFile(new URL("../src/server.ts", import.meta.url), "utf8"); expect(text).toContain("client.settleOpportunity"); expect(text).not.toContain("record_outcome"); expect(text).not.toContain("evaluate_once"); });
});
