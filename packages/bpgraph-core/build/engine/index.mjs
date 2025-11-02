//#region src/utils/EventEmitter.ts
var EventEmitter = class {
	listeners = {};
	/**
	* Adds an event listener for the specified event.
	* @param event The event name.
	* @param handler The event handler.
	* @returns The EventEmitter instance.
	*/
	on(event, handler) {
		if (!this.listeners[event]) this.listeners[event] = /* @__PURE__ */ new Set();
		this.listeners[event].add(handler);
		return this;
	}
	/**
	* Adds a one-time event listener for the specified event.
	* @param event The event name.
	* @param handler The event handler.
	* @returns The EventEmitter instance.
	*/
	once(event, handler) {
		const wrapper = (...payload) => {
			this.off(event, wrapper);
			handler(...payload);
		};
		return this.on(event, wrapper);
	}
	/**
	* Removes an event listener for the specified event.
	* @param event The event name.
	* @param handler The event handler.
	* @returns The EventEmitter instance.
	*/
	off(event, handler) {
		if (!this.listeners[event]) return this;
		if (handler) this.listeners[event].delete(handler);
		else delete this.listeners[event];
		return this;
	}
	/**
	* Emits an event with the specified payload.
	* @param event The event name.
	* @param payload The event payload.
	* @returns The EventEmitter instance.
	*/
	emit(event, ...payload) {
		if (!this.listeners[event]) return this;
		for (const handler of this.listeners[event]) handler(...payload);
		return this;
	}
};

