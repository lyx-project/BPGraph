import { dia, mvc, V } from '@joint/core'
import { GraphAdapter } from '../GraphAdapter';

type ArgsType = { paper: dia.Paper; adapter: GraphAdapter; className?: string } 

export class GroupEffectController extends mvc.Listener<[ArgsType]> {
  private rect?: SVGRectElement
  private cells: Array<dia.Element | dia.Link> = []
  private nodes: Array<dia.Element> = []
  private dragStartPoint?: dia.Point
  private dragStartClientPoint?: dia.Point
  private cellsStartPositions: Map<string, dia.Point> = new Map()
  private rectStartPos?: dia.Point
  private moveNodes: Array<dia.Element> = []
  startListening() {
    const [{ paper }] = this.callbackArguments
    this.listenTo(paper, 'element:pointerdown', this.onElementPointerDown, this)
    this.listenTo(paper, 'element:pointerup', this.onElementPointerUp, this)
    this.listenTo(paper, 'element:pointermove', this.onElementPointerMove, this)
    this.listenTo(paper, 'scale', this.onScale, this)
    this.listenTo(paper, 'translate', this.onTranslate, this)
  }

  private onScale() {
    if (this.cells.length <= 1) return
    this.clearGroupEffect()
    this.drawGroupEffect()
  }

  private onTranslate() {
    if (this.cells.length <= 1) return
    this.clearGroupEffect()
    this.drawGroupEffect()
  }

  private onElementPointerDown({paper, adapter}: ArgsType, elementView: dia.ElementView) {
    if (!elementView.model.isElement()) return
    this.dragStartPoint = { x: elementView.model.position().x, y: elementView.model.position().y }
    this.moveNodes = [elementView.model]

    this.rectStartPos = undefined
    if (this.nodes.includes(elementView.model)) {
      this.moveNodes = this.nodes

      this.rectStartPos = {
        x: this.rect ? parseFloat(this.rect.getAttribute('x') || '0') : 0,
        y: this.rect ? parseFloat(this.rect.getAttribute('y') || '0') : 0
      }

      this.dragStartClientPoint = paper.localToClientPoint(this.dragStartPoint.x, this.dragStartPoint.y)
    }
    this.moveNodes.forEach(cell => {
      if (!cell.isElement()) return
      this.cellsStartPositions.set(cell.id as string, cell.position())
      const node = adapter.cellsMap.get(cell.id as string)?.cell
      if (!node || !('position' in node)) return
      adapter.graph.emit('node:dragstart', node)
    })
  }

  private onElementPointerMove({ adapter, paper }: ArgsType, elementView: dia.ElementView) {
    if (!this.moveNodes.length) return
    if (!this.dragStartPoint) return

    const pos = elementView.model.position()
    const clientPos = paper.localToClientPoint(pos.x, pos.y)
    const clientOffsetX = clientPos.x - (this.dragStartClientPoint?.x ?? 0)
    const clientOffsetY = clientPos.y - (this.dragStartClientPoint?.y ?? 0)

    const offsetX = pos.x - (this.dragStartPoint?.x ?? 0)
    const offsetY = pos.y - (this.dragStartPoint?.y ?? 0)

    this.moveNodes.forEach(cell => {
      const node = adapter.cellsMap.get(cell.id as string)?.cell
      if (cell.id !== elementView.model.id) {
        const startPos = this.cellsStartPositions.get(cell.id as string)!
        cell.position(startPos.x + offsetX, startPos.y + offsetY)
      }
      if (node && 'position' in node) {
        const bbox = adapter.getElementBBox(elementView)
        node._bbox = bbox
        adapter.graph.emit('node:dragmove', node)
      }
    })
    if (this.rect && this.rectStartPos) {
      this.rect.setAttribute('x', String(this.rectStartPos.x + clientOffsetX))
      this.rect.setAttribute('y', String(this.rectStartPos.y + clientOffsetY))
    }
  }

