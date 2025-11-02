import { useGraph } from '@/context/graph-context'
import { type NodeInstanceType } from '@bpgraph/core'
import { useEffect, useState } from 'react'

export default function NodeDetail({ node, onClose }: { node: NodeInstanceType, onClose: () => void }) {
  const graph = useGraph()
  const inputs = (node.inputs || []).filter(input => input.type !== 'exec' && input.type !== 'spacer')
  const outputs = (node.outputs || []).filter(output => output.type !== 'exec' && output.type !== 'spacer')
  const nodeType = node.type

  const [inputsValues, setInputsValues] = useState(inputs)
  const [outputsValues, setOutputsValues] = useState(outputs)

  const handleInput = (e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>, input: typeof inputs[number]) => {
    let value: string | number = e.currentTarget.value
    if (input.type === 'number') {
      value = Number(value)
    }
    node.values = {
      [input.name]: value
    }
  }
  const [values, setValues] = useState(node.values || {})
  useEffect(() => {
    const inputs = (node.inputs || []).filter(input => input.type !== 'exec' && input.type !== 'spacer')
    const outputs = (node.outputs || []).filter(output => output.type !== 'exec' && output.type !== 'spacer')
    setInputsValues(inputs)
    setOutputsValues(outputs)
    setValues({...node.values})
  }, [node])
  useEffect(() => {
    const handle = (node: NodeInstanceType, type: string) => {
      if (type === 'values') {
        setValues({...node.values})
      }
      if (type === 'inputs') {
        const inputs = (node.inputs || []).filter(input => input.type !== 'exec' && input.type !== 'spacer')
        setInputsValues(inputs)
      }
      if (type === 'outputs') {
        const outputs = (node.outputs || []).filter(output => output.type !== 'exec' && output.type !== 'spacer')
        setOutputsValues(outputs)
      }
    }
    graph.on('node:changed', handle)
    return () => {
      graph.off('node:changed', handle)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleRemoveCase = (inputName: string) => {
    if (nodeType !== 'switch') return
    const switchNode = node as NodeInstanceType
    switchNode.inputs = switchNode.inputs.filter(input => input.name !== inputName)
    switchNode.outputs = switchNode.outputs.filter(output => output.name !== inputName.replace('_value', ''))
  }
  const nodeSettingRender = () => {
    if (node.nodeType === 'OpenRouter') {
      const key = `openrouter_API_KEY`
      const apiKey = localStorage.getItem(key)
      return (
        <div className="border-b border-gray-700 p-3">
          <div className="mt-2">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
              onClick={() => {
                const apiKey = prompt('Enter your API Key:')
                if (apiKey) {
                  localStorage.setItem(key, apiKey)
                }
              }}
            >
              {apiKey ? 'API Key' : 'API Key'}
            </button>
            {apiKey ? (
              <span className="ml-2 text-sm text-green-400">API Key Set</span>
            ) : (
              <span className="ml-2 text-sm text-red-400">No API Key</span>
            )}
          </div>
        </div>
      )

    }
    return ''
  }
  
  return (
    <div className="flex flex-col h-full w-80 bg-neutral-900 rounded-2xl overflow-hidden border border-gray-700">

      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-700 p-3">
        <h2 className="text-lg font-bold text-white">{node.title || node.nodeType}</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition"
        >
          ✕
        </button>
      </div>

      {/* <h3 className="text-lg font-bold mb-2">{node.title ?? 'Untitled Node'}</h3> */}

      <div className="border-b border-gray-700 p-3">
        <p className="text-sm text-gray-400 mb-2">Type: {node.nodeType}</p>
        <p className="text-sm text-gray-400">ID: {node.id}</p>
      </div>

      {nodeSettingRender()}

      <div className="border-b border-gray-700 p-3">
        <div className="mb-4">
          <h4 className="font-semibold">Inputs</h4>
          <div className="list-disc">
            {inputsValues.map((input) => (
              <div key={input.id} className="text-sm text-gray-300 mb-4 mt-4">
                <label className="block font-medium mb-1" htmlFor={input.name}>
                  {input.label ?? input.name} <span className="text-gray-500">({input.name})</span>
                  <span className="text-gray-500"> {input.type} </span>
                  {nodeType === 'switch' && input.name.startsWith('case_') ? (
                    <span className="cursor-pointer ml-1" onClick={() => handleRemoveCase(input.name)}>x</span>
                  ) : null}
                </label>
                {input.type === "string" || input.type === "number" ? (
                  <input
                    name={input.name}
                    type={input.type === "number" ? "number" : "text"}
                    value={values[input.name] as string || ''}
                    onInput={e => handleInput(e, input)}
                    className="w-full rounded bg-neutral-800 text-gray-200 px-2 py-1 text-sm border border-neutral-700 focus:outline-none"
                    placeholder={`Enter ${input.type}`}
                  />
                ) : null}
                {input.type === "textarea" ? (
                  <textarea
                    name={input.name}
                    value={values[input.name] as string || ''}
                    onInput={e => handleInput(e, input)}
                    className="w-full rounded bg-neutral-800 text-gray-200 px-2 py-1 text-sm border border-neutral-700 focus:outline-none"
                    placeholder="Enter text"
                    rows={3}
                  />
                ) : null}
                {input.type === "boolean" ? (
                  <input
                    name={input.name}
                    onChange={e => handleInput(e, input)}
                    type="checkbox"
                    checked={Boolean(values[input.name])}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                ) : null}
                {input.type === "select" ? (
                  <select
                    name={input.name}
                    value={values[input.name] as string || ''}
                    onChange={e => handleInput(e, input)}
                    className="w-full rounded bg-neutral-800 text-gray-200 px-2 py-1 text-sm border border-neutral-700 focus:outline-none"
                  >
                    {input._options?.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-b border-gray-700 p-3">
        <div className="mb-4">
          <h4 className="font-semibold">Outputs</h4>
          <ul className="text-sm list-disc pl-4">
            {outputsValues.map((output) => (
              <li key={output.id}>{output.name} ({output.type})</li>
            )) || <li className="text-gray-500">No outputs</li>}
          </ul>
        </div>
      </div>
    </div>
  )
}