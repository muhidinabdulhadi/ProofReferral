#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createProofReferralServer } from "./server.js";

const server = createProofReferralServer();
await server.connect(new StdioServerTransport());