  private onElementPointerUp({ adapter, paper }: ArgsType, elementView: dia.ElementView) {
    if (!this.moveNodes.length) return

    const dragStart = this.dragStartPoint
    this.dragStartPoint = undefined
    if (!dragStart) return
    const dragEnd = elementView.model.position()
    const offsetX = dragEnd.x - (dragStart?.x ?? 0)
    const offsetY = dragEnd.y - (dragStart?.y ?? 0)

    const clientPos = paper.localToClientPoint(dragEnd.x, dragEnd.y)
    const clientOffsetX = clientPos.x - (this.dragStartClientPoint?.x ?? 0)
    const clientOffsetY = clientPos.y - (this.dragStartClientPoint?.y ?? 0)

    if (dragEnd.x !== dragStart.x || dragEnd.y !== dragStart.y) {
      adapter.graph.startTransaction()
      this.moveNodes.forEach(node => {
        const startPos = this.cellsStartPositions.get(node.id as string)!
        node.position(startPos.x + offsetX, startPos.y + offsetY)
        const instance = adapter.cellsMap.get(node.id as string)?.cell
        if (instance && 'position' in instance) {
          instance.position = { x: startPos.x + offsetX, y: startPos.y + offsetY }
          const bbox = adapter.getElementBBox(elementView)
          instance._bbox = bbox
          adapter.graph.emit('node:dragend', instance)
        }
      })
      adapter.graph.commitTransaction()

      if (this.rect && this.rectStartPos) {
        this.rect.setAttribute('x', String(this.rectStartPos.x + clientOffsetX))
        this.rect.setAttribute('y', String(this.rectStartPos.y + clientOffsetY))
      }
      this.rectStartPos = undefined
      this.moveNodes = []
      this.cellsStartPositions.clear()
    }
  }

  public groupCells(cells: Array<dia.Element | dia.Link>) {
    this.cells = cells
    this.nodes = cells.filter(c => c.isElement()) as dia.Element[]
    this.updateGroupEffect()
    this.updateCellsHighlight()
  }
  public ungroupCells(cells: Array<dia.Element | dia.Link>) {
    this.cells = this.cells.filter(c => !cells.includes(c))
    this.nodes = this.cells.filter(c => c.isElement()) as dia.Element[]
    this.updateGroupEffect()
    this.updateCellsHighlight()
  }
  public clearGroups() {
    this.cells = []
    this.nodes = []
    this.updateGroupEffect()
    this.updateCellsHighlight()
  }

  private updateCellsHighlight() {
    const [{ adapter }] = this.callbackArguments
    adapter.joint.clearHighlights()
    adapter.joint.highlightCells(this.cells)
  }

  private drawGroupEffect() {
    const bbox = this.calculateBoundingBox()
    const [{ paper }] = this.callbackArguments
    if (!this.rect) {
      this.rect = V('rect', {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        class: 'selection-effect',
        stroke: '#3c3ce7ff',
        'stroke-width': 2,
        fill: 'rgba(60, 60, 60, 0.15)',
        rx: 4,
        ry: 4,
        'pointer-events': 'none',
      }).node as SVGRectElement
      paper.svg.appendChild(this.rect)
    }
    this.rect.setAttribute('x', String(bbox.x - 10))
    this.rect.setAttribute('y', String(bbox.y - 10))
    this.rect.setAttribute('width', String(bbox.width + 20))
    this.rect.setAttribute('height', String(bbox.height + 20))
  }

  private updateGroupEffect() {
    if (this.nodes.length > 1) {
      this.drawGroupEffect()
    } else {
      this.clearGroupEffect()
    }
  }

  private clearGroupEffect() {
    if (this.rect) {
      this.rect.remove()
      this.rect = undefined
    }
  }

  private calculateBoundingBox() {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    const [{ paper }] = this.callbackArguments
    this.nodes.forEach(node => {
      const bbox = paper.localToPaperRect(node.getBBox())
      minX = Math.min(minX, bbox.x)
      minY = Math.min(minY, bbox.y)
      maxX = Math.max(maxX, bbox.x + bbox.width)
      maxY = Math.max(maxY, bbox.y + bbox.height)
    })
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY }
  }
}