//#endregion
//#region src/engine/Engine.ts
var Engine = class extends EventEmitter {
	portConnectionValueMap = /* @__PURE__ */ new Map();
	errorNodes = /* @__PURE__ */ new Set();
	entryPorts = /* @__PURE__ */ new Set();
	subEntryPort = /* @__PURE__ */ new Map();
	flowStackGraph = /* @__PURE__ */ new Map();
	waitingGraph = /* @__PURE__ */ new Map();
	readyGraph = /* @__PURE__ */ new Map();
	subFlowStackGraph = /* @__PURE__ */ new Map();
	subWaitingGraph = /* @__PURE__ */ new Map();
	subReadyGraph = /* @__PURE__ */ new Map();
	runtime;
	options;
	constructor(runtime, options) {
		super();
		this.runtime = runtime;
		this.options = options || { ctx: {} };
	}
	/**
	* Executes a node in the graph.
	* @param node The node instance to execute.
	* @param ctx The execution context.
	*/
	async executeNode(node, opt) {
		const ctx = this.buildExecContext(node, opt);
		this.runtime.executeNode(node, ctx);
		return this;
	}
	/**
	* Runs a node in the graph.
	* @param args The arguments to pass to the node.
	*/
	async runNode(nodeType, options, opt) {
		const instance = this.createNodeInstance(nodeType, options);
		return this.executeNode(instance, opt);
	}
	/**
	* Creates a new node instance. {@link Runtime.createNodeInstance}
	* @param args The arguments to pass to createNodeInstance.
	* @returns The created node instance.
	*/
	createNodeInstance(...args) {
		return this.runtime.createNodeInstance(...args);
	}
	/**
	* Processes a JSON graph.
	* @param json The JSON representation of the graph.
	*/
	fromJSON(json) {
		this.portConnectionValueMap.clear();
		this.errorNodes.clear();
		if (typeof json === "string") json = JSON.parse(json);
		this.flowStackGraph.clear();
		this.waitingGraph.clear();
		this.readyGraph.clear();
		this.subFlowStackGraph.clear();
		this.subWaitingGraph.clear();
		this.subReadyGraph.clear();
		const { nodes, links, subgraphs } = this.runtime.fromJSON(json);
		const startNodes = this.findStartNodes(nodes);
		const subgraphIds = /* @__PURE__ */ new Set();
		for (const startNode of startNodes) {
			const { subgraphIds: generateSubgraphIds } = this.generateDependencies(startNode, nodes, links, this.flowStackGraph);
			generateSubgraphIds.forEach((id) => subgraphIds.has(id) || subgraphIds.add(id));
			this.entryPorts.add(startNode.id + ":" + (startNode.outputs.find((o) => o.type === "exec")?.id || ""));
		}
		do {
			const subgraphId = subgraphIds.values().next().value;
			subgraphIds.delete(subgraphId);
			if (this.subFlowStackGraph.has(subgraphId)) continue;
			const subgraph = subgraphs[subgraphId];
			if (!subgraph) continue;
			this.subWaitingGraph.set(subgraphId, /* @__PURE__ */ new Map());
			this.subReadyGraph.set(subgraphId, /* @__PURE__ */ new Map());
			this.subWaitingGraph.set(subgraphId, /* @__PURE__ */ new Map());
			const { nodes: subNodes, links: subLinks } = subgraph;
			const subStartNode = this.findStartNodes(subNodes)[0];
			this.subEntryPort.set(subgraphId, subStartNode.id + ":" + (subStartNode.outputs.find((o) => o.type === "exec")?.id || ""));
			const subFlowMap = /* @__PURE__ */ new Map();
			const { subgraphIds: generateSubgraphIds } = this.generateDependencies(subStartNode, subNodes, subLinks, subFlowMap);
			generateSubgraphIds.forEach((id) => subgraphIds.has(id) || subgraphIds.add(id));
			this.subFlowStackGraph.set(subgraphId, subFlowMap);
		} while (subgraphIds.size > 0);
	}
	/**
	* Processes the input data through the graph.
	* @param input The input data to process through the graph.
	*/
	process(input) {
		this.waitingGraph.clear();
		this.readyGraph.clear();
		this.subWaitingGraph.forEach((_, key) => this.subWaitingGraph.set(key, /* @__PURE__ */ new Map()));
		this.subReadyGraph.forEach((_, key) => this.subReadyGraph.set(key, /* @__PURE__ */ new Map()));
		const ready = this.readyGraph;
		for (const entryPort of this.entryPorts) {
			const entryPortGraphNode = this.flowStackGraph.get(entryPort);
			if (!entryPortGraphNode) continue;
			const startNode = entryPortGraphNode.node;
			if (startNode.outputs.length > 1) startNode.setOutput(startNode.outputs[1].name, input);
			ready.set(startNode.id, entryPortGraphNode);
			this.executeEntry(entryPort, void 0, input);
		}
	}
	async executeSubgraph(graphNode, ready, error) {
		const { node, dataInputs } = graphNode;
		const subgraphId = node.subgraphId;
		const subEntryPort = this.subEntryPort.get(subgraphId);
		const graph = this.subFlowStackGraph.get(subgraphId);
		if (graph.has(subEntryPort)) {
			const subStartNodeGraph = graph.get(subEntryPort);
			if (dataInputs) for (const depPort of Object.values(dataInputs)) {
				const depNodeId = depPort.split(":")[0];
				const depNode = ready.get(depNodeId)?.node;
				if (depNode) {
					const outputId = depPort.split(":")[1];
					const outputName = depNode.outputs.find((o) => o.id === outputId)?.name || "";
					const subOutputName = subStartNodeGraph.node.outputs.find((o) => o.type !== "exec")?.name || "";
					if (depNode.getOutput(outputName) && subOutputName) subStartNodeGraph.node.setOutput(subOutputName, depNode.getOutput(outputName));
				}
			}
			this.subReadyGraph.get(subgraphId).set(subStartNodeGraph.node.id, subStartNodeGraph);
			await this.executeEntry(subEntryPort, subgraphId, error);
			for (const outPort of graph.values()) if (outPort.node.id === node.id && outPort.port.id.startsWith("out-")) for (const next of outPort.next) await this.executeEntry(next, subgraphId, error);
		}
		const execPort = node.outputs.find((o) => o.type === "exec");
		if (!execPort) return;
		const execPortId = node.id + ":" + execPort.id;
		this.executeEntry(execPortId, "", error);
	}
	async executeEntry(portId, subgraphId = "", error) {
		const graph = subgraphId ? this.subFlowStackGraph.get(subgraphId) : this.flowStackGraph;
		const waiting = subgraphId ? this.subWaitingGraph.get(subgraphId) : this.waitingGraph;
		const ready = subgraphId ? this.subReadyGraph.get(subgraphId) : this.readyGraph;
		const graphNode = graph.get(portId);
		if (!graphNode) return;
		const { node, port, dataInputs } = graphNode;
		if (port.id.startsWith("in-")) {
			if (node.type === "subgraph" && node.subgraphId) {
				await this.executeSubgraph(graphNode, ready, error);
				return;
			} else if (node.type === "end") {
				if (subgraphId) {
					const parentNode = this.getNodeBySubgraphId(subgraphId);
					for (const outPort of graph.values()) if (outPort.node.id === parentNode.id && outPort.port.id.startsWith("out-")) for (const next$1 of outPort.next) await this.executeEntry(next$1, "", error);
				}
				return;
			}
			if (dataInputs) for (const depPort of Object.values(dataInputs)) {
				const depNodeId = depPort.split(":")[0];
				if (!ready.has(depNodeId)) {
					waiting.set(portId, graphNode);
					return;
				}
			}
			const next = async (nextExecs) => {
				ready.set(node.id, graphNode);
				waiting.delete(portId);
				if (nextExecs && nextExecs.length > 0) {
					const execPorts = node.outputs.filter((o) => o.type === "exec" && nextExecs.includes(o.name));
					const tasks = execPorts.map((outPort) => {
						const portId$1 = node.id + ":" + outPort.id;
						return this.executeEntry(portId$1, subgraphId, error);
					});
					await Promise.all(tasks);
				} else {
					const execPorts = node.outputs.filter((o) => o.type === "exec");
					const tasks = execPorts.map((outPort) => {
						const portId$1 = node.id + ":" + outPort.id;
						return this.executeEntry(portId$1, subgraphId, error);
					});
					await Promise.all(tasks);
				}
			};
			try {
				this.prepareInputs(graphNode, ready);
				const opt = {
					ctx: this.options.ctx || {},
					error,
					next
				};
				const ctx = this.buildExecContext(node, opt);
				ctx.next = next;
				await this.runtime.executeNode(node, ctx);
				ctx.next = () => {};
			} catch (err) {
				error = err;
				console.error(`Node ${portId} execution failed`, err);
				this.errorNodes.add(node.id);
			}
		} else if (port.id.startsWith("out-")) {
			const tasks = graphNode.next.map((next) => {
				return this.executeEntry(next, subgraphId, error);
			});
			await Promise.all(tasks);
		}
	}
	setOptions(options) {
		this.options = options || {};
	}
	setCtx(ctx) {
		this.options.ctx = ctx;
	}
	getNodeBySubgraphId(subgraphId) {
		for (const graphNode of this.flowStackGraph.values()) if (graphNode.node.type === "subgraph" && graphNode.node.subgraphId === subgraphId) return graphNode.node;
		throw new Error(`Cannot find subgraph node for subgraphId: ${subgraphId}`);
	}
	generateDependencies(start, nodes, links, flowMap) {
		flowMap = flowMap || /* @__PURE__ */ new Map();
		const nodePortsMap = /* @__PURE__ */ new Map();
		for (const node of nodes) {
			for (const input of node.inputs) nodePortsMap.set(node.id + ":" + input.id, {
				node,
				port: input,
				nexts: [],
				prevs: []
			});
			for (const output of node.outputs) nodePortsMap.set(node.id + ":" + output.id, {
				node,
				port: output,
				nexts: [],
				prevs: []
			});
		}
		for (const link of links) {
			const source = link.source.port.startsWith("out-") ? link.source : link.target;
			const target = link.source.port.startsWith("out-") ? link.target : link.source;
			const sourceItem = nodePortsMap.get(source.id + ":" + source.port);
			const targetItem = nodePortsMap.get(target.id + ":" + target.port);
			sourceItem.nexts.push({
				node: targetItem.node,
				port: targetItem.port
			});
			targetItem.prevs.push({
				node: sourceItem.node,
				port: sourceItem.port
			});
		}
		const subgraphIds = /* @__PURE__ */ new Set();
		const dfs = (node) => {
			node.inputs.forEach((input) => {
				if (input.type === "exec") return;
				const key = node.id + ":" + input.id;
				const item = nodePortsMap.get(key);
				if (item.prevs.length > 0) item.prevs.forEach((n) => {
					this.generateDataDependencies(n.node, node, n.port, input, flowMap);
				});
			});
			const nextNodes = /* @__PURE__ */ new Set();
			node.outputs.forEach((output) => {
				if (output.type !== "exec") return;
				const key = node.id + ":" + output.id;
				const item = nodePortsMap.get(key);
				if (item.nexts.length > 0) item.nexts.forEach((n) => {
					this.generateFlowStackGraph(node, n.node, output, n.port, flowMap);
					if (n.node.type === "subgraph" && n.node.subgraphId) subgraphIds.add(n.node.subgraphId);
					if (!nextNodes.has(n.node)) nextNodes.add(n.node);
				});
			});
			for (const nextNode of nextNodes) dfs(nextNode);
		};
		dfs(start);
		return {
			flowMap,
			subgraphIds
		};
	}
	emit(...args) {
		super.emit(...args);
		this.handleNodeEvents(...args);
		return this;
	}
	handleNodeEvents(...args) {
		const eventName = args[0];
		const payloads = args.slice(1);
		this.runtime.nodeListeners.forEach(async (node, nodeId) => {
			const subgraphId = node.subgraphId;
			const onEvent = node.onEvent;
			if (onEvent) {
				const graph = subgraphId ? this.subFlowStackGraph.get(subgraphId) : this.flowStackGraph;
				if (!graph) return;
				const ctx = this.buildExecContext(node, {
					error: node.error,
					ctx: this.options.ctx || {}
				});
				const resposes = onEvent(eventName, ...payloads, ctx);
				if (resposes && resposes.trigger) {
					const tasks = [];
					for (const inPort of graph.values()) if (inPort.node.id === nodeId && inPort.port.id.startsWith("in-")) {
						const prev = inPort.prev;
						const portId = inPort.node.id + ":" + inPort.port.id;
						for (const prevId of prev) {
							const prevPort = graph.get(prevId);
							const error = prevPort.node.error;
							tasks.push(this.executeEntry(portId, subgraphId, error));
						}
					}
					await Promise.all(tasks);
				}
			}
		});
	}
	/** Builds the execution context for a node. */
	buildExecContext(node, opt = {}) {
		const weakRef = new WeakRef(node);
		const inputs = node.inputs.filter((i) => i.type !== "exec" && i.type !== "spacer");
		const outputs = node.outputs.filter((o) => o.type !== "exec" && o.type !== "spacer");
		return {
			getInput: (name) => {
				const node$1 = weakRef.deref();
				if (!node$1) throw new Error("Node instance has been garbage collected.");
				return node$1.getInput(name);
			},
			setOutput: (name, value) => {
				const node$1 = weakRef.deref();
				if (!node$1) throw new Error("Node instance has been garbage collected.");
				node$1.setOutput(name, value);
			},
			services: { get: (serviceName) => this.runtime.getService(serviceName) },
			emitEvent: (eventName, ...args) => {
				this.emit(eventName, ...args);
			},
			next: () => {},
			data: node.data,
			ctx: opt.ctx,
			error: opt.error,
			inputs,
			outputs
		};
	}
	prepareInputs(graphNode, ready) {
		const { dataInputs, node } = graphNode;
		if (dataInputs) for (const [inputKey, depPort] of Object.entries(dataInputs)) {
			const depNodeId = depPort.split(":")[0];
			const depNode = ready.get(depNodeId)?.node;
			if (depNode) {
				const inputId = inputKey;
				const inputName = node.inputs.find((i) => i.id === inputId)?.name || "";
				const outputId = depPort.split(":")[1];
				const outputName = depNode.outputs.find((o) => o.id === outputId)?.name || "";
				if (depNode.getOutput(outputName)) node.setInput(inputName, depNode.getOutput(outputName));
			}
		}
	}
	generateFlowStackGraph(source, target, sourcePort, targetPort, flowMap = /* @__PURE__ */ new Map()) {
		const sourceKey = source.id + ":" + sourcePort.id;
		const targetKey = target.id + ":" + targetPort.id;
		if (!flowMap.has(sourceKey)) flowMap.set(sourceKey, {
			node: source,
			port: {
				name: sourcePort.name,
				type: sourcePort.type,
				id: sourcePort.id || ""
			},
			next: [targetKey],
			prev: [],
			dataInputs: {}
		});
		else {
			const sourceFlowItem = flowMap.get(sourceKey);
			sourceFlowItem.next.push(targetKey);
		}
		if (!flowMap.has(targetKey)) flowMap.set(targetKey, {
			node: target,
			port: {
				name: targetPort.name,
				type: targetPort.type,
				id: targetPort.id || ""
			},
			prev: [sourceKey],
			next: [],
			dataInputs: {}
		});
		else {
			const targetFlowItem = flowMap.get(targetKey);
			targetFlowItem.prev.push(sourceKey);
		}
	}
	generateDataDependencies(source, target, sourcePort, targetPort, flowMap = /* @__PURE__ */ new Map()) {
		const sourceKey = source.id + ":" + sourcePort.id;
		const targetPorts = target.inputs.filter((i) => i.type === "exec").map((i) => i.id);
		for (const port of targetPorts) {
			const key = target.id + ":" + port;
			const item = flowMap.get(key);
			if (item) item.dataInputs[targetPort.id] = sourceKey;
		}
	}
	findStartNodes(nodes) {
		return nodes.filter((node) => {
			return node.type === "start";
		});
	}
};

