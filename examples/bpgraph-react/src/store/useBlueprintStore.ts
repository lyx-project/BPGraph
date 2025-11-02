import { create } from "zustand"
import type { NodeInstanceType } from "@bpgraph/core"

type MenuType = "nodeList" | "context" | null

type Store = {
  menuType: MenuType
  menuPosition: { x: number; y: number } | null
  
  openMenu: (type: MenuType, position: { x: number; y: number }) => void
  closeMenu: () => void

  selectedNode: NodeInstanceType | null
  setSelectedNode: (node: NodeInstanceType | null) => void

  chatVisible: boolean
  setChatVisible: (v: boolean) => void

  run: () => void
}

export const useBlueprintStore = create<Store>((set) => ({
  selectedNode: null,
  setSelectedNode: (node) => set({ selectedNode: node }),

  chatVisible: false,
  setChatVisible: (v) => set({ chatVisible: v }),

  run: () => set((state) => ({ chatVisible: !state.chatVisible })),

  menuType: null,
  menuPosition: null,
  openMenu: (type, position) => set({ menuType: type, menuPosition: position }),
  closeMenu: () => set({ menuType: null, menuPosition: null }),
}))