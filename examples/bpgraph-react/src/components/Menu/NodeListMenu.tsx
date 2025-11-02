import { useGraph } from "@/context/graph-context"
import { type NodeInstanceType } from '@bpgraph/core'

export function NodeListMenu({ onClose, onHide }: { onClose: () => void, onHide: () => void }) {
  const graph = useGraph()
  const classes = graph.nodeRegistry.getNodeClasses()
  if (graph.model.subgraphStack.length > 1) {
    classes.splice(classes.findIndex(c => c.type === 'start'), 1)
  }
  const ghost = document.createElement("div")
  ghost.style.width = "10px"
  ghost.style.height = "10px"
  let dragNode: NodeInstanceType | null = null
  let oldskips = graph.skipsUndoManager
  let bbox = { width: 0, height: 0 }

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    NodeClass: typeof graph.nodeRegistry.registry[keyof typeof graph.nodeRegistry.registry]
  ) => {
    onHide()
    e.dataTransfer.effectAllowed = "copy"
    e.dataTransfer.setData("application/node-type", NodeClass.type)

    document.body.appendChild(ghost)
    e.dataTransfer.setDragImage(ghost, 0, 0)

    dragNode = graph.addNode(NodeClass)
    bbox = { width: dragNode.bbox?.width || 0, height: dragNode.bbox?.height || 0 }
    const point = graph.clientToGraphPoint(e.clientX - bbox.width / 2, e.clientY - bbox.height / 2)
    dragNode.position = point
    oldskips = graph.skipsUndoManager
    graph.skipsUndoManager = true
  }

  const handleDrag = (
    e: React.DragEvent<HTMLDivElement>,
  ) => {
    if (dragNode) {
      if (e.clientX === 0 && e.clientY === 0) {
        return
      }
      const point = graph.clientToGraphPoint(e.clientX - bbox.width / 2, e.clientY - bbox.height / 2)
      dragNode.position = point
    }
  }

  const nodeValues = (Cls: typeof graph.nodeRegistry.registry[keyof typeof graph.nodeRegistry.registry]) => {
    const values: Record<string, unknown> = {}
    if (Cls.type === 'OpenRouter') {
      values['prompt'] = `You are a powerful expert in natural language reasoning and generation. Based on the user's input, provide a detailed and insightful response.  
      The user's input is as follows: {{input}}  
      Make sure your response is accurate and relevant. If necessary, provide additional background information to support your answer.  
      Please begin your response.`
    }
    return values
  }

  const handleClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    NodeClass: typeof graph.nodeRegistry.registry[keyof typeof graph.nodeRegistry.registry]
  ) => {
    graph.startTransaction()

    const node = graph.addNode(NodeClass, {
      values: nodeValues(NodeClass)
    })
    const width = node.bbox?.width || 100
    const height = node.bbox?.height || 40
    const point = graph.clientToGraphPoint(e.clientX - width / 2, e.clientY - height / 2)
    node.position = point
    graph.commitTransaction()
  }

  const handleDragEnd = (
    _e: React.DragEvent<HTMLDivElement>,
    NodeClass: typeof graph.nodeRegistry.registry[keyof typeof graph.nodeRegistry.registry]
  ) => {
    onClose()
    document.body.removeChild(ghost)
    graph.skipsUndoManager = oldskips
    graph.removeNodes([dragNode!])
    graph.startTransaction()
    graph.addNode(NodeClass, {
      position: dragNode!.position,
      values: nodeValues(NodeClass)
    })
    graph.commitTransaction()
    dragNode = null
  }

  const renderItem = (NodeClass: typeof graph.nodeRegistry.registry[keyof typeof graph.nodeRegistry.registry]) => {
    return (
      <div key={NodeClass.type} className="px-4 py-1 hover:bg-gray-700 cursor-pointer"
        draggable
        onDragStart={(e) => handleDragStart(e, NodeClass)}
        onDrag={(e) => handleDrag(e)}
        onDragEnd={(e) => handleDragEnd(e, NodeClass)}
        onClick={(e) => {
          handleClick(e, NodeClass)
          onClose()
        }}>
        {NodeClass.definition.title || NodeClass.type}
      </div>
    )
  }
  
  return (
    <div className="bg-neutral-900 text-white shadow-md rounded-xs overflow-hidden">
      {classes.map(n => (
        renderItem(n)
      ))}
    </div>
  )
}