//#endregion
//#region src/VariableManager.ts
var VariableManager = class {
	variables = /* @__PURE__ */ new Map();
	setVariable(variable) {
		this.variables.set(variable.name, variable);
		return this;
	}
	setVariableValue(name, value) {
		const variable = this.variables.get(name);
		if (!variable) throw new Error(`Variable "${name}" does not exist.`);
		switch (variable.type) {
			case "string":
				if (typeof value !== "string") throw new Error(`Variable "${name}" expects a string value.`);
				break;
			case "number":
				if (typeof value !== "number") throw new Error(`Variable "${name}" expects a number value.`);
				break;
			case "boolean":
				if (typeof value !== "boolean") throw new Error(`Variable "${name}" expects a boolean value.`);
				break;
			case "array":
				if (!Array.isArray(value)) throw new Error(`Variable "${name}" expects an array value.`);
				break;
			case "object":
				if (typeof value !== "object" || Array.isArray(value) || value === null) throw new Error(`Variable "${name}" expects an object value.`);
				break;
			case "any": break;
			default: throw new Error(`Unknown variable type for "${name}".`);
		}
		this.variables.set(name, {
			...variable,
			value
		});
		return this;
	}
	getVariable(name) {
		return this.variables.get(name);
	}
	getVariableValue(name) {
		const variable = this.variables.get(name);
		if (!variable) return;
		return variable.value;
	}
	deleteVariable(name) {
		this.variables.delete(name);
		return this;
	}
	getAllVariables() {
		return Array.from(this.variables.values());
	}
	clear() {
		this.variables.clear();
		return this;
	}
};

