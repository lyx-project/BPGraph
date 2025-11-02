import { useBlueprintStore } from "@/store/useBlueprintStore"
import NodeDetail from "./NodeDetail"
import ChatWindow from "./ChatWindow"
import { useGraph } from "@/context/graph-context"

export function SidePanel() {
  const selectedNode = useBlueprintStore(s => s.selectedNode)
  const chatVisible = useBlueprintStore(s => s.chatVisible)
  const graph = useGraph()

  const onClose = () => {
    useBlueprintStore.getState().setChatVisible(false)
  }

  const handleUnselect = () => {
    graph.clearSelection()
    useBlueprintStore.getState().setSelectedNode(null)
  }

  return (
    <div className="side-panel flex flex-row gap-4 h-full">
      {selectedNode && <NodeDetail onClose={handleUnselect} node={selectedNode} />}
      {chatVisible && <ChatWindow onClose={onClose} />}
    </div>
  )
}