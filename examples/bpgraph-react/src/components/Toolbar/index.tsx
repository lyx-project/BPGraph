import { useBlueprintStore } from "@/store/useBlueprintStore"

export function Toolbar() {
  const run = useBlueprintStore(s => s.run)

  return (
    <div className="flex gap-2 p-2 text-white justify-end">
      <button className="px-2 py-1 bg-blue-600 rounded" onClick={run}>Preview</button>
    </div>
  )
}