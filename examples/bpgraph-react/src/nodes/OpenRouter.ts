import { type ExecutorFn } from '@bpgraph/core/engine'
import { Node } from '@bpgraph/core'

function getOpenRouterApiKey() {
  return localStorage.getItem('openrouter_API_KEY') || ''
}

export class OpenRouter extends Node {
  static definition = {
    type: 'default',
    title: 'OpenRouter',
    inputs: [
      { name: 'exec', type: 'exec' },
      { name: 'model', type: 'string', label: 'Model' },
      { name: 'userInput', type: 'string', label: 'User Input' },
      { name: 'prompt', type: 'textarea', label: 'Prompt' },
    ] as const,
    outputs: [
      { name: 'exec', type: 'exec' },
      { name: 'result', type: 'string', label: 'Result' },
    ] as const,
    style: {
      header: { background: '#6b21a8', color: '#fff' },
      ports: {
        input: {
          editor: {
            box: { width: 120 }
          }
        }
      }
    }
  }
}

export const OpenRouterExecutor: ExecutorFn = async ({ getInput, setOutput }) => {
  const userInput = getInput('userInput') as string
  const promptTemplate = (getInput('prompt') || '') as string
  const model = getInput('model') as string

  if (!model) {
    throw new Error("Missing model input")
  }

  const message = promptTemplate
    .replace('{{input}}', userInput)

  const isChatModel = model.includes("gpt") || model.includes("chat") || model.includes("gemini")

  const body = isChatModel
    ? {
        model: model,
        messages: [{ role: "user", content: message }],
        // temperature: 0.5,
        max_tokens: 4000,
      }
    : {
        model: model,
        prompt: message,
        // temperature: 0.5,
        max_tokens: 4000,
      }

  const endpoint = isChatModel
    ? "https://openrouter.ai/api/v1/chat/completions"
    : "https://openrouter.ai/api/v1/completions"

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${getOpenRouterApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(`OpenRouter fetch failed: ${response.status}`)
  }

  const data = await response.json()

  let outputText: string
  if (isChatModel) {
    outputText = data.choices?.[0]?.message?.content ?? ""
  } else {
    outputText = data.choices?.[0]?.text ?? ""
  }

  setOutput('result', outputText.trim())
}