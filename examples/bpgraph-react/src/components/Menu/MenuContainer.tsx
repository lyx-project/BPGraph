import { useBlueprintStore } from "@/store/useBlueprintStore"
import { ContextMenu } from './ContextMenu'
import { NodeListMenu } from './NodeListMenu'
import { useRef } from "react"

export function MenuContainer() {
  const { menuType, menuPosition, closeMenu } = useBlueprintStore()

  const containerRef = useRef<HTMLDivElement | null>(null)

  if (!menuType || !menuPosition) return null

  const style = {
    top: menuPosition.y,
    left: menuPosition.x,
  }

  const hideMenu = () => {
    if (containerRef.current) {
      containerRef.current.style.opacity = '0'
    }
  }

  const handleCloseMenu = () => {
    closeMenu()
    if (containerRef.current) {
      containerRef.current.style.left = '-9999px'
      containerRef.current.style.top = '-9999px'
    }
  }

  return (
    <div style={style} className="z-50 absolute select-none" draggable={false} ref={containerRef}>
      {menuType === "context" && <ContextMenu onClose={handleCloseMenu} />}
      {menuType === "nodeList" && <NodeListMenu onClose={handleCloseMenu} onHide={hideMenu} />}
    </div>
  )
}