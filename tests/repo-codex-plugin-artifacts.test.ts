import { describe, expect, test } from "bun:test"
import { readFile } from "fs/promises"
import path from "path"

const repoRoot = path.join(import.meta.dir, "..")

async function readJson<T>(filePath: string): Promise<T> {
  const content = await readFile(filePath, "utf8")
  return JSON.parse(content) as T
}

type MarketplaceEntry = {
  name: string
  source: {
    source: string
    path: string
  }
  installPolicy: string
  authPolicy: string
  category: string
}

type MarketplaceFile = {
  name: string
  plugins: MarketplaceEntry[]
}

type CodexPluginManifest = {
  name: string
  version: string
  skills?: string
  mcpServers?: string
}

describe("repo-native codex plugin artifacts", () => {
  test("compound-engineering codex manifest points to existing skills and mcp config", async () => {
    const manifestPath = path.join(
      repoRoot,
      "plugins",
      "compound-engineering",
      ".codex-plugin",
      "plugin.json",
    )
    const manifest = await readJson<CodexPluginManifest>(manifestPath)

    expect(manifest.name).toBe("compound-engineering")
    expect(manifest.version).toBeTruthy()
    expect(manifest.skills).toBe("./skills/")
    expect(manifest.mcpServers).toBe("./.mcp.json")
  })

  test("marketplace registers compound-engineering from the local plugin path", async () => {
    const marketplacePath = path.join(repoRoot, ".agents", "plugins", "marketplace.json")
    const marketplace = await readJson<MarketplaceFile>(marketplacePath)

    const plugin = marketplace.plugins.find((entry) => entry.name === "compound-engineering")
    expect(plugin).toBeDefined()
    expect(plugin?.source.source).toBe("local")
    expect(plugin?.source.path).toBe("./plugins/compound-engineering")
    expect(plugin?.installPolicy).toBeTruthy()
    expect(plugin?.authPolicy).toBeTruthy()
    expect(plugin?.category).toBeTruthy()
  })
})
