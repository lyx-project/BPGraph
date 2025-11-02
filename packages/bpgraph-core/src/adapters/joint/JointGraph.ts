import { dia, shapes, config, anchors, connectors, highlighters } from '@joint/core'
import { BlueprintNode } from './nodes/BlueprintNode'
import { BlueprintNodeView } from './nodes/BlueprintNodeView'
import { ScrollerController } from './ScrollerController'
import { SelectionController } from './SelectionController'
import { GroupEffectController } from './GroupEffectController'
import type { GraphAdapter } from '..//GraphAdapter'
import type { NodeInstanceType } from '../../Graph'
import type { NodeStyle, LinkStyle } from '../../NodeRegistry'
import type { LinkInstanceType } from '../../Graph'
import type { OutputPort } from '../../Node'

config.classNamePrefix = 'bpgraph-'

export const custom = {
  BlueprintNode,
  BlueprintNodeView
} as const

const namespace = { custom, standard: shapes.standard };

interface IJointGraph {}

export class JointGraph implements IJointGraph {
  public graph: dia.Graph
  public paper: dia.Paper
  public scrollerController!: ScrollerController
  public selectionController!: SelectionController
  public groupEffectController!: GroupEffectController
  public adapter: GraphAdapter
  constructor(adapter: GraphAdapter, options: dia.Paper.Options) {
    this.adapter = adapter
    this.graph = new dia.Graph({})
    this.paper = new dia.Paper({
      model: this.graph,
      cellViewNamespace: namespace,
      frozen: false,
      async: true,
      clickThreshold: 5,
      snapLinks: { radius: 20 },
      linkPinning: false,
      preventDefaultViewAction: false,
      preventDefaultBlankAction: false,
      sorting: dia.Paper.sorting.APPROX,
      interactive: function(cellView) {
        return cellView.model.isElement()
      },
      defaultAnchor: (view, magnet, ...rest) => {
        const group = view.findAttribute("port-group", magnet);
        const anchorFn = group === "in" ? anchors.left : anchors.right;
        return anchorFn(view, magnet, ...rest);
      },
      defaultConnectionPoint: {
        name: "anchor"
      },
      defaultConnector: (sourcePoint, targetPoint, routePoints, opt, linkView) => {
        const link = (linkView as dia.LinkView).model as dia.Link
        const sourcePortId = link.get('source').port
        const isSourceIn = sourcePortId?.startsWith('in-')
        const isSourceOut = sourcePortId?.startsWith('out-')

        if (isSourceIn) {
          opt!.sourceDirection = connectors.curve.TangentDirections.LEFT
          opt!.targetDirection = connectors.curve.TangentDirections.RIGHT
        } else if (isSourceOut) {
          opt!.sourceDirection = connectors.curve.TangentDirections.RIGHT
          opt!.targetDirection = connectors.curve.TangentDirections.LEFT
        }

        return connectors.curve(sourcePoint, targetPoint, routePoints, opt, linkView);
      },
      validateMagnet: () => {
        this.adapter.graph.emit('start:connecting')
        return true
      },
      defaultLink: () => new shapes.standard.Link({
        attrs: {
          line: {
            strokeWidth: this.adapter.graph.nodeRegistry.linkStyle.strokeWidth || 1,
            stroke: this.adapter.graph.nodeRegistry.linkStyle.stroke || 'rgba(255,255,255,0.5)',
            targetMarker: { type: 'none' }
          }
        }
      }),
      validateConnection: (sourceView, sourceMagnet, targetView, targetMagnet) => {
        if (sourceView === targetView) {
          return false;
        }

        const target = targetView.model
        if (target.isLink()) {
          return false
        }

        const sourceGroup = sourceView.findAttribute("port-group", sourceMagnet)
        const targetGroup = targetView.findAttribute("port-group", targetMagnet)
        if (sourceGroup === 'in' && targetGroup !== 'out') {
          return false
        }

        if (sourceGroup === 'out' && targetGroup !== 'in') {
          return false
        }

        if (sourceView && sourceMagnet && targetMagnet && targetView) {
          const sourcePortId = sourceView.findAttribute("port", sourceMagnet) || ''
          const targetPortId = targetView.findAttribute("port", targetMagnet) || ''
          const sourcePort = sourcePortId.startsWith('out-') ?
            (sourceView.model as BlueprintNode).get('outputs')?.find(port => port.id === sourcePortId) :
            (sourceView.model as BlueprintNode).get('inputs')?.find(port => port.id === sourcePortId)
          const targetPort = targetPortId.startsWith('in-') ?
            (targetView.model as BlueprintNode).get('inputs')?.find(port => port.id === targetPortId) :
            (targetView.model as BlueprintNode).get('outputs')?.find(port => port.id === targetPortId)
          const sourceNode = this.adapter.findNode(sourceView.model.id as string) as NodeInstanceType
          const targetNode = this.adapter.findNode(targetView.model.id as string) as NodeInstanceType

          if (sourcePort && targetPort) {
            return this.adapter.graph.validateConnection(sourceNode, sourcePort as OutputPort, targetNode, targetPort as OutputPort)
          }
        }

        return true;
      },
      ...options
    })
    
    this.initialize()
  }

