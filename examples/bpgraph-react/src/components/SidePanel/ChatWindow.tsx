import { useState } from "react"
import { useEngine } from "@/context/engine-context"
type Message = {
  id: number
  role: "user" | "assistant"
  content: string
}

export default function ChatWindow({ onClose }: { onClose: () => void }) {
  const engine = useEngine()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")

  const handleSend = () => {
    if (!input.trim()) return
    engine.process(input)
    const newMessage: Message = {
      id: Date.now(),
      role: "user",
      content: input.trim(),
    }
    setMessages([...messages, newMessage])
    setInput("")

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), role: "assistant", content: "The workflow is in progress." },
      ])
    }, 600)
  }

  return (
    <div className="flex flex-col h-full w-80 bg-neutral-900 rounded-2xl overflow-hidden border border-gray-700">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-700 p-3">
        <h2 className="text-lg font-bold text-white">Preview</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 text-sm">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`px-3 py-2 rounded-2xl max-w-[70%] ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-gray-700 text-gray-100 rounded-bl-none"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="border-t border-gray-700 p-2 flex items-center gap-2">
        <input
          className="flex-1 bg-neutral-800 text-white px-3 py-2 rounded-xl outline-none"
          placeholder="Send a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition"
        >
          Send
        </button>
      </div>
    </div>
  )
}
