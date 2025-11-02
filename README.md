# 🧩 @bpgraph/core

**bpgraph** is a lightweight node-based visual programming library built on top of [JointJS](https://www.jointjs.com/).
It allows you to easily build interactive flow editors for low-code platforms, AI pipelines, or data processing systems.

---

## ✨ Features

* 🔧 **Node System** – Define and register custom nodes via `NodeRegistry`.
* ⚙️ **Runtime Execution** – Manage node logic execution with `Runtime`.
* 🎨 **Custom Styling** – Fully customizable node styles (header color, input box width, etc.).
* 🧱 **Built on JointJS** – Reliable rendering and interaction engine.
* 🪶 **Lightweight Design** – Simple, minimal, and easy to extend.

---

## 📦 Installation

```bash
npm install @bpgraph/core
```

---

## 🧠 Core Concepts

| Concept          | Description                                                                |
| ---------------- | -------------------------------------------------------------------------- |
| **Node**         | The definition of a graph node, including its inputs, outputs, and styles. |
| **NodeRegistry** | Centralized registry for all available node types.                         |
| **Runtime**      | Execution engine that handles logic and data flow between nodes.           |
| **Graph**        | Manages node instances, connections, and graph structure.                  |
| **Engine**       | Controls workflow execution and orchestrates node processing.              |

---

## 🚀 Quick Example

### 1️⃣ Define a Node

Create a simple node file `nodes.ts`:

```ts
// nodes.ts
import { Node, NodeRegistry } from '@bpgraph/core'
import { Runtime } from '@bpgraph/core/engine'

// Define a sample node
class NodeA {
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
            box: { width: 120 },
          },
        },
      },
    },
  }
}

// Create a node registry
export function createRegistry() {
  return new NodeRegistry().register('nodeA', NodeA)
}

// Create runtime and register the executor
export function createRuntime() {
  return new Runtime(createRegistry()).registerExecutor(
    'nodeA',
    ({ getInput, setOutput, ctx, next }) => {
      // Example logic
      const input = getInput('userInput')
      setOutput('result', `Echo: ${input}`)
      next()
    }
  )
}
```

---

### 2️⃣ Create a Graph Instance

Then use your node registry in `index.ts`:

```ts
// index.ts
import { createRegistry } from './nodes'
import { Graph } from '@bpgraph/core'

const g = new Graph(createRegistry())
g.addNode('nodeA')
```

Now you can visually create an “OpenRouter” node in the editor.

---

## ⚡ Run Workflow with Engine

`Engine` is responsible for executing a graph workflow. It takes a `Runtime` instance that defines how each node runs and handles the execution order automatically.

### Example Usage

```ts
import { Engine } from '@bpgraph/core/engine'
import { createRuntime } from './nodes'

// Initialize the engine with your runtime
const engine = new Engine(createRuntime())

// Load a graph definition (from editor or JSON file)
engine.fromJSON(graph.toJSON())

// Start processing from a specific entry point
engine.process('Enter input')
```

### How It Works

* The **Engine** loads graph structure and node definitions via `fromJSON()`.
* It then resolves the execution flow based on node connections.
* When `process()` is called, it triggers node execution starting from the specified input or entry node.
* The `Runtime` handles individual node logic using the registered executors.

This makes it easy to execute entire node-based workflows programmatically — ideal for AI pipelines, automation flows, or custom computation graphs.

---

## 🧩 Extending bpgraph

You can easily extend **bpgraph** by:

* Adding new node types (e.g., condition checks, HTTP requests, AI inference)
* Customizing styles, ports, and layouts
* Implementing complex runtime logic (async tasks, context passing, error handling)

---

## 🧾 Runtime API

Each executor function has the following signature:

```ts
({
  getInput,      // (name: string) => any
  setOutput,     // (name: string, value: unknown) => void
  ctx,           // optional execution context
  next           // trigger the next connected node
}) => void
```