  public initialize() {
    this.scrollerController = new ScrollerController({
      paper: this.paper,
      graph: this.adapter.graph
    })
    this.selectionController = new SelectionController({
      paper: this.paper,
      onSelected: (cells) => {
        this.paper.trigger('selection:changed', cells as Array<BlueprintNode | shapes.standard.Link>)
      }
    })
    this.groupEffectController = new GroupEffectController({
      adapter: this.adapter,
      paper: this.paper,
      className: 'selection-rectangle'
    })
    this.initializeControllers()

    this.paper.on('link:connect', (linkView) => {
      const source = linkView.model.get('source')
      const target = linkView.model.get('target')
      const sourceNodeView = this.paper.findViewByModel(source.id) as BlueprintNodeView
      const targetNodeView = this.paper.findViewByModel(target.id) as BlueprintNodeView
      const sourcePortId = source.port as string
      const targetPortId = target.port as string

      if (sourceNodeView && sourcePortId && targetNodeView && targetPortId) {
        sourceNodeView.highlightPort(sourcePortId)
        targetNodeView.highlightPort(targetPortId)
      }
    })

    this.graph.on('remove', (cell) => {
      if (cell.isLink()) {
        const link = cell as dia.Link

        const source = link.get('source')
        const target = link.get('target')

        const sourceNodeView = this.paper.findViewByModel(source.id) as BlueprintNodeView
        const targetNodeView = this.paper.findViewByModel(target.id) as BlueprintNodeView
        const sourcePortId = source.port as string
        const targetPortId = target.port as string
        if (!sourcePortId || !targetPortId) return

        const sourceLinks = this.graph.getConnectedLinks(sourceNodeView.model, { inbound: true, outbound: true })
        const targetLinks = this.graph.getConnectedLinks(targetNodeView.model, { inbound: true, outbound: true })

        const stillConnectedFromSource = sourceLinks.some(l => 
          l.get('source').port === sourcePortId || l.get('target').port === sourcePortId
        )
        const stillConnectedFromTarget = targetLinks.some(l => 
          l.get('source').port === targetPortId || l.get('target').port === targetPortId
        )

        if (sourceNodeView && sourcePortId && !stillConnectedFromSource) {
          sourceNodeView.unhighlightPort(sourcePortId)
        }
        if (targetNodeView && targetPortId && !stillConnectedFromTarget) {
          targetNodeView.unhighlightPort(targetPortId)
        }
      }
    })
  }

  initializeControllers() {
    if (this.paper.el) {
      this.scrollerController.stopListening()
      this.selectionController.stopListening()
      this.groupEffectController.stopListening()
      this.scrollerController.startListening()
      this.selectionController.startListening()
      this.groupEffectController.startListening()
      this.paper.el.removeEventListener('keydown', this.onKeyDown)
      this.paper.el.removeEventListener('keyup', this.onKeyUp)
      this.paper.el.addEventListener('keydown', this.onKeyDown)
      this.paper.el.addEventListener('keyup', this.onKeyUp)
    }
  }

  public addNode(instance: NodeInstanceType, style?: NodeStyle) {
    const inputs = instance.inputs
    const outputs = instance.outputs

    const node = new custom.BlueprintNode({
      id: instance.id,
      title: instance.title ?? '',
      position: { x: instance.position?.x ?? 0, y: instance.position?.y ?? 0 },
      style: style ?? {},
      inputs: inputs,
      outputs: outputs,
      nodeType: instance.type,
      values: { ...instance.values }
    }) as BlueprintNode
    this.graph.addCell(node)
    return node
  }