//#endregion
//#region src/engine/Runtime.ts
var Runtime = class Runtime {
	executors = /* @__PURE__ */ new Map();
	services = /* @__PURE__ */ new Map();
	variableManager = new VariableManager();
	static NodeInstance;
	nodeRegistry;
	nodeListeners = /* @__PURE__ */ new Map();
	constructor(nodeRegistry) {
		this.nodeRegistry = nodeRegistry;
	}
	/** @inheritdoc {@link IRuntime.getService} */
	registerExecutor(type, executor) {
		this.executors.set(type, executor);
		return this;
	}
	/** @inheritdoc {@link IRuntime.registerService} */
	registerService(name, factory) {
		let instance = factory();
		if (typeof instance === "object" && instance !== null) instance = new WeakRef(instance);
		this.services.set(name, instance);
		return this;
	}
	/** @inheritdoc {@link IRuntime.hasExecutor} */
	hasExecutor(type) {
		return this.executors.has(type);
	}
	/** @inheritdoc {@link IRuntime.getExecutor} */
	getExecutor(type) {
		if (!this.hasExecutor(type)) return void 0;
		return this.executors.get(type);
	}
	/** @inheritdoc {@link IRuntime.hasService} */
	hasService(name) {
		return this.services.has(name);
	}
	/** @inheritdoc {@link IRuntime.getService} */
	getService(name) {
		if (!this.hasService(name)) throw new Error(`No service registered with name "${name}".`);
		const ref = this.services.get(name);
		if (ref instanceof WeakRef) {
			const deref = ref.deref();
			if (deref === void 0) {
				this.services.delete(name);
				throw new Error(`Service "${name}" has been garbage collected.`);
			}
			return deref;
		}
	}
	/** Creates a new instance of a node. */
	createNodeInstance(nodeType, options) {
		if (!this.nodeRegistry.isRegistered(nodeType)) {
			if (typeof nodeType === "string") throw new Error(`Node type "${nodeType}" is not registered.`);
			else if (nodeType.constructor && "name" in nodeType.constructor) throw new Error(`Node type "${nodeType.constructor.name}" is not registered.`);
		}
		let NodeClass;
		if (typeof nodeType === "string") NodeClass = this.nodeRegistry.get(nodeType);
		else NodeClass = nodeType;
		const nodeInstance = new Runtime.NodeInstance(NodeClass, options);
		if (NodeClass.onEvent) {
			nodeInstance.onEvent = NodeClass.onEvent;
			nodeInstance.id = nodeInstance.id ?? `node_${Math.random().toString(36).slice(2, 11)}`;
			this.nodeListeners.set(nodeInstance.id, nodeInstance);
		}
		return nodeInstance;
	}
	/**
	* Executes a node in the graph.
	* @param node The node instance to execute.
	* @param ctx The execution context.
	*/
	async executeNode(node, ctx) {
		const executor = this.getExecutorForNode(node);
		if (!executor) throw new Error(`No executor for ${node.nodeType}`);
		try {
			await executor(ctx);
			node.error = void 0;
		} catch (err) {
			node.error = err;
			throw err;
		}
		return this;
	}
	/**
	* Checks if there is an executor available for the given node.
	* @param node The node instance to check.
	* @returns True if an executor is available, false otherwise.
	*/
	hasExecutorForNode(node) {
		if (typeof node.executor === "function") return true;
		return this.hasExecutor(node.executor ?? "") || this.hasExecutor(node.nodeType);
	}
	/**
	* Gets the executor function for a specific node.
	* @param node The node instance to get the executor for.
	* @returns The executor function, or undefined if not found.
	*/
	getExecutorForNode(node) {
		if (typeof node.executor === "function") return node.executor;
		return this.getExecutor(node.executor ?? "") ?? this.getExecutor(node.nodeType);
	}
	fromJSON(json) {
		if (typeof json === "string") json = JSON.parse(json);
		const nodes = this.deserializeNodes(json.nodes);
		const links = json.links;
		const variables = json.variables;
		const jsonSubgraphs = json.subgraphs || [];
		const subgraphs = {};
		for (const [subgraphId, subgraph] of Object.entries(jsonSubgraphs)) {
			const subgraphNodes = this.deserializeNodes(subgraph.nodes, subgraphId);
			const subgraphLinks = subgraph.links;
			subgraphs[subgraphId] = {
				nodes: subgraphNodes,
				links: subgraphLinks
			};
		}
		this.variableManager.clear();
		for (const variable of variables) this.variableManager.setVariable({
			name: variable.name,
			type: variable.type,
			value: variable.value
		});
		return {
			nodes,
			links,
			subgraphs
		};
	}
	deserializeNodes(jsonNodes, subgraphId) {
		const nodes = [];
		for (const jsonNode of jsonNodes) {
			const node = this.createNodeInstance(jsonNode.nodeType, {
				id: jsonNode.id,
				data: jsonNode.data,
				values: jsonNode.values,
				subgraphId: jsonNode.subgraphId ?? subgraphId,
				inputs: jsonNode.inputs.some((input) => input.type) ? jsonNode.inputs.map((i) => ({
					type: i.type,
					name: i.name,
					id: i.id
				})) : void 0,
				outputs: jsonNode.outputs.some((output) => output.type) ? jsonNode.outputs.map((o) => ({
					type: o.type,
					name: o.name,
					id: o.id
				})) : void 0
			});
			if (!jsonNode.inputs.some((input) => input.type)) for (const jsonInput of jsonNode.inputs) {
				const input = node.inputs.find((i) => i.name === jsonInput.name);
				if (!input) continue;
				input.id = jsonInput.id;
			}
			if (!jsonNode.outputs.some((output) => output.type)) for (const jsonOutput of jsonNode.outputs) {
				const output = node.outputs.find((i) => i.name === jsonOutput.name);
				if (!output) continue;
				output.id = jsonOutput.id;
			}
			nodes.push(node);
		}
		return nodes;
	}
};
var NodeInstance = class {
	executor;
	data;
	inputValues = {};
	outputValues = {};
	inputs = [];
	outputs = [];
	id = "";
	error = void 0;
	subgraphId;
	constructor(NodeClass, options) {
		this.executor = NodeClass.executor;
		const type = NodeClass.definition.type || "default";
		const nodeType = NodeClass.type;
		const typeDesc = Object.getOwnPropertyDescriptor(this, "type");
		if (!typeDesc || typeDesc.configurable) Object.defineProperty(this, "type", {
			get() {
				return type;
			},
			configurable: false,
			enumerable: true
		});
		const nodeTypeDesc = Object.getOwnPropertyDescriptor(this, "nodeType");
		if (!nodeTypeDesc || nodeTypeDesc.configurable) Object.defineProperty(this, "nodeType", {
			get() {
				return nodeType;
			},
			configurable: false,
			enumerable: true
		});
		this.inputs = options?.inputs ?? structuredClone(NodeClass.definition.inputs.map((input) => ({
			id: input.id || "",
			name: input.name,
			type: input.type
		})));
		this.outputs = options?.outputs ?? structuredClone(NodeClass.definition.outputs.map((output) => ({
			id: output.id || "",
			name: output.name,
			type: output.type
		})));
		if (options?.data) this.data = options.data;
		if (options?.values) this.inputValues = { ...options.values };
		if (options?.id) this.id = options.id;
		if (options?.subgraphId) this.subgraphId = options.subgraphId;
	}
	getInput(name) {
		if (!this.inputs.find((input) => input.name === name)) throw new Error(`Input "${name}" not found in node "${this.nodeType}".`);
		return this.inputValues[name];
	}
	getOutput(name) {
		if (!this.outputs.find((output) => output.name === name)) throw new Error(`Output "${name}" not found in node "${this.nodeType}".`);
		return this.outputValues[name];
	}
	setInput(name, value) {
		const input = this.inputs.find((input$1) => input$1.name === name);
		if (!input) throw new Error(`Input "${name}" not found in node "${this.nodeType}".`);
		checkInputOrOutputType(input.type, value, `${this.nodeType}.${name}`, true);
		this.inputValues[name] = value;
	}
	setOutput(name, value) {
		const output = this.outputs.find((output$1) => output$1.name === name);
		if (!output) throw new Error(`Output "${name}" not found in node "${this.nodeType}".`);
		checkInputOrOutputType(output.type, value, `${this.nodeType}.${name}`, false);
		this.outputValues[name] = value;
	}
};
Runtime.NodeInstance = NodeInstance;
function checkInputOrOutputType(type, value, name, isInput) {
	switch (type) {
		case "string":
			if (typeof value !== "string") throw new TypeError(`${isInput ? "Input" : "Output"} "${name}" expects a string value.`);
			break;
		case "number":
			if (typeof value !== "number") throw new TypeError(`${isInput ? "Input" : "Output"} "${name}" expects a number value.`);
			break;
		case "boolean":
			if (typeof value !== "boolean") throw new TypeError(`${isInput ? "Input" : "Output"} "${name}" expects a boolean value.`);
			break;
		case "array":
			if (!Array.isArray(value)) throw new TypeError(`${isInput ? "Input" : "Output"} "${name}" expects an array value.`);
			break;
		case "object":
			if (typeof value !== "object" || Array.isArray(value) || value === null) throw new TypeError(`${isInput ? "Input" : "Output"} "${name}" expects an object value.`);
			break;
		case "any": break;
		default: throw new TypeError(`Unknown ${isInput ? "input" : "output"} type for "${name}".`);
	}
}

