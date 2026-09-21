#!/usr/bin/env node

import { runStdioServer, seqTools } from "staruml-controller-mcp-core"

runStdioServer("staruml-controller-seq", "2.0.0", seqTools)
