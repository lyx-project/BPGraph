import type { Graph, NodeInstanceType, LinkInstanceType } from '../Graph'
import { BlueprintModel } from '../GraphModel';
import type { OutputPort } from '../Node';
import type { NodeStyle, LinkStyle } from '../NodeRegistry';

export interface JsonNode {
  position: { x: number; y: number }
  title?: string
  id: string
  type: string
  nodeType: string
  data?: unknown
  values: Record<string, unknown>
  subgraphId?: string
  inputs: {
    name: string
    id: string
    label?: string
    type?: string
    options?: {label: string, value: string}[]
    showPort?: boolean
    showInput?: boolean
  }[]
  outputs: {
    name: string
    id: string
    label?: string
    type?: string
    showPort?: boolean
  }[]
  style?: NodeStyle
}

export interface JsonLink {
  id: string
  source: {
    id: string
    port: string
  }
  target: {
    id: string
    port: string
  }
  style?: LinkStyle
}

export interface JsonVariable {
  name: string
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'any'
  value: unknown
}

export interface JsonGraph {
  nodes: JsonNode[]
  links: JsonLink[]
  variables: JsonVariable[]
  subgraphs: Record<string, { nodes: JsonNode[]; links: JsonLink[], viewport: { x: number, y: number, zoom: number } }>
  viewport: {
    x: number
    y: number
    zoom: number
  }
}

export function serializeNodes(nodes: NodeInstanceType[]): JsonNode[] {
  const jsonNodes: JsonNode[] = []
  for (const node of nodes) {
    const jsonNode: JsonNode = {
      position: { ...node.position },
      id: node.id,
      type: node.type,
      nodeType: node.nodeType,
      values: { ...node.values },
      inputs: node.inputs.map(input => ({ name: input.name, id: input.id! })),
      outputs: node.outputs.map(output => ({ name: output.name, id: output.id! })),
    }

    if (node.data) jsonNode.data = node.data
    if (node.states.title) jsonNode.title = node.states.title
    if (node.states.style) jsonNode.style = node.states.style
    if (node.subgraphId) jsonNode.subgraphId = node.subgraphId
    if (node.states.inputs) jsonNode.inputs = node.states.inputs.map(input => {
      const obj: JsonNode['inputs'][number] = {
        id: input.id!,
        name: input.name,
        type: input.type,
      }
      if (input.label) obj.label = input.label
      if (Array.isArray(input.options)) obj.options = input.options ? Array.from(input.options) : undefined
      if (input.showInput !== undefined) obj.showInput = input.showInput
      if (input.showPort !== undefined) obj.showPort = input.showPort
      return obj
    })
      if (node.states.outputs) jsonNode.outputs = node.states.outputs.map(output => {
        const obj: JsonNode['outputs'][number] = {
          id: output.id!,
          name: output.name,
          type: output.type,
        }
        if (output.label) obj.label = output.label
        return obj
      })
    jsonNodes.push(jsonNode)
  }
  return jsonNodes
}

export function serializeLinks(links: { id?: string; source: { id: string; port: string }; target: { id: string; port: string }; style?: LinkStyle }[]): JsonLink[] {
  const jsonLinks: JsonLink[] = []
  for (const link of links) {
    const jsonLink: JsonLink = {
      id: link.id!,
      source: { ...link.source },
      target: { ...link.target },
    }
    if (link.style) jsonLink.style = link.style
    jsonLinks.push(jsonLink)
  }
  return jsonLinks
}