//#endregion
//#region src/utils/index.ts
function mergeDeep(target, source) {
	const output = { ...target };
	for (const key in source) if (Array.isArray(source[key])) output[key] = [...source[key]];
	else if (typeof source[key] === "object" && source[key] !== null) output[key] = mergeDeep(target[key] ?? {}, source[key]);
	else output[key] = source[key];
	return output;
}

//#endregion
//#region src/ChangedEvent.ts
const ChangedEventType = {
	Property: 1,
	Insert: 2,
	Delete: 3
};
var ChangedEvent = class ChangedEvent {
	static Property = ChangedEventType.Property;
	static Insert = ChangedEventType.Insert;
	static Delete = ChangedEventType.Delete;
	_change;
	_graph;
	_propertyName;
	_oldValue;
	_newValue;
	_object;
	get change() {
		return this._change;
	}
	set change(value) {
		this._change = value;
		this._propertyName = "";
	}
	get graph() {
		return this._graph;
	}
	set graph(value) {
		this._graph = value;
	}
	get propertyName() {
		return this._propertyName;
	}
	set propertyName(value) {
		this._propertyName = value;
	}
	get oldValue() {
		return this._oldValue;
	}
	set oldValue(value) {
		this._oldValue = value;
	}
	get newValue() {
		return this._newValue;
	}
	set newValue(value) {
		this._newValue = value;
	}
	get object() {
		return this._object;
	}
	set object(value) {
		this._object = value;
	}
	constructor() {
		this._change = ChangedEvent.Property;
		this._propertyName = "";
		this._oldValue = null;
		this._newValue = null;
		this._object = null;
	}
};

