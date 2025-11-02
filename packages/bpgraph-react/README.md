# @bpgraph/react

**@bpgraph/react** is a lightweight React wrapper built on top of **@bpgraph/core**.  
It provides convenient components and context utilities to simplify graph rendering and management within React applications.

---

## Overview

This package offers two main features:

1. **Graph Context** – a React context to easily manage and access a shared graph instance.  
2. **GraphView Component** – a React component for displaying and interacting with the graph.

---

## Graph Context

You can create a graph context using the `createGraphContext` function.  
It sets up a provider and a custom hook for accessing the graph instance anywhere in your React component tree.

### Example

```ts
// context/graph-context.ts
import { createGraphContext } from '@bpgraph/react'

const registry = createRegistry()

const graphOptions = {
  background: '#000000',
  gridSize: 10,
  drawGrid: {
    size: 10,
    color: 'rgba(255, 255, 255, 0.2)',
    thickness: 1,
  },
}

export const { GraphProvider, useGraph } = createGraphContext(registry, graphOptions)
```

---

## Usage

Wrap your application (or any part of it) with the `GraphProvider`.  
Then, use the `useGraph()` hook to access the graph instance and the `GraphView` component to render it.

### Example

```tsx
// App.tsx
import { GraphProvider, useGraph } from './context/graph-context'
import { GraphView } from '@bpgraph/react'

const App = () => {
  return (
    <GraphProvider>
      <Component />
    </GraphProvider>
  )
}

const Component = () => {
  const graph = useGraph()

  return (
    <div>
      <GraphView />
    </div>
  )
}
```

---

## API

### `createGraphContext(registry, options)`
Creates a React context for your graph instance.

- **Parameters:**
  - `registry`: The node and edge registry from `@bpgraph/core`.
  - `options`: Configuration object for initializing the graph (e.g., grid, background color).

- **Returns:**
  - `GraphProvider`: React component that provides the graph context.
  - `useGraph()`: Hook for accessing the graph instance.

---

## License
MIT © bpgraph
