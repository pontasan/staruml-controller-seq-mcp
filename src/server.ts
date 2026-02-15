import { createServer, seqTools } from "staruml-controller-mcp-core"

export function createSeqServer() {
    return createServer("staruml-controller-seq", "1.0.0", seqTools)
}