//#endregion
//#region src/Node.ts
var Node = class {
	static definition = {
		inputs: [],
		outputs: [],
		title: "",
		style: {}
	};
};

//#endregion
//#region src/builtin/nodes/index.ts
var StartNode = class extends Node {
	static definition = {
		inputs: [],
		outputs: [{
			name: "start",
			type: "exec"
		}, {
			name: "result",
			type: "any"
		}],
		style: { header: {
			background: "#4CAF50",
			color: "#FFFFFF"
		} },
		title: "Start",
		type: "start"
	};
	static type = "start";
};
var EndNode = class extends Node {
	static definition = {
		inputs: [{
			name: "end",
			type: "exec"
		}],
		outputs: [],
		style: { header: {
			background: "#F44336",
			color: "#FFFFFF"
		} },
		title: "End",
		type: "end"
	};
	static type = "end";
};
var SubgraphNode = class extends Node {
	static definition = {
		inputs: [{
			name: "subgraph",
			type: "exec"
		}, {
			name: "input",
			type: "any",
			label: ""
		}],
		outputs: [{
			name: "subgraph",
			type: "exec"
		}, {
			name: "input",
			type: "any",
			label: "Result"
		}],
		style: { header: {
			background: "#2196F3",
			color: "#FFFFFF"
		} },
		title: "Subgraph",
		type: "subgraph"
	};
	static type = "subgraph";
};
Object.defineProperty(StartNode, "type", {
	writable: false,
	configurable: false
});
Object.defineProperty(EndNode, "type", {
	writable: false,
	configurable: false
});
Object.defineProperty(SubgraphNode, "type", {
	writable: false,
	configurable: false
});
const builtinNodes = {
	[StartNode.type]: StartNode,
	[SubgraphNode.type]: SubgraphNode
};

