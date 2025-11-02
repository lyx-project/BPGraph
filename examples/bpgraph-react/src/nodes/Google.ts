import { Node } from '@bpgraph/core'
import type { ExecutorFn } from '@bpgraph/core/engine'

export class Google extends Node {
  static definition = {
    inputs: [
      { name: 'exec', type: 'exec' },
      { name: 'query', type: 'string', label: 'Query', showInput: false },
    ] as const,
    outputs: [
      { name: 'exec', type: 'exec' },
      { name: 'input', type: 'string', label: 'Input' },
      { name: 'results', type: 'array', label: 'Results' },
    ] as const,
    style: {
      header: { background: '#4285F4', color: '#FFFFFF' }
    },
    title: 'Google Search',
    type: 'google'
  }

  static executor: ExecutorFn = async ({ getInput, setOutput, next }) => {
    const query = getInput<string>('query') || ''
    if (!query) return

    const apiKey = localStorage.getItem('google_API_KEY') || ''
    const cx = localStorage.getItem('google_SEARCH_ENGINE_ID') || ''
    try {
      const res = await fetch(
        `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}`
      )

      if (!res.ok) {
        console.error('Google Search API Error:', res.statusText)
        next()
        return
      }

      const data = await res.json()

      const results = (data.items || []).map((item: { title: string; link: string; snippet: string }) => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet,
      }))

      setOutput('results', results)
      next()
    } catch (err) {
      console.error('Google Search failed:', err)
    }
  }
}
