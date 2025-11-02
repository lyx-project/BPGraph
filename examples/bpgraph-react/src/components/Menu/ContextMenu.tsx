export function ContextMenu({ onClose }: { onClose: () => void }) {
  return (
    <div className="bg-gray-800 text-white rounded shadow-md">
      <div className="px-4 py-2 hover:bg-gray-700 cursor-pointer" onClick={onClose}>
        Remove
      </div>
      <div className="px-4 py-2 hover:bg-gray-700 cursor-pointer" onClick={onClose}>
        Copy
      </div>
    </div>
  )
}