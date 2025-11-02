import { dia, g, V, mvc } from '@joint/core'

type ArgsType = { paper: dia.Paper, className?: string, onSelected: (cells: Array<dia.Element | dia.Link>) => void } 
export class SelectionController extends mvc.Listener<[ArgsType]> {
  private rect?: SVGRectElement
  private startPoint?: g.Point
  private pointerDownTime = 0
  private hasMovedEnough = false
  private static MIN_MOVE_DISTANCE = 3 // px
  private static MIN_PRESS_DURATION = 100 // ms
  startListening() {
    const [{ paper }] = this.callbackArguments
    this.listenTo(paper, 'blank:pointerdown', this.onPointerDown, this)
    this.listenTo(paper, 'blank:pointermove', this.onPointerMove, this)
    this.listenTo(paper, 'blank:pointerup', this.onPointerUp, this)
  }
  private onPointerDown({ paper }: ArgsType, evt: dia.Event) {
    const clientX = (evt as unknown as MouseEvent).clientX
    const clientY = (evt as unknown as MouseEvent).clientY
    const localPoint = paper.clientToLocalPoint(clientX, clientY)
    this.startPoint = paper.localToPagePoint(localPoint.x, localPoint.y)
    this.pointerDownTime = Date.now()
    this.hasMovedEnough = false
  }

  private onPointerMove({ paper, className }: ArgsType, evt: dia.Event) {
    if (!this.startPoint) return

    const clientX = (evt as unknown as MouseEvent).clientX
    const clientY = (evt as unknown as MouseEvent).clientY

    const localPoint = paper.clientToLocalPoint(clientX, clientY)
    const currentPoint = paper.localToPagePoint(localPoint.x, localPoint.y)
    const dx = Math.abs(currentPoint.x - this.startPoint.x)
    const dy = Math.abs(currentPoint.y - this.startPoint.y)
    const moved = dx > SelectionController.MIN_MOVE_DISTANCE || dy > SelectionController.MIN_MOVE_DISTANCE
    if (!this.hasMovedEnough && moved) {
      const duration = Date.now() - (this.pointerDownTime ?? 0)
      if (duration > SelectionController.MIN_PRESS_DURATION) {
        this.rect = V('rect', {
          x: this.startPoint.x,
          y: this.startPoint.y,
          width: 1,
          height: 1,
          class: className ?? '',
          stroke: '#3498db',
          'stroke-width': 1,
          fill: 'rgba(52,152,219,0.15)'
        }).node as SVGRectElement
        paper.svg.appendChild(this.rect)
        this.hasMovedEnough = true
      }
    }

    if (this.rect && this.hasMovedEnough) {
      const x1 = Math.min(this.startPoint.x, currentPoint.x)
      const y1 = Math.min(this.startPoint.y, currentPoint.y)
      const x2 = Math.max(this.startPoint.x, currentPoint.x)
      const y2 = Math.max(this.startPoint.y, currentPoint.y)

      V(this.rect).attr({
        x: x1,
        y: y1,
        width: x2 - x1,
        height: y2 - y1
      })
    }
  }

  private onPointerUp({ paper, onSelected }: ArgsType, evt: dia.Event) {
    if (!this.rect || !this.startPoint) return

    const clientX = (evt as unknown as MouseEvent).clientX
    const clientY = (evt as unknown as MouseEvent).clientY

    const currentPoint = paper.clientToLocalPoint(clientX, clientY)

    const startPoint = paper.pageToLocalPoint(this.startPoint.x, this.startPoint.y)
    const x1 = Math.min(startPoint.x, currentPoint.x)
    const y1 = Math.min(startPoint.y, currentPoint.y)
    const x2 = Math.max(startPoint.x, currentPoint.x)
    const y2 = Math.max(startPoint.y, currentPoint.y)

    const bbox = new g.Rect(x1, y1, x2 - x1, y2 - y1)

    const elements = paper.model.getElements()
    const links = paper.model.getLinks()
    const selected = elements.filter(el => bbox.intersect(el.getBBox()))

    const selectedLinks = links.filter(link => {
      const linkView = paper.findViewByModel(link) as dia.LinkView
      if (!linkView) return false
      const path = linkView.findNode('line') as SVGPathElement
      if (!path) return false
      return pathIntersectsRect(path, bbox)
    })

    onSelected([...selected, ...selectedLinks])

    this.rect.remove()
    this.rect = undefined
    this.startPoint = undefined
  }
}

function pathIntersectsRect(path: SVGPathElement, rect: g.Rect): boolean {
  const length = path.getTotalLength()
  const step = 5
  for (let i = 0; i <= length; i += step) {
    const pt = path.getPointAtLength(i)
    if (
      pt.x >= rect.x &&
      pt.x <= rect.x + rect.width &&
      pt.y >= rect.y &&
      pt.y <= rect.y + rect.height
    ) {
      return true
    }
  }
  return false
}