//#endregion
//#region src/NodeRegistry.ts
const defaultNodeStyle = {
	background: "rgba(41, 44, 47, 1)",
	borderRadius: 6,
	highlightStroke: "blue",
	highlightStrokeWidth: 1,
	header: {
		height: 24,
		fontSize: 14,
		background: "rgba(60, 63, 67, 1)",
		color: "#fff",
		textAlign: "left",
		title: {
			x: 0,
			y: 0
		}
	},
	ports: {
		layout: {
			rowHeight: 24,
			gap: 10,
			top: 0,
			bottom: 0
		},
		input: {
			port: {
				fill: "rgba(41, 44, 47, 1)",
				stroke: "rgba(255, 255, 255, 0.5)"
			},
			label: {
				fontSize: 12,
				color: "#fff"
			},
			editor: {
				box: {
					background: "rgba(30, 33, 36, 0.8)",
					borderColor: "rgba(120, 130, 140, 0.3)",
					borderRadius: 4,
					color: "rgba(255, 255, 255, 0.9)",
					width: 80
				},
				dropdown: {
					background: "#222",
					borderColor: "#444",
					borderRadius: 4,
					color: "rgba(255, 255, 255)"
				}
			}
		},
		output: {
			port: {
				fill: "rgba(41, 44, 47, 1)",
				stroke: "rgba(255, 255, 255, 0.5)"
			},
			label: {
				fontSize: 12,
				color: "#fff"
			}
		}
	}
};
const defaultLinkStyle = {
	stroke: "rgba(255, 255, 255, 0.5)",
	strokeWidth: 1,
	highlightStroke: "blue",
	byPortType: {
		string: [
			"red",
			"yellow",
			"blue"
		],
		number: ["#81C784"],
		boolean: ["#FFD54F"]
	}
};
var NodeRegistry = class {
	registry = builtinNodes;
	nodeStyle;
	linkStyle;
	constructor(nodeStyle = {}, linkStyle = {}) {
		this.nodeStyle = mergeDeep(defaultNodeStyle, nodeStyle || {});
		this.linkStyle = mergeDeep(defaultLinkStyle, linkStyle || {});
	}
	register(nodeType, NodeClass) {
		const inputNameSet = /* @__PURE__ */ new Set();
		for (const input of NodeClass.definition.inputs) {
			if (inputNameSet.has(input.name)) throw new Error(`Input name "${input.name}" is duplicated in node type "${nodeType}".`);
			inputNameSet.add(input.name);
		}
		const outputNameSet = /* @__PURE__ */ new Set();
		for (const output of NodeClass.definition.outputs) {
			if (outputNameSet.has(output.name)) throw new Error(`Output name "${output.name}" is duplicated in node type "${nodeType}".`);
			outputNameSet.add(output.name);
		}
		this.registry[nodeType] = NodeClass;
		const desc = Object.getOwnPropertyDescriptor(NodeClass, "type");
		if (!desc || desc.configurable) Object.defineProperty(NodeClass, "type", {
			get() {
				return nodeType;
			},
			configurable: false,
			enumerable: true
		});
		return this;
	}
	get(nodeType) {
		if (nodeType === "end") return EndNode;
		if (!(nodeType in this.registry)) throw new Error(`Node type "${String(nodeType)}" is not registered.`);
		return this.registry[nodeType];
	}
	getNodeTypes() {
		return Object.keys(this.registry);
	}
	getNodeClasses() {
		return Object.values(this.registry);
	}
	isRegistered(nodeType) {
		if (nodeType === EndNode || nodeType === "end") return true;
		if (typeof nodeType === "string") return nodeType in this.registry;
		return Object.keys(this.registry).some((key) => this.registry[key] === nodeType);
	}
	getStartNodeClass() {
		return builtinNodes["start"];
	}
	getEndNodeClass() {
		return EndNode;
	}
};

//#endregion
export { Engine, NodeRegistry, Runtime };