  public setContainer(container: HTMLElement) {
    this.paper.setElement(container)
    this.paper.render()
    this.initializeControllers()
  }

  public addLink(link: LinkInstanceType, style?: LinkStyle) {
    const jointLink = new shapes.standard.Link({
      id: link.id,
      source: { id: link.source.id, port: link.source.port },
      target: { id: link.target.id, port: link.target.port },
      attrs: {
        line: {
          stroke: style?.stroke ?? '#ffffff',
          strokeWidth: style?.strokeWidth ?? 2,
          targetMarker: { type: 'none' }
        }
      }
    }) as dia.Link

    const source = jointLink.get('source')
    const target = jointLink.get('target')

    const sourceNodeView = this.paper.findViewByModel(source.id) as BlueprintNodeView
    const targetNodeView = this.paper.findViewByModel(target.id) as BlueprintNodeView
    const sourcePortId = source.port as string
    const targetPortId = target.port as string

    if (sourceNodeView && sourcePortId && targetNodeView && targetPortId) {
      sourceNodeView.highlightPort(sourcePortId)
      targetNodeView.highlightPort(targetPortId)
    }

    this.graph.addCell(jointLink)
    return jointLink
  }

  public removeCells(cells: dia.Cell[]) {
    this.graph.removeCells(cells)
    this.ungroupCells(cells as Array<dia.Element | dia.Link>)
  }

  public findNode(id: string) {
    return this.graph.getCell(id) as BlueprintNode
  }

  public highlightCells(cells: dia.Cell[]) {
    const defaultNodeStyle = this.adapter.graph.nodeRegistry.nodeStyle
    const defaultLinkStyle = this.adapter.graph.nodeRegistry.linkStyle
    cells.forEach(cell => {
      if (cell instanceof dia.Element) {
        const elementView = this.paper.findViewByModel(cell)
        if (!elementView) return
        highlighters.mask.add(elementView, "base-node-body", 'highlighter-selected', {
          layer: dia.Paper.Layers.FRONT,
          padding: 2,
          attrs: {
            stroke: defaultNodeStyle.highlightStroke ?? '#0077B6',
            "stroke-width": defaultNodeStyle.highlightStrokeWidth ?? 1
          }
        })
      } else if (cell instanceof dia.Link) {
        const linkView = this.paper.findViewByModel(cell)
        if (!linkView) return
        highlighters.mask.add(linkView, 'line', 'highlighter-selected', {
          layer: dia.Paper.Layers.FRONT,
          padding: 2,
          attrs: {
            stroke: defaultLinkStyle.highlightStroke ?? '#0077B6',
            "stroke-width": defaultLinkStyle.highlightStrokeWidth ?? 1
          }
        })
      }
    })
  }

  public unhighlightCells(cells: dia.Cell[]) {
    cells.forEach(cell => {
      if (cell instanceof dia.Element) {
        const elementView = this.paper.findViewByModel(cell)
        if (!elementView) return
        highlighters.mask.remove(elementView)
      } else if (cell instanceof dia.Link) {
        const linkView = this.paper.findViewByModel(cell)
        if (!linkView) return
        highlighters.mask.remove(linkView)
      }
    })
  }

  public groupCells(cells: Array<dia.Element | dia.Link>) {
    this.groupEffectController.groupCells(cells)
  }

  public ungroupCells(cells: Array<dia.Element | dia.Link>) {
    this.groupEffectController.ungroupCells(cells)
  }

  public clearGroups() {
    this.groupEffectController.clearGroups()
  }

  public clearHighlights() {
    highlighters.mask.removeAll(this.paper)
  }

  public destroy() {
    this.scrollerController.stopListening()
    this.selectionController.stopListening()
    this.groupEffectController.stopListening()
    this.graph.clear()
    this.paper.remove()
    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('keyup', this.onKeyUp)
  }

  public clear() {
    this.graph.clear()
    this.clearHighlights()
  }

  private onKeyDown = (e: KeyboardEvent) => {
    if (e.code === 'Space') {
      this.selectionController.stopListening()
    }
  }

  private onKeyUp = (e: KeyboardEvent) => {
    if (e.code === 'Space') {
      this.selectionController.startListening()
    }
  }
}