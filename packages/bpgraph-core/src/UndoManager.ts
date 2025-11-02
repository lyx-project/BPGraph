import { ChangedEvent } from './ChangedEvent'
import type { NodeInstanceType, LinkInstanceType } from './Graph'
import { Graph } from './Graph'

export interface Command {
  undo: () => void
  redo: () => void
}

export class AddNodeCommand implements Command {
  private graph: Graph
  private nodes: NodeInstanceType[]
  constructor(graph: Graph, nodes: NodeInstanceType[]) {
    this.graph = graph
    this.nodes = nodes
  }

  undo() {
    this.graph.removeNodes(this.nodes)
  }

  redo() {
    this.graph.addNodes(this.nodes)
  }
}

export class RemoveNodeCommand implements Command {
  private graph: Graph
  private nodes: NodeInstanceType[]
  constructor(graph: Graph, nodes: NodeInstanceType[]) {
    this.graph = graph
    this.nodes = nodes
  }
  undo() {
    this.graph.addNodes(this.nodes)
  }

  redo() {
    this.graph.removeNodes(this.nodes)
  }
}

export class AddLinkCommand implements Command {
  graph: Graph
  links: LinkInstanceType[]
  constructor(graph: Graph, links: LinkInstanceType[]) {
    this.graph = graph
    this.links = links
  }

  undo() {
    this.graph.removeLinks(this.links)
  }

  redo() {
    this.graph.addLinks(this.links)
  }
}

export class RemoveLinkCommand implements Command {
  graph: Graph
  links: LinkInstanceType[]
  constructor(graph: Graph, links: LinkInstanceType[]) {
    this.graph = graph
    this.links = links
  }
  undo() {
    this.graph.addLinks(this.links)
  }

  redo() {
    this.graph.removeLinks(this.links)
  }
}

export class PropertyChangeCommand implements Command {
  node: NodeInstanceType
  property: string
  from: unknown
  to: unknown
  constructor(node: NodeInstanceType, property: string, from: unknown, to: unknown) {
    this.node = node
    this.property = property
    this.from = from
    this.to = to
  }
  undo() {
    (this.node[this.property as keyof NodeInstanceType] as unknown) = this.from
  }

  redo() {
    (this.node[this.property as keyof NodeInstanceType] as unknown) = this.to
  }
}

export class UndoManager {
  public undoStack: Command[] = []
  public redoStack: Command[] = []
  private transactionStack: Command[][] = []

  private _isUndoingRedoing = false

  private graph: Graph

  constructor(graph: Graph) {
    this.graph = graph
  }

  get isUndoingRedoing() {
    return this._isUndoingRedoing
  }

  public record(command: Command) {
    if (this._isUndoingRedoing) return
    if (this.graph.skipsUndoManager) return
    if (this.transactionStack.length > 0) {
      this.transactionStack[this.transactionStack.length - 1].push(command)
    }
  }

  /**
   * Start a transaction to group multiple commands into one.
   */
  public startTransaction() {
    this.transactionStack.push([])
  }

  /**
   * Commit the current transaction.
   */
  public commitTransaction() {
    const commands = this.transactionStack.pop()
    if (!commands || commands.length === 0) return

    const compoundCommand: Command = {
      redo: () => commands.forEach(c => c.redo()),
      undo: () => commands.slice().reverse().forEach(c => c.undo()),
    }

    if (this.transactionStack.length > 0) {
      this.transactionStack[this.transactionStack.length - 1].push(compoundCommand)
    } else {
      this.undoStack.push(compoundCommand)
      this.redoStack.length = 0
    }
  }
  
  // Convenience method to run a callback within a transaction
  public commit(callback: () => void) {
    this.startTransaction()
    try {
      callback()
      this.commitTransaction()
    } catch (err) {
      this.transactionStack.pop()
      throw err
    }
  }

  // Factory method to create commands
  public createCommand(
    type: 'addNodes' | 'removeNodes' | 'addLinks' | 'removeLinks' | 'propertyChange',
    propertyName: string,
    target: unknown,
    oldvalue?: unknown,
    newvalue?: unknown): Command {
      switch (type) {
        case 'addNodes':
          return new AddNodeCommand(this.graph, target as NodeInstanceType[])
        case 'removeNodes':
          return new RemoveNodeCommand(this.graph, target as NodeInstanceType[])
        case 'propertyChange':
          if (!oldvalue || !newvalue) {
            throw new Error('PropertyChangeCommand requires oldvalue and newvalue options')
          }
          return new PropertyChangeCommand(target as NodeInstanceType, propertyName, oldvalue, newvalue)
        case 'addLinks':
          return new AddLinkCommand(this.graph, target as LinkInstanceType[])
        case 'removeLinks':
          return new RemoveLinkCommand(this.graph, target as LinkInstanceType[])
      }
  }

  // Handle changed events from the graph
  public  handleChanged(e: ChangedEvent) {
    if (this._isUndoingRedoing) return
    switch (e.change) {
      case ChangedEvent.Insert:
        if (e.object instanceof Graph.NodeInstance || (Array.isArray(e.object) && e.object[0] instanceof Graph.NodeInstance)) {
          const command = this.createCommand('addNodes', e.propertyName, Array.isArray(e.object) ? e.object : [e.object])
          this.record(command)
        }
        if (e.object instanceof Graph.LinkInstance || (Array.isArray(e.object) && e.object[0] instanceof Graph.LinkInstance)) {
          const command = this.createCommand('addLinks', e.propertyName, Array.isArray(e.object) ? e.object : [e.object])
          this.record(command)
        }
        break
      case ChangedEvent.Delete:
        if (e.object instanceof Graph.NodeInstance || (Array.isArray(e.object) && e.object[0] instanceof Graph.NodeInstance)) {
          const command = this.createCommand('removeNodes', e.propertyName, Array.isArray(e.object) ? e.object : [e.object])
          this.record(command)
        }
        if (e.object instanceof Graph.LinkInstance || (Array.isArray(e.object) && e.object[0] instanceof Graph.LinkInstance)) {
          const command = this.createCommand('removeLinks', e.propertyName, Array.isArray(e.object) ? e.object : [e.object])
          this.record(command)
        }
        break
      case ChangedEvent.Property:
        if (e.propertyName === 'position') {
          const command = this.createCommand('propertyChange', e.propertyName, e.object as NodeInstanceType, e.oldValue, e.newValue)
          this.record(command)
        }
        break
    }
  }

  // Perform undo operation
  public undo() {
    const cmd = this.undoStack.pop()
    if (!cmd) return
    this._isUndoingRedoing = true
    cmd.undo()
    this._isUndoingRedoing = false
    this.redoStack.push(cmd)
  }

  // Check if can undo
  public canUndo() {
    return this.undoStack.length > 0
  }

  // Perform redo operation
  public redo() {
    const cmd = this.redoStack.pop()
    if (!cmd) return
    this._isUndoingRedoing = true
    cmd.redo()
    this._isUndoingRedoing = false
    this.undoStack.push(cmd)
  }

  // Check if can redo
  public canRedo() {
    return this.redoStack.length > 0
  }

  // Clear all undo/redo history
  public clear() {
    this.undoStack = []
    this.redoStack = []
    this.transactionStack = []
  }
}