export function toJSON(model: BlueprintModel): JsonGraph {
  const json: JsonGraph = {
    nodes: [],
    links: [],
    variables: [],
    subgraphs: {},
    viewport: { x: model.root.viewport.x, y: model.root.viewport.y, zoom: model.root.viewport.scale }
  }

  const nodes = model.root.nodes
  const links = model.root.links
  const variables = model.variableManager.getAllVariables()
  const subgraphs = model.subgraphs

  json.nodes = serializeNodes(nodes)

  for (const [subgraphId, subgraph] of subgraphs) {
    const subgraphNodes = subgraph.nodes
    const subgraphLinks = subgraph.links
    json.subgraphs[subgraphId] = {
      nodes: serializeNodes(subgraphNodes),
      links: serializeLinks(subgraphLinks),
      viewport: { x: subgraph.viewport.x, y: subgraph.viewport.y, zoom: subgraph.viewport.scale }
    }
  }

  for (const variable of variables) {
    json.variables.push({
      name: variable.name,
      type: variable.type,
      value: variable.value
    })
  }
  json.links = serializeLinks(links)
  return json
}

export function deserializeNodes(graph: Graph, jsonNodes: JsonNode[]): NodeInstanceType[] {
  const nodes: NodeInstanceType[] = []
  for (const jsonNode of jsonNodes) {
    const node = graph.createNodeInstance(jsonNode.nodeType as unknown as never, {
      position: { ...jsonNode.position },
      title: jsonNode.title,
      data: jsonNode.data,
      values: { ...jsonNode.values },
      id: jsonNode.id,
      style: jsonNode.style,
      subgraphId: jsonNode.subgraphId,
      inputs: jsonNode.inputs.some(input => input.type) ? jsonNode.inputs.map(i => ({
        ...i,
        type: i.type as keyof typeof i.type,
      })) : undefined,
      outputs: jsonNode.outputs.some(output => output.type) ? jsonNode.outputs.map(o => ({
        ...o,
        type: o.type as OutputPort['type'],
      })) : undefined,
    }) as NodeInstanceType

    if (!node.states.inputs) {
      for (const jsonInput of jsonNode.inputs) {
        const input = node.inputs.find((i) => i.name === jsonInput.name)
        if (input) input.id = jsonInput.id
      }
    }

    if (!node.states.outputs) {
      for (const jsonOutput of jsonNode.outputs) {
        const output = node.outputs.find((o) => o.name === jsonOutput.name)
        if (output) output.id = jsonOutput.id
      }
    }

    nodes.push(node)
  }
  return nodes
}

export function deserializeLinks(graph: Graph, jsonLinks: JsonLink[]): { id?: string; source: { id: string; port: string }; target: { id: string; port: string }; style?: LinkStyle }[] {
  const links = []
  for (const jsonLink of jsonLinks) {
    const link = graph.createLinkInstance(jsonLink)
    if (jsonLink.id) link.id = jsonLink.id
    if (jsonLink.source) link.source = { ...jsonLink.source }
    if (jsonLink.target) link.target = { ...jsonLink.target }
    if (jsonLink.style) link.style = jsonLink.style
    links.push(link)
  }
  return links
}

export function fromJSON(graph: Graph, json: JsonGraph | string) {
  if (typeof json === 'string') {
    json = JSON.parse(json) as JsonGraph
  }

  const jsonNodes = json.nodes
  const jsonLinks = json.links
  const jsonVariables = json.variables
  const jsonSubgraphs = json.subgraphs


  const nodes = deserializeNodes(graph, jsonNodes)
  const links = deserializeLinks(graph, jsonLinks)

  const subgraphs: { [id: string]: { nodes: NodeInstanceType[]; links: LinkInstanceType[], viewport: { x: number, y: number, zoom: number } } } = {}
  for (const subgraphId in jsonSubgraphs) {
    subgraphs[subgraphId] = { nodes: [], links: [], viewport: { x: 0, y: 0, zoom: 1 } }
    const subgraphData = jsonSubgraphs[subgraphId]
    subgraphs[subgraphId].nodes = deserializeNodes(graph, subgraphData.nodes)
    subgraphs[subgraphId].links = deserializeLinks(graph, subgraphData.links) as LinkInstanceType[]
    subgraphs[subgraphId].viewport = { x: subgraphData.viewport.x, y: subgraphData.viewport.y, zoom: subgraphData.viewport.zoom }
  }

  return { nodes, links, subgraphs, variables: jsonVariables, viewport: json.viewport }
}
