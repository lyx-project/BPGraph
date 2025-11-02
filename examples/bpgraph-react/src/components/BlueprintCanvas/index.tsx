
import { GraphView } from '@bpgraph/react'
import { useBlueprintStore } from '@/store/useBlueprintStore'

import { MenuContainer } from "@/components/Menu/MenuContainer"
import { useEffect, useRef } from 'react'
import type { JsonGraph, NodeInstanceType } from '@bpgraph/core'
import { useGraph } from '@/context/graph-context'
import { SidePanel } from '../SidePanel'
import { useEngine } from '@/context/engine-context'

function openDB(dbName: string, storeName: string): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(dbName, 1);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveGraph(json: object) {
  const db = await openDB('bpgraph', 'graphs');
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction('graphs', 'readwrite');
    const store = tx.objectStore('graphs');
    store.put({ id: 1, data: json, updatedAt: Date.now() });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

async function loadGraph() {
  const db = await openDB('bpgraph', 'graphs');
  return new Promise((resolve, reject) => {
    const tx = db.transaction('graphs', 'readonly');
    const store = tx.objectStore('graphs');
    const request = store.get(1);
    request.onsuccess = () => resolve(request.result?.data || null);
    request.onerror = () => reject(request.error);
  });
}

function BlueprintCanvas() {
  const { openMenu, closeMenu } = useBlueprintStore()
  const hasLoadedRef = useRef(false)
  const graph = useGraph()
  const engine = useEngine()
  const handleBlankDoubleClick = (event: MouseEvent) => {
    openMenu('nodeList', { x: (event).clientX, y: (event).clientY })
  }

  useEffect(() => {
    if (hasLoadedRef.current) return
    hasLoadedRef.current = true
    loadGraph().then((data) => {
      if (data) graph.fromJSON(data as JsonGraph)
      if (data) engine.fromJSON(data as JsonGraph)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.preventDefault()
      const json = graph.toJSON()
      engine.fromJSON(json)
      saveGraph(json)
    }
  }

  const handleNodeSelection = (nodes: NodeInstanceType[]) => {
    if (nodes.length === 1) {
      useBlueprintStore.getState().setSelectedNode(nodes[0])
    } else {
      useBlueprintStore.getState().setSelectedNode(null)
    }
  }

  return (<>
    <GraphView
      graph={graph}
      onBlankDoubleClick={handleBlankDoubleClick}
      onNodeSelection={handleNodeSelection}
      onBlankClick={closeMenu}
      onNodeClick={closeMenu}
      onLinkClick={closeMenu}
      onDragStart={closeMenu}
      onKeyDown={handleKeyDown}
      onStartConnecting={closeMenu}
      className="graph-view" />
    <MenuContainer />
    <div className="absolute h-11/12 top-18 right-4">
      <SidePanel />
    </div>
  </>)
}

export default BlueprintCanvas
