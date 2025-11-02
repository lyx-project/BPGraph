// import { GraphContext } from '@/context/graph-context'
import { type NodeInstanceType, type LinkInstanceType, Graph, type NodeClassType } from '@bpgraph/core'
import { useRef, useEffect, useMemo } from 'react'

export type GraphViewProps<NodeDefs extends Record<string, NodeClassType>> = {
  graph: Graph<NodeDefs>
  width?: number | string
  height?: number | string
  className?: string
  children?: React.ReactNode
  onNodeClick?: (node: NodeInstanceType, event: MouseEvent) => void
  onNodeDoubleClick?: (node: NodeInstanceType, event: MouseEvent) => void
  onNodeSelection?: (nodes: NodeInstanceType[]) => void
  onBlankClick?: (event: MouseEvent) => void
  onBlankDoubleClick?: (event: MouseEvent) => void
  onLinkClick?: (link: LinkInstanceType, event: MouseEvent) => void
  onDragStart?: (node: NodeInstanceType) => void
  onDrag?: (node: NodeInstanceType) => void
  onDragEnd?: (node: NodeInstanceType) => void
  onStartConnecting?: () => void
  onKeyDown?: (event: React.KeyboardEvent) => void
  options?: {
    background?: string
    gridSize?: number
    drawGrid?: {
      size?: number
      color?: string
      thickness?: number
    }
  }
}

export function GraphView<NodeDefs extends Record<string, NodeClassType>>({
  width = '100%',
  height = '100%',
  graph,
  className,
  children,
  options,
  onNodeClick,
  onNodeDoubleClick,
  onNodeSelection,
  onBlankClick,
  onBlankDoubleClick,
  onLinkClick,
  onDragStart,
  onDrag,
  onDragEnd,
  onStartConnecting,
  onKeyDown,
}: GraphViewProps<NodeDefs>) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  const handleNodeClick = (node: NodeInstanceType, event: MouseEvent) => {
    onNodeClick?.(node, event)
  }

  const handleNodeDoubleClick = (node: NodeInstanceType, event: MouseEvent) => {
    onNodeDoubleClick?.(node, event)
  }

  const handleSelectionChanged = (nodes: (NodeInstanceType | LinkInstanceType)[]) => {
    onNodeSelection?.(nodes.filter((n) => n instanceof Graph.NodeInstance) as NodeInstanceType[])
  }

  const handleBlankClick = (event: MouseEvent) => {
    onBlankClick?.(event)
  }

  const handleBlankDoubleClick = (event: MouseEvent) => {
    onBlankDoubleClick?.(event)
  }

  const handleLinkClick = (link: LinkInstanceType, event: MouseEvent) => {
    onLinkClick?.(link, event)
  }

  const handleDragStart = (node: NodeInstanceType) => {
    onDragStart?.(node)
  }
  const handleDrag = (node: NodeInstanceType) => {
    onDrag?.(node)
  }
  const handleDragEnd = (node: NodeInstanceType) => {
    onDragEnd?.(node)
  }
  const handleStartConnecting = () => {
    onStartConnecting?.()
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    onKeyDown?.(event)
  }

  useMemo(() => {
    if (!graph) return
    graph.setOptions(options)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!graph || !containerRef.current) return
    graph.setContainer(containerRef.current as HTMLDivElement)
    graph.on('node:click', handleNodeClick)
    graph.on('node:dblclick', handleNodeDoubleClick)
    graph.on('selection:changed', handleSelectionChanged)
    graph.on('blank:click', handleBlankClick)
    graph.on('blank:dblclick', handleBlankDoubleClick)
    graph.on('link:click', handleLinkClick)
    graph.on('node:dragstart', handleDragStart)
    graph.on('node:dragmove', handleDrag)
    graph.on('node:dragend', handleDragEnd)
    graph.on('start:connecting', handleStartConnecting)
    return () => {
      graph.off('node:click', handleNodeClick)
      graph.off('node:dblclick', handleNodeDoubleClick)
      graph.off('selection:changed', handleSelectionChanged)
      graph.off('blank:click', handleBlankClick)
      graph.off('blank:dblclick', handleBlankDoubleClick)
      graph.off('link:click', handleLinkClick)
      graph.off('node:dragstart', handleDragStart)
      graph.off('node:dragmove', handleDrag)
      graph.off('node:dragend', handleDragEnd)
      graph.off('start:connecting', handleStartConnecting)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div style={{ position: 'relative', width, height }}>
      <div
        style={{ width: '100%', height: '100%' }}
        className={className}
        onKeyDown={handleKeyDown}
        ref={containerRef}
      ></div>
      {children}
    </div>
  )
}
