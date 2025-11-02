import { dia, mvc } from '@joint/core'
import { Graph } from '../../Graph'

type ArgsType = { paper: dia.Paper, graph: Graph }

export class ScrollerController extends mvc.Listener<[ArgsType]> {
  private _viewport = { x: 0, y: 0, scale: 1 }
  private _isDragging = false
  private _lastClientX = 0
  private _lastClientY = 0
  private _spacePressed = false
  private static ZOOM_SENSITIVITY = 0.005

  get isDragging() {
    return this._isDragging
  }

  get viewport() {
    return this._viewport
  }

  get scale() {
    return this._viewport.scale
  }
  set scale(value: number) {
    this._viewport.scale = value
    this.updatePaperTransform()
  }

  get position() {
    return { x: this._viewport.x, y: this._viewport.y }
  }
  set position(value: { x: number; y: number }) {
    this._viewport.x = value.x
    this._viewport.y = value.y
    this.updatePaperTransform()
  }

  startListening() {
    const [{ paper }] = this.callbackArguments
    paper.el.addEventListener('keydown', this.onKeyDown)
    paper.el.addEventListener('keyup', this.onKeyUp)
    paper.el.addEventListener('selectstart', this.onSelectStart)
    this.initPaperEvents()
  }

  private initPaperEvents() {
    const [{ paper }] = this.callbackArguments
    const el = paper.el as HTMLElement
    el.addEventListener('mousedown', this.onMouseDown)

    el.addEventListener('mousemove', this.onMouseMove)

    el.addEventListener('mouseup', this.onMouseUp)

    paper.el.addEventListener('selectstart', this.onSelectStart)

    el.addEventListener('wheel', this.onMouseWheel, { passive: true } )
  }

  private onKeyDown = (e: KeyboardEvent) => {
    const [{ paper }] = this.callbackArguments
    if (e.target !== paper.el) return
    if (e.code === 'Space') {
      this._spacePressed = true
      paper.el.style.cursor = 'grab'
    }
  }

  private onKeyUp = (e: KeyboardEvent) => {
    const [{ paper }] = this.callbackArguments
    if (e.code === 'Space') {
      this._spacePressed = false
      paper.el.style.cursor = ''
    }
  }

  private onMouseDown = (e: MouseEvent) => {
    const [{ paper }] = this.callbackArguments
    const el = paper.el as HTMLElement
    if ((e.button === 0 && this._spacePressed) || (e.button === 2 && !this._spacePressed)) {
      e.stopPropagation()
      e.preventDefault()
      this._isDragging = true
      this._lastClientX = e.clientX
      this._lastClientY = e.clientY
      el.style.cursor = 'grabbing'
    }
  }

  private onMouseMove = (e: MouseEvent) => {
    const [{ paper, graph }] = this.callbackArguments
    if (!this.isDragging) return
    const dx = e.clientX - this._lastClientX
    const dy = e.clientY - this._lastClientY

    this._viewport.x += dx
    this._viewport.y += dy
    
    paper.translate(this._viewport.x, this._viewport.y)
    graph.emit('viewport:change', this._viewport)

    this._lastClientX = e.clientX
    this._lastClientY = e.clientY
  }

  private onMouseUp = () => {
    const [{ paper }] = this.callbackArguments
    if (this.isDragging) {
      this._isDragging = false
      if (this._spacePressed) paper.el.style.cursor = 'grab'
      else paper.el.style.cursor = ''
    }
  }

  private onMouseWheel = (e: WheelEvent) => {
    const [{ paper, graph }] = this.callbackArguments
    if (this.isDragging) return
    const rect = paper.el.getBoundingClientRect();
    const point = { 
        x: e.clientX - rect.left, 
        y: e.clientY - rect.top 
    }

    const localPoint = paper.clientToLocalPoint(point)

    this.viewport.scale += e.deltaY * -ScrollerController.ZOOM_SENSITIVITY

    this.viewport.scale = Math.min(Math.max(0.2, this.viewport.scale), 5)

    paper.scale(this.viewport.scale, this.viewport.scale)

    const newLocalPoint = paper.clientToLocalPoint(point)

    this.viewport.x += (newLocalPoint.x - localPoint.x) * this.viewport.scale
    this.viewport.y += (newLocalPoint.y - localPoint.y) * this.viewport.scale
    paper.translate(this.viewport.x, this.viewport.y)

    paper.setGridSize(10 / this.viewport.scale)

    graph.emit('viewport:change', this._viewport)
  }

  private updatePaperTransform() {
    const [{ paper }] = this.callbackArguments
    paper.scale(this.viewport.scale, this.viewport.scale)
    paper.translate(this.viewport.x, this.viewport.y)
    paper.setGridSize(10 / this.viewport.scale)
  }

  private onSelectStart = (e: Event) => {
    if (this.isDragging) e.preventDefault()
  }

  stopListening(): void {
    super.stopListening()
    const [{ paper }] = this.callbackArguments
    const el = paper.el as HTMLElement
    el.removeEventListener('mousedown', this.onMouseDown)
    el.removeEventListener('mousemove', this.onMouseMove)
    el.removeEventListener('mouseup', this.onMouseUp)
    paper.el.removeEventListener('selectstart', this.onSelectStart)
    el.removeEventListener('wheel', this.onMouseWheel)
    paper.el.removeEventListener('keydown', this.onKeyDown)
    paper.el.removeEventListener('keyup', this.onKeyUp)
  }
}
