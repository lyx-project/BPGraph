import BlueprintDemo from '@/pages/BlueprintDemo'
import { GraphProvider } from '@/context/graph-context'

function App() {
  return (
    <GraphProvider>
      <BlueprintDemo />
    </GraphProvider>
  )
}

export default App
