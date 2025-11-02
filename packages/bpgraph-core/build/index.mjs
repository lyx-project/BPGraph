import { Element, ElementView, Graph, Link, Link$1, Listener, Paper, Rect, V_default, config, curve, defaultsDeep, left, mask, right, standard_exports, svg } from "./vendor-CHy9MZSZ.js";

//#region src/adapters/joint/Util.ts
function initCharWidth(fontSize, fontFamily = "system-ui, Avenir, Helvetica, Arial, sans-serif", charWidthCache) {
	const canvas = document.createElement("canvas");
	const context = canvas.getContext("2d");
	context.font = `${fontSize}px ${fontFamily}`;
	const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ ";
	for (const char of chars) charWidthCache[char] = context.measureText(char).width;
}
function getCharWidthCache(fontSize) {
	const fontSizeCache = {};
	if (!fontSizeCache[fontSize]) {
		fontSizeCache[fontSize] = { default: fontSize * .5 };
		initCharWidth(fontSize, "system-ui, Avenir, Helvetica, Arial, sans-serif", fontSizeCache[fontSize]);
	}
	return fontSizeCache[fontSize];
}
function getTextWidth(text, fontSize) {
	let width = 0;
	const charWidthCache = getCharWidthCache(fontSize);
	for (const char of text) if (/[\u4e00-\u9fa5]/.test(char)) width += fontSize;
	else width += charWidthCache[char] ?? charWidthCache.default;
	return width;
}
function css(strings, ...values) {
	const result = strings.reduce((acc, str, i) => acc + str + (values[i] ?? ""), "");
	return result.replace(/\s+/g, " ").trim();
}

//#endregion
//#region src/adapters/joint/nodes/BlueprintNode.ts
var BlueprintNode = class extends Element {
	constructor(attributes = {}, options = {}) {
		const style = attributes.style || {};
		const nodeType = attributes.nodeType;
		const markup = [{
			tagName: "rect",
			groupSelector: "base-node-body"
		}, {
			tagName: "g",
			groupSelector: "base-node-title"
		}];
		if (nodeType === "switch") markup.push({
			tagName: "g",
			groupSelector: "switch-plus",
			children: [{
				tagName: "rect",
				groupSelector: "switch-plus-rect"
			}, {
				tagName: "path",
				groupSelector: "switch-plus-icon"
			}]
		});
		const rowHeight = style.ports?.layout?.rowHeight ?? 20;
		const rowSpacing = style.ports?.layout?.gap ?? 8;
		const portStroke = style.ports?.output?.port?.stroke ?? "rgba(255, 255, 255, 0.8)";
		super(defaultsDeep(attributes, {
			type: "custom.BlueprintNode",
			size: {
				width: 300,
				height: 100
			},
			inputs: [],
			outputs: [],
			attrs: {
				"base-node-body": {
					refWidth: "100%",
					refHeight: "100%",
					fill: style.background ?? "rgba(41, 44, 47, 0.9)",
					stroke: style.background ?? "rgba(41, 44, 47, 0.9)",
					strokeWidth: 1,
					rx: style.borderRadius ?? 8,
					ry: style.borderRadius ?? 8
				},
				"switch-plus": {
					cursor: "pointer",
					refX: "100%",
					refY: "100%",
					transform: "translate(-22, -" + (rowSpacing + rowHeight * .5) + ")"
				},
				"switch-plus-rect": {
					width: 12,
					height: 12,
					fill: "transparent",
					stroke: "transparent",
					strokeWidth: 1
				},
				"switch-plus-icon": {
					d: "M2 6 L10 6 M6 2 L6 10",
					stroke: portStroke,
					strokeWidth: 1.5,
					pointerEvents: "none"
				}
			},
			markup,
			ports: { groups: {
				in: {
					position: {
						name: "absolute",
						args: { x: 16 }
					},
					attrs: {
						portBody: {
							fill: style.ports?.input?.port?.fill ?? "rgba(255, 255, 255, 0.5)",
							stroke: style.ports?.input?.port?.stroke ?? "rgba(255, 255, 255, 0.8)",
							strokeWidth: style.ports?.input?.port?.strokeWidth ?? 1,
							r: 6,
							magnet: "inout",
							cursor: "crosshair"
						},
						portLabel: {
							x: 12,
							y: "0.3em",
							textAnchor: "start",
							fontSize: style.ports?.input?.label?.fontSize ?? 12,
							fill: style.ports?.input?.label?.color ?? "#fff"
						}
					}
				},
				out: {
					position: {
						name: "absolute",
						args: { x: "calc(w - 16)" }
					},
					attrs: {
						portBody: {
							fill: style.ports?.output?.port?.fill ?? "rgba(255, 255, 255, 0.5)",
							stroke: style.ports?.output?.port?.stroke ?? "rgba(255, 255, 255, 0.8)",
							strokeWidth: style.ports?.output?.port?.strokeWidth ?? 1,
							r: 6,
							magnet: "inout",
							cursor: "crosshair"
						},
						portLabel: {
							x: -12,
							y: "0.3em",
							textAnchor: "end",
							fontSize: style.ports?.output?.label?.fontSize ?? 12,
							fill: style.ports?.output?.label?.color ?? "#fff"
						}
					}
				}
			} }
		}), options);
	}
	initialize(...args) {
		super.initialize(...args);
		if (this.getPorts().length === 0) this.buildPortItems();
		this.on("change:inputs change:outputs", (_el, _changed, opt) => this.buildPortItems(opt));
	}
	title(value) {
		this.set("title", value);
		const titleWidth = value.length > 0 ? getTextWidth(value, this.get("style")?.header?.fontSize || 12) : 0;
		const size = this.get("size");
		const width = size?.width || 0;
		if (titleWidth + 35 > width) {
			this.resize(titleWidth + 35, size?.height || 100);
			return;
		}
		this.updateSizeByContent();
	}
	setStyle(style) {
		this.set("style", style);
	}
	setValues(values) {
		this.set("values", values);
	}
	buildPortItems(opt = {}) {
		const items = [];
		const inputs = this.get("inputs") || [];
		const outputs = this.get("outputs") || [];
		const style = this.get("style") || {};
		const HEADER_HEIGHT = style.header?.height ?? 24;
		const portHeight = style.ports?.layout?.rowHeight ?? 20;
		const portSpacing = style.ports?.layout?.gap ?? 8;
		const portTop = style.ports?.layout?.top ?? 0;
		for (const [index, input] of inputs.entries()) {
			if (input.type === "spacer") continue;
			items.push({
				...this.buildPortItem(input, "in"),
				id: input.id,
				group: "in",
				args: { y: HEADER_HEIGHT + index * portHeight + (index + 1) * portSpacing + portHeight / 2 + portTop }
			});
		}
		for (const [index, output] of outputs.entries()) {
			if (output.type === "spacer") continue;
			items.push({
				...this.buildPortItem(output, "out"),
				id: output.id,
				group: "out",
				args: { y: HEADER_HEIGHT + index * portHeight + (index + 1) * portSpacing + portHeight / 2 + portTop }
			});
		}
		this.startBatch("update-ports");
		this.prop(["ports", "items"], items, {
			...opt,
			rewrite: true
		});
		this.stopBatch("update-ports");
		this.updateSizeByContent();
	}
	buildPortItem(port, group) {
		const style = this.get("style") || {};
		const portHeight = style.ports?.layout?.rowHeight ?? 20;
		const left$1 = group === "in";
		const portStyle = left$1 ? style.ports?.input : style.ports?.output;
		const fontSize = portStyle?.label?.fontSize ?? 12;
		const color = portStyle?.label?.color ?? "#fff";
		const portLabelX = this.get("ports")?.groups?.in.attrs?.portLabel?.x || 12;
		const portLabelWidth = left$1 ? getTextWidth(port.label || "", fontSize) : 0;
		let showPort = port.showPort !== false;
		if (port.type === "select" && port.showPort !== true) showPort = false;
		const item = {
			height: portHeight,
			attrs: {
				portLabel: { text: port.label || "" },
				portForm: {
					x: portLabelX + portLabelWidth + 4,
					y: -portHeight / 2,
					width: style.ports?.input?.editor?.box?.width || 80,
					height: portHeight
				},
				portFormSvg: { transform: `translate(${portLabelX + portLabelWidth + 4}, ${-portHeight / 2})` },
				portFormWrap: { style: {
					textAlign: left$1 ? "left" : "right",
					fontSize: fontSize + "px",
					color
				} },
				field: { name: port.name }
			}
		};
		const formWrap = left$1 ? this.renderFormWrap(port) : "";
		item.markup = svg`
      ${showPort ? getPortIcon(port.type) : ""}
      <text @selector='portLabel' />
      ${formWrap ? formWrap : ""}
    `;
		return item;
	}
	renderFormWrap(input) {
		const showInput = input.showInput !== false;
		if (!showInput) return "";
		const style = this.get("style") || {};
		const values = this.get("values") || {};
		switch (input.type) {
			case "string": return renderString(input, style, values);
			case "number": return renderNumber(input, style, values);
			case "select": return renderSelect(input, style, values);
			case "boolean": return renderCheckbox(input, style, values);
			default: return "";
		}
	}
	updateSizeByContent() {
		const ports = this.getPorts();
		const style = this.get("style") || {};
		const title = this.get("title") || "";
		const nodeType = this.get("nodeType") || "";
		const headerFontSize = style.header?.fontSize ?? 12;
		const inputPorts = ports.filter((port) => port.group === "in");
		const outputPorts = ports.filter((port) => port.group === "out");
		const portCount = inputPorts.length > outputPorts.length ? inputPorts.length : outputPorts.length;
		const titleHeight = style.header?.height ?? 24;
		const portHeight = style.ports?.layout?.rowHeight ?? 20;
		const portGap = style.ports?.layout?.gap ?? 8;
		const paddingTop = style.ports?.layout?.top ?? 0;
		const paddingBottom = style.ports?.layout?.bottom ?? 20;
		const editorBoxWidth = style.ports?.input?.editor?.box?.width || 0;
		let portsHeight = portCount > 0 ? portCount * portHeight + (portCount + 1) * portGap : 0;
		if (nodeType === "switch") portsHeight += portHeight * .3 + portGap;
		const titleWidth = title.length > 0 ? getTextWidth(title, headerFontSize) : 0;
		const inputsWidth = inputPorts.length > 0 ? Math.max(...inputPorts.map((port) => {
			const label = port.attrs?.portLabel?.text ?? "";
			const markup = port.markup || [];
			const fontSize = style.ports?.input?.label?.fontSize || 12;
			const isPortForm = markup.some((m) => m.selector === "portForm");
			const inputWidth = isPortForm ? editorBoxWidth + 8 : 0;
			const labelWidth = label.length > 0 ? getTextWidth(label, fontSize) : 0;
			return labelWidth + 25 + inputWidth;
		})) : 0;
		const outputsWidth = outputPorts.length > 0 ? Math.max(...outputPorts.map((port) => {
			const label = port.attrs?.portLabel?.text ?? "";
			const fontSize = style.ports?.output?.label?.fontSize || 12;
			const labelWidth = label.length > 0 ? getTextWidth(label, fontSize) : 0;
			return labelWidth + 25;
		})) : 0;
		const minWidth = 120;
		const minHeight = 60;
		const height = Math.max(minHeight, titleHeight + portsHeight + paddingTop + paddingBottom);
		const width = Math.max(minWidth, titleWidth + 35, inputsWidth + outputsWidth + 14);
		this.resize(width, height);
	}
};
function getPortIcon(type) {
	switch (type) {
		case "exec": return `
      <path @selector='portBody' d="${squareArrowPath(12, 12)}" />
      <title>${type}</title>`;
		default: return `<circle @selector="portBody" r="6" />
      <title>${type}</title>`;
	}
}
function squareArrowPath(w, h) {
	const param = Math.max(w * .4, 0);
	const offsetX = w / 2;
	const offsetY = h / 2;
	return [
		`M${0 - offsetX},${0 - offsetY}`,
		`L${w - param - offsetX},${0 - offsetY}`,
		`L${w - offsetX},${h / 2 - offsetY}`,
		`L${w - param - offsetX},${h - offsetY}`,
		`L${0 - offsetX},${h - offsetY} Z`
	].join(" ");
}
function renderString(input, style, values) {
	const boxStyle = style.ports?.input?.editor?.box;
	const portHeight = style.ports?.layout?.rowHeight ?? 20;
	const inputStyle = css`
    outline: none;
    padding-left: 4px;
    padding-right: 4px;
    box-sizing: border-box;
    width: 100%;
    height: 22px;
    line-height: 22px;
    border: none;
    background: ${boxStyle?.background ?? "transparent"};
    color: ${boxStyle?.color ?? "#fff"};
    font-size: ${boxStyle?.fontSize ?? 12}px;
    border: 1px solid ${boxStyle?.borderColor ?? "rgba(255, 255, 255, 0.2)"};
    border-radius: ${boxStyle?.borderRadius ?? 4}px;
  `;
	return `
    <foreignObject @selector="portForm">
      <div @selector="portFormWrap"
        xmlns="http://www.w3.org/1999/xhtml"
        style="width:100%; height:100%;line-height: ${portHeight - 2}px;">
          <input @selector="field"
            xmlns="http://www.w3.org/1999/xhtml"
            type="text"
            style="${inputStyle}"
            value="${values[input.name] || ""}"
            />
      </div>
    </foreignObject>
  `;
}
function renderNumber(input, style, values) {
	const boxStyle = style.ports?.input?.editor?.box;
	const portHeight = style.ports?.layout?.rowHeight ?? 20;
	const inputStyle = css`
    outline: none;
    padding-left: 4px;
    padding-right: 4px;
    box-sizing: border-box;
    width: 100%;
    height: 22px;
    line-height: 22px;
    border: none;
    background: ${boxStyle?.background ?? "transparent"};
    color: ${boxStyle?.color ?? "#fff"};
    font-size: ${boxStyle?.fontSize ?? 12}px;
    border: 1px solid ${boxStyle?.borderColor ?? "rgba(255, 255, 255, 0.2)"};
    border-radius: ${boxStyle?.borderRadius ?? 4}px;
  `;
	const upArrowPath = "M2 8 L6 4 L10 8";
	const downArrowPath = "M2 3 L6 7 L10 3";
	return `
    <foreignObject @selector="portForm">
      <div @selector="portFormWrap"
        xmlns="http://www.w3.org/1999/xhtml"
        style="width:100%; height:100%;line-height: ${portHeight - 2}px;">
          <input @selector="field"
            xmlns="http://www.w3.org/1999/xhtml"
            type="text"
            style="${inputStyle}"
            value="${values[input.name] || ""}"
            />
        <svg width="12" height="20" style="position:absolute; right:2px; top:0;" viewBox="0 0 12 20">
          <rect width="12" height="11" y="0" fill="transparent" cursor="pointer" @selector="upArrow" />
          <rect width="12" height="11" y="11" fill="transparent" cursor="pointer" @selector="downArrow" />
          <path d="${upArrowPath}" stroke="currentColor" stroke-width="1.2" fill="transparent" pointer-events="none" />
          <path d="${downArrowPath}" stroke="currentColor" stroke-width="1.2" fill="transparent" pointer-events="none" transform="translate(0,11)" />
        </svg>
      </div>
    </foreignObject>
  `;
}
function renderSelect(input, style, values) {
	const boxStyle = style.ports?.input?.editor?.box;
	const portHeight = style.ports?.layout?.rowHeight ?? 20;
	const inputStyle = css`
    outline: none;
    padding-left: 4px;
    padding-right: 16px;
    box-sizing: border-box;
    width: 100%;
    height: 22px;
    line-height: 22px;
    border: none;
    background: ${boxStyle?.background ?? "transparent"};
    color: ${boxStyle?.color ?? "#fff"};
    font-size: ${boxStyle?.fontSize ?? 12}px;
    border: 1px solid ${boxStyle?.borderColor ?? "rgba(255, 255, 255, 0.2)"};
    border-radius: ${boxStyle?.borderRadius ?? 4}px;
    cursor: pointer;
  `;
	const value = values[input.name];
	const options = input._options || [];
	const label = options.find((opt) => opt.value === value)?.label || "";
	return `
    <foreignObject @selector="portForm">
      <div @selector="portFormWrap"
        xmlns="http://www.w3.org/1999/xhtml"
        style="width:100%; height:100%;line-height: ${portHeight - 2}px;">
          <input @selector="field"
            xmlns="http://www.w3.org/1999/xhtml"
            type="text"
            title="${label || ""}"
            style="${inputStyle}"
            value="${label || ""}"
            />
          <svg width="12" height="12" style="position:absolute; right:4px; top:6px; pointer-events:none;" viewBox="0 0 12 12">
            <path d="M2 4 L6 8 L10 4" stroke="currentColor" stroke-width="1.5" fill="transparent" />
          </svg>
      </div>
    </foreignObject>
    `;
}
function renderCheckbox(input, style, values) {
	return `
    <g @selector="portFormSvg">
      <rect
        @selector="field"
        xmlns="http://www.w3.org/2000/svg"
        x="0" y="4"
        width="16" height="16"
        rx="${style.ports?.input?.editor?.box?.borderRadius ?? 3}"
        ry="${style.ports?.input?.editor?.box?.borderRadius ?? 3}"
        fill="${values[input.name] ? style.ports?.input?.editor?.box?.background ?? "#ff6666" : "transparent"}"
        stroke="${style.ports?.input?.editor?.box?.borderColor ?? "rgba(255, 255, 255, 0.2)"}"
        stroke-width="1"
        cursor="pointer"
      />
      <polyline
        points="4,11 7,14 12,8"
        fill="none"
        cursor="pointer"
        stroke="${style.ports?.input?.editor?.box?.color ?? "#fff"}"
        stroke-width="1"
        visibility="${values[input.name] ? "visible" : "hidden"}"
      />
    </g>
  `;
}

//#endregion
//#region src/adapters/joint/nodes/BlueprintNodeView.ts
var BlueprintNodeView = class extends ElementView {
	highlightedPorts = /* @__PURE__ */ new Set();
	dropdownElMap = /* @__PURE__ */ new Map();
	currentlyOpenDropdown = null;
	initialize(...args) {
		this.paper?.el.addEventListener("click", this.hideDropdown);
		super.initialize(...args);
		this.listenTo(this.model, "change:title", this.refreshTitle);
		this.listenTo(this.model, "change:inputs change:outputs", this.applyPortHighlights);
	}
	onRender() {
		this.paper?.el.removeEventListener("click", this.otherClick);
		this.paper?.el.addEventListener("click", this.otherClick);
		const inputs = this.model.get("inputs") || [];
		inputs.forEach((input) => {
			const inputEl = this.findPortNode(input.id, "field");
			if (!inputEl) return;
			if (input.type === "boolean") inputEl.addEventListener("click", this.updateFieldValue(input.type));
			else if (input.type === "select") {
				this.createDropdown(input.id, input.name, input._options);
				inputEl.addEventListener("focus", this.showDropdown);
				inputEl.addEventListener("input", this.filterDropdown);
			} else if (input.type === "number") {
				inputEl.addEventListener("input", this.validateNumber(false));
				inputEl.addEventListener("blur", this.validateNumber(true));
				const upArrow = this.findPortNode(input.id, "upArrow");
				const downArrow = this.findPortNode(input.id, "downArrow");
				upArrow?.addEventListener("click", () => {
					const fieldEl = this.findPortNode(input.id, "field");
					fieldEl.value = String(Number(fieldEl.value || 0) + 1);
					fieldEl.dispatchEvent(new Event("blur"));
				});
				downArrow?.addEventListener("click", () => {
					const fieldEl = this.findPortNode(input.id, "field");
					fieldEl.value = String(Number(fieldEl.value || 0) - 1);
					fieldEl.dispatchEvent(new Event("blur"));
				});
				inputEl.addEventListener("input", this.updateFieldValue(input.type));
			} else if (input.type === "string") inputEl.addEventListener("input", this.updateFieldValue(input.type));
		});
		const plus = this.findNode("switch-plus-rect");
		if (plus) plus.addEventListener("click", (evt) => {
			evt.stopPropagation();
			this.model.graph.trigger("node:switch:add-case", this.model);
		});
	}
	otherClick = (evt) => {
		const target = evt.target;
		if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.getAttribute("role") === "option") return;
		if (this.currentlyOpenDropdown) this.hideDropdown();
	};
	createDropdown(inputId, inputName, options) {
		const style = this.model.get("style") || {};
		const dropdownStyle = style.ports?.input?.editor?.dropdown || {};
		this.dropdownElMap.delete(inputName);
		if (!options || options.length === 0) return;
		const dropdownElement = document.createElement("div");
		dropdownElement.addEventListener("wheel", (evt) => {
			evt.stopPropagation();
			evt.preventDefault();
		});
		dropdownElement.classList.add("bpgraph-node-dropdown");
		dropdownElement.style.cssText = `
      background: ${dropdownStyle.background || "#222"};
      border: 1px solid ${dropdownStyle.borderColor || "rgba(120, 130, 140, 0.3)"};
      color: ${dropdownStyle.color || "#fff"};
      border-radius: ${dropdownStyle.borderRadius || 4}px;
      z-index: 9999;
      font-size: 12px;
      max-height: 200px;
      overflow: auto;
      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
      position: absolute;
    `;
		options.forEach((option) => {
			const optionEl = document.createElement("div");
			optionEl.classList.add("bpgraph-node-dropdown-option");
			optionEl.setAttribute("style", `
            padding: 2px 4px;
            cursor: pointer;
          `);
			optionEl.setAttribute("data-value", option.value);
			optionEl.textContent = option.label;
			optionEl.addEventListener("click", (evt) => {
				evt.preventDefault();
				evt.stopPropagation();
				this.setInputValue(inputName, evt.target.dataset.value);
				this.findPortNode(inputId);
				this.hideDropdown();
				const fieldEl = this.findPortNode(inputId, "field");
				if (fieldEl) fieldEl.value = evt.target.textContent || "";
				fieldEl.title = String(fieldEl.value);
			});
			dropdownElement.appendChild(optionEl);
		});
		this.dropdownElMap.set(inputName, dropdownElement);
	}
	updateOptions(inputId, inputName, options) {
		const dropdownElement = this.dropdownElMap.get(inputName);
		if (!dropdownElement) return;
		dropdownElement.innerHTML = "";
		options.forEach((option) => {
			const optionEl = document.createElement("div");
			optionEl.classList.add("bpgraph-node-dropdown-option");
			optionEl.setAttribute("style", `
            padding: 2px 4px;
            cursor: pointer;
          `);
			optionEl.setAttribute("data-value", option.value);
			optionEl.textContent = option.label;
			optionEl.addEventListener("click", (evt) => {
				evt.preventDefault();
				evt.stopPropagation();
				this.setInputValue(inputName, evt.target.dataset.value);
				this.findPortNode(inputId);
				this.hideDropdown();
				const fieldEl = this.findPortNode(inputId, "field");
				if (fieldEl) fieldEl.value = evt.target.textContent || "";
				fieldEl.title = String(fieldEl.value);
			});
			dropdownElement.appendChild(optionEl);
		});
	}
	showDropdown = (evt) => {
		if (this.currentlyOpenDropdown) this.hideDropdown();
		const fieldEl = evt.target;
		const portName = fieldEl.getAttribute("name");
		if (!portName) return;
		const dropdownEl = this.dropdownElMap.get(portName);
		if (!dropdownEl) return;
		const rect = fieldEl.getBoundingClientRect();
		dropdownEl.style.minWidth = `${rect.width}px`;
		dropdownEl.style.top = `${rect.bottom + 4}px`;
		dropdownEl.style.left = `${rect.left}px`;
		this.currentlyOpenDropdown = portName;
		this.paper?.el.appendChild(dropdownEl);
	};
	hideDropdown = () => {
		const portName = this.currentlyOpenDropdown;
		if (document.activeElement && document.activeElement.getAttribute("name") === portName) return;
		const dropdownEl = this.dropdownElMap.get(portName || "");
		this.currentlyOpenDropdown = null;
		if (!dropdownEl) return;
		this.paper?.el.removeChild(dropdownEl);
	};
	filterDropdown = (evt) => {
		const fieldEl = evt.target;
		const portName = fieldEl.getAttribute("name");
		if (!portName) return;
		const dropdownEl = this.dropdownElMap.get(portName);
		if (!dropdownEl) return;
		const filter = fieldEl.value.toLowerCase();
		const pattern = filter.split("").map((c) => c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join(".*");
		const regex = new RegExp(pattern, "i");
		Array.from(dropdownEl.children).forEach((child) => {
			const optionEl = child;
			const label = optionEl.textContent || "";
			if (regex.test(label)) optionEl.style.display = "block";
			else optionEl.style.display = "none";
		});
	};
	renderMarkup() {
		super.renderMarkup();
		const baseTitle = this.findNode("base-node-title");
		if (baseTitle) renderTitle(baseTitle, this.model);
		return this;
	}
	validateNumber(endInput = false) {
		return (evt) => {
			const fieldEl = evt.target;
			const value = fieldEl.value;
			if (endInput) {
				if (value) {
					const parsedValue = Number(fieldEl.value);
					if (isNaN(parsedValue)) fieldEl.style.borderColor = "red";
					else {
						const style = this.model.get("style") || {};
						const boxStyle = style.ports?.input?.editor?.box || {};
						fieldEl.style.borderColor = boxStyle.borderColor || "";
					}
				}
			} else if (value) {
				const filtered = value.replace(/[^\d.-]/g, "");
				if (filtered !== value) fieldEl.value = filtered;
			}
		};
	}
	updateFieldValue(type) {
		return (evt) => {
			const fieldEl = evt.target;
			const values = this.model.get("values") || {};
			const portName = fieldEl.getAttribute("name");
			if (!portName) return;
			let value = fieldEl.value;
			if (type === "number") value = fieldEl.value ? Number(fieldEl.value) : NaN;
			else if (type === "boolean") value = !values[portName];
			fieldEl.title = String(value);
			this.setInputValue(portName, value);
		};
	}
	setInputValue(inputName, value) {
		this.model.set("values", {
			...this.model.get("values"),
			[inputName]: value
		});
		this.model.graph.trigger("node:values:changed", this, inputName, value);
	}
	applyPortHighlights() {
		requestAnimationFrame(() => {
			setTimeout(() => {
				this._applyPortHighlights();
			}, 0);
		});
	}
	_applyPortHighlights() {
		const ports = this.model.getPorts();
		const portIds = ports.map((port) => port.id);
		const toRemove = [];
		for (const portId of this.highlightedPorts) {
			if (!portIds.includes(portId)) {
				toRemove.push(portId);
				continue;
			}
			this.highlightPort(portId);
		}
		for (const portId of toRemove) {
			this.highlightedPorts.delete(portId);
			this.unhighlightPort(portId);
		}
	}
	refreshTitle() {
		const baseTitle = this.findNode("base-node-title");
		if (baseTitle) {
			const title = this.model.get("title") || "";
			const text = baseTitle.querySelector("text");
			if (text) text.textContent = title;
		}
	}
	refreshDomValue(name, step = 0) {
		const values = this.model.get("values") || {};
		const inputs = this.model.get("inputs") || [];
		const input = inputs.find((i) => i.name === name);
		if (!input) return;
		const inputEl = this.findPortNode(input.id, "field");
		if (step < 10) requestAnimationFrame(() => {
			setTimeout(() => {
				this.refreshDomValue(name, step + 1);
			}, 0);
		});
		if (!inputEl) return;
		let value = values[input.name];
		switch (input.type) {
			case "string":
				if (typeof value !== "string") return;
				break;
			case "number":
				if (typeof value !== "number") return;
				value = isNaN(value) ? inputEl.value : String(value);
				break;
			case "boolean":
				if (inputEl instanceof SVGElement) {
					const polyline = inputEl.parentNode?.children[1];
					if (!polyline) return;
					polyline.setAttribute("visibility", value ? "visible" : "hidden");
					return;
				}
				return;
			case "select":
				if (typeof value !== "string") return;
				value = input._options?.find((option) => option.value === value)?.label || "";
				break;
		}
		if (inputEl.value !== value) {
			inputEl.value = value;
			inputEl.title = String(value);
		}
	}
	highlightPort(portId, retry = 0) {
		if (!this.highlightedPorts.has(portId)) this.highlightedPorts.add(portId);
		const portNode = this.findPortNode(portId, "portBody");
		if (portNode) {
			const style = this.model.get("style") || {};
			const portStyle = (portId.startsWith("in-") ? style.ports?.input : style.ports?.output) || {};
			const fill = portStyle.port?.highlightFill || "rgba(255, 255, 255, 0.8)";
			const stroke = portStyle.port?.highlightStroke || "rgba(255, 255, 255, 1)";
			const strokeWidth = portStyle.port?.highlightStrokeWidth ?? 1;
			portNode.setAttribute("fill", fill);
			portNode.setAttribute("stroke", stroke);
			portNode.setAttribute("stroke-width", String(strokeWidth));
		} else if (retry < 10) requestAnimationFrame(() => {
			setTimeout(() => {
				this.highlightPort(portId, retry + 1);
			}, 0);
		});
	}
	unhighlightPort(portId) {
		const portNode = this.findPortNode(portId, "portBody");
		if (portNode) {
			const style = this.model.get("style") || {};
			const portStyle = (portId.startsWith("in-") ? style.ports?.input : style.ports?.output) || {};
			const fill = portStyle.port?.fill || "rgba(255, 255, 255, 0.5)";
			const stroke = portStyle.port?.stroke || "rgba(255, 255, 255, 0.8)";
			const strokeWidth = portStyle.port?.strokeWidth ?? 1;
			portNode.setAttribute("fill", fill);
			portNode.setAttribute("stroke", stroke);
			portNode.setAttribute("stroke-width", String(strokeWidth));
		}
	}
};
function renderTitle(g, model) {
	const title = model.get("title") || "";
	const size = model.size();
	const attrs = model.get("attrs") || {};
	const rx = attrs["base-node-body"]?.rx ?? 4;
	const ry = attrs["base-node-body"]?.ry ?? 4;
	const style = model.get("style") || {};
	const titleHeight = style.header?.height ?? 24;
	const titleFontSize = style.header?.fontSize ?? 12;
	const titleTop = style.header?.title?.y ?? 0;
	const titleLeft = style.header?.title?.x ?? 0;
	const textAlign = style.header?.textAlign ?? "left";
	const titlePath = V_default("path", {
		d: `
      M0,${titleHeight}
      L0,${ry}
      Q0,0 ${rx},0
      L${size.width - rx},0
      Q${size.width},0 ${size.width},${ry}
      L${size.width},${titleHeight}
      Z
    `,
		fill: style.header?.background ?? "#373C44"
	}).node;
	const textAnchor = textAlign === "left" ? "start" : textAlign === "right" ? "end" : "middle";
	let startX = 0;
	switch (textAlign) {
		case "left":
			startX = 10;
			break;
		case "right":
			startX = size.width - 10;
			break;
		case "center":
			startX = size.width / 2;
			break;
	}
	const text = V_default("text", {
		x: startX + titleLeft,
		y: titleHeight / 2 + titleFontSize / 2 - 3 + titleTop,
		fill: "#fff",
		fontSize: titleFontSize,
		textAnchor
	}).node;
	text.textContent = title;
	g.appendChild(titlePath);
	g.appendChild(text);
}

//#endregion
//#region src/adapters/joint/ScrollerController.ts
var ScrollerController = class ScrollerController extends Listener {
	_viewport = {
		x: 0,
		y: 0,
		scale: 1
	};
	_isDragging = false;
	_lastClientX = 0;
	_lastClientY = 0;
	_spacePressed = false;
	static ZOOM_SENSITIVITY = .005;
	get isDragging() {
		return this._isDragging;
	}
	get viewport() {
		return this._viewport;
	}
	get scale() {
		return this._viewport.scale;
	}
	set scale(value) {
		this._viewport.scale = value;
		this.updatePaperTransform();
	}
	get position() {
		return {
			x: this._viewport.x,
			y: this._viewport.y
		};
	}
	set position(value) {
		this._viewport.x = value.x;
		this._viewport.y = value.y;
		this.updatePaperTransform();
	}
	startListening() {
		const [{ paper }] = this.callbackArguments;
		paper.el.addEventListener("keydown", this.onKeyDown);
		paper.el.addEventListener("keyup", this.onKeyUp);
		paper.el.addEventListener("selectstart", this.onSelectStart);
		this.initPaperEvents();
	}
	initPaperEvents() {
		const [{ paper }] = this.callbackArguments;
		const el = paper.el;
		el.addEventListener("mousedown", this.onMouseDown);
		el.addEventListener("mousemove", this.onMouseMove);
		el.addEventListener("mouseup", this.onMouseUp);
		paper.el.addEventListener("selectstart", this.onSelectStart);
		el.addEventListener("wheel", this.onMouseWheel, { passive: true });
	}
	onKeyDown = (e) => {
		const [{ paper }] = this.callbackArguments;
		if (e.target !== paper.el) return;
		if (e.code === "Space") {
			this._spacePressed = true;
			paper.el.style.cursor = "grab";
		}
	};
	onKeyUp = (e) => {
		const [{ paper }] = this.callbackArguments;
		if (e.code === "Space") {
			this._spacePressed = false;
			paper.el.style.cursor = "";
		}
	};
	onMouseDown = (e) => {
		const [{ paper }] = this.callbackArguments;
		const el = paper.el;
		if (e.button === 0 && this._spacePressed || e.button === 2 && !this._spacePressed) {
			e.stopPropagation();
			e.preventDefault();
			this._isDragging = true;
			this._lastClientX = e.clientX;
			this._lastClientY = e.clientY;
			el.style.cursor = "grabbing";
		}
	};
	onMouseMove = (e) => {
		const [{ paper, graph }] = this.callbackArguments;
		if (!this.isDragging) return;
		const dx = e.clientX - this._lastClientX;
		const dy = e.clientY - this._lastClientY;
		this._viewport.x += dx;
		this._viewport.y += dy;
		paper.translate(this._viewport.x, this._viewport.y);
		graph.emit("viewport:change", this._viewport);
		this._lastClientX = e.clientX;
		this._lastClientY = e.clientY;
	};
	onMouseUp = () => {
		const [{ paper }] = this.callbackArguments;
		if (this.isDragging) {
			this._isDragging = false;
			if (this._spacePressed) paper.el.style.cursor = "grab";
			else paper.el.style.cursor = "";
		}
	};
	onMouseWheel = (e) => {
		const [{ paper, graph }] = this.callbackArguments;
		if (this.isDragging) return;
		const rect = paper.el.getBoundingClientRect();
		const point = {
			x: e.clientX - rect.left,
			y: e.clientY - rect.top
		};
		const localPoint = paper.clientToLocalPoint(point);
		this.viewport.scale += e.deltaY * -ScrollerController.ZOOM_SENSITIVITY;
		this.viewport.scale = Math.min(Math.max(.2, this.viewport.scale), 5);
		paper.scale(this.viewport.scale, this.viewport.scale);
		const newLocalPoint = paper.clientToLocalPoint(point);
		this.viewport.x += (newLocalPoint.x - localPoint.x) * this.viewport.scale;
		this.viewport.y += (newLocalPoint.y - localPoint.y) * this.viewport.scale;
		paper.translate(this.viewport.x, this.viewport.y);
		paper.setGridSize(10 / this.viewport.scale);
		graph.emit("viewport:change", this._viewport);
	};
	updatePaperTransform() {
		const [{ paper }] = this.callbackArguments;
		paper.scale(this.viewport.scale, this.viewport.scale);
		paper.translate(this.viewport.x, this.viewport.y);
		paper.setGridSize(10 / this.viewport.scale);
	}
	onSelectStart = (e) => {
		if (this.isDragging) e.preventDefault();
	};
	stopListening() {
		super.stopListening();
		const [{ paper }] = this.callbackArguments;
		const el = paper.el;
		el.removeEventListener("mousedown", this.onMouseDown);
		el.removeEventListener("mousemove", this.onMouseMove);
		el.removeEventListener("mouseup", this.onMouseUp);
		paper.el.removeEventListener("selectstart", this.onSelectStart);
		el.removeEventListener("wheel", this.onMouseWheel);
		paper.el.removeEventListener("keydown", this.onKeyDown);
		paper.el.removeEventListener("keyup", this.onKeyUp);
	}
};

//#endregion
//#region src/adapters/joint/SelectionController.ts
var SelectionController = class SelectionController extends Listener {
	rect;
	startPoint;
	pointerDownTime = 0;
	hasMovedEnough = false;
	static MIN_MOVE_DISTANCE = 3;
	static MIN_PRESS_DURATION = 100;
	startListening() {
		const [{ paper }] = this.callbackArguments;
		this.listenTo(paper, "blank:pointerdown", this.onPointerDown, this);
		this.listenTo(paper, "blank:pointermove", this.onPointerMove, this);
		this.listenTo(paper, "blank:pointerup", this.onPointerUp, this);
	}
	onPointerDown({ paper }, evt) {
		const clientX = evt.clientX;
		const clientY = evt.clientY;
		const localPoint = paper.clientToLocalPoint(clientX, clientY);
		this.startPoint = paper.localToPagePoint(localPoint.x, localPoint.y);
		this.pointerDownTime = Date.now();
		this.hasMovedEnough = false;
	}
	onPointerMove({ paper, className }, evt) {
		if (!this.startPoint) return;
		const clientX = evt.clientX;
		const clientY = evt.clientY;
		const localPoint = paper.clientToLocalPoint(clientX, clientY);
		const currentPoint = paper.localToPagePoint(localPoint.x, localPoint.y);
		const dx = Math.abs(currentPoint.x - this.startPoint.x);
		const dy = Math.abs(currentPoint.y - this.startPoint.y);
		const moved = dx > SelectionController.MIN_MOVE_DISTANCE || dy > SelectionController.MIN_MOVE_DISTANCE;
		if (!this.hasMovedEnough && moved) {
			const duration = Date.now() - (this.pointerDownTime ?? 0);
			if (duration > SelectionController.MIN_PRESS_DURATION) {
				this.rect = V_default("rect", {
					x: this.startPoint.x,
					y: this.startPoint.y,
					width: 1,
					height: 1,
					class: className ?? "",
					stroke: "#3498db",
					"stroke-width": 1,
					fill: "rgba(52,152,219,0.15)"
				}).node;
				paper.svg.appendChild(this.rect);
				this.hasMovedEnough = true;
			}
		}
		if (this.rect && this.hasMovedEnough) {
			const x1 = Math.min(this.startPoint.x, currentPoint.x);
			const y1 = Math.min(this.startPoint.y, currentPoint.y);
			const x2 = Math.max(this.startPoint.x, currentPoint.x);
			const y2 = Math.max(this.startPoint.y, currentPoint.y);
			V_default(this.rect).attr({
				x: x1,
				y: y1,
				width: x2 - x1,
				height: y2 - y1
			});
		}
	}
	onPointerUp({ paper, onSelected }, evt) {
		if (!this.rect || !this.startPoint) return;
		const clientX = evt.clientX;
		const clientY = evt.clientY;
		const currentPoint = paper.clientToLocalPoint(clientX, clientY);
		const startPoint = paper.pageToLocalPoint(this.startPoint.x, this.startPoint.y);
		const x1 = Math.min(startPoint.x, currentPoint.x);
		const y1 = Math.min(startPoint.y, currentPoint.y);
		const x2 = Math.max(startPoint.x, currentPoint.x);
		const y2 = Math.max(startPoint.y, currentPoint.y);
		const bbox = new Rect(x1, y1, x2 - x1, y2 - y1);
		const elements = paper.model.getElements();
		const links = paper.model.getLinks();
		const selected = elements.filter((el) => bbox.intersect(el.getBBox()));
		const selectedLinks = links.filter((link) => {
			const linkView = paper.findViewByModel(link);
			if (!linkView) return false;
			const path = linkView.findNode("line");
			if (!path) return false;
			return pathIntersectsRect(path, bbox);
		});
		onSelected([...selected, ...selectedLinks]);
		this.rect.remove();
		this.rect = void 0;
		this.startPoint = void 0;
	}
};
function pathIntersectsRect(path, rect) {
	const length = path.getTotalLength();
	const step = 5;
	for (let i = 0; i <= length; i += step) {
		const pt = path.getPointAtLength(i);
		if (pt.x >= rect.x && pt.x <= rect.x + rect.width && pt.y >= rect.y && pt.y <= rect.y + rect.height) return true;
	}
	return false;
}

//#endregion
//#region src/adapters/joint/GroupEffectController.ts
var GroupEffectController = class extends Listener {
	rect;
	cells = [];
	nodes = [];
	dragStartPoint;
	dragStartClientPoint;
	cellsStartPositions = /* @__PURE__ */ new Map();
	rectStartPos;
	moveNodes = [];
	startListening() {
		const [{ paper }] = this.callbackArguments;
		this.listenTo(paper, "element:pointerdown", this.onElementPointerDown, this);
		this.listenTo(paper, "element:pointerup", this.onElementPointerUp, this);
		this.listenTo(paper, "element:pointermove", this.onElementPointerMove, this);
		this.listenTo(paper, "scale", this.onScale, this);
		this.listenTo(paper, "translate", this.onTranslate, this);
	}
	onScale() {
		if (this.cells.length <= 1) return;
		this.clearGroupEffect();
		this.drawGroupEffect();
	}
	onTranslate() {
		if (this.cells.length <= 1) return;
		this.clearGroupEffect();
		this.drawGroupEffect();
	}
	onElementPointerDown({ paper, adapter }, elementView) {
		if (!elementView.model.isElement()) return;
		this.dragStartPoint = {
			x: elementView.model.position().x,
			y: elementView.model.position().y
		};
		this.moveNodes = [elementView.model];
		this.rectStartPos = void 0;
		if (this.nodes.includes(elementView.model)) {
			this.moveNodes = this.nodes;
			this.rectStartPos = {
				x: this.rect ? parseFloat(this.rect.getAttribute("x") || "0") : 0,
				y: this.rect ? parseFloat(this.rect.getAttribute("y") || "0") : 0
			};
			this.dragStartClientPoint = paper.localToClientPoint(this.dragStartPoint.x, this.dragStartPoint.y);
		}
		this.moveNodes.forEach((cell) => {
			if (!cell.isElement()) return;
			this.cellsStartPositions.set(cell.id, cell.position());
			const node = adapter.cellsMap.get(cell.id)?.cell;
			if (!node || !("position" in node)) return;
			adapter.graph.emit("node:dragstart", node);
		});
	}
	onElementPointerMove({ adapter, paper }, elementView) {
		if (!this.moveNodes.length) return;
		if (!this.dragStartPoint) return;
		const pos = elementView.model.position();
		const clientPos = paper.localToClientPoint(pos.x, pos.y);
		const clientOffsetX = clientPos.x - (this.dragStartClientPoint?.x ?? 0);
		const clientOffsetY = clientPos.y - (this.dragStartClientPoint?.y ?? 0);
		const offsetX = pos.x - (this.dragStartPoint?.x ?? 0);
		const offsetY = pos.y - (this.dragStartPoint?.y ?? 0);
		this.moveNodes.forEach((cell) => {
			const node = adapter.cellsMap.get(cell.id)?.cell;
			if (cell.id !== elementView.model.id) {
				const startPos = this.cellsStartPositions.get(cell.id);
				cell.position(startPos.x + offsetX, startPos.y + offsetY);
			}
			if (node && "position" in node) {
				const bbox = adapter.getElementBBox(elementView);
				node._bbox = bbox;
				adapter.graph.emit("node:dragmove", node);
			}
		});
		if (this.rect && this.rectStartPos) {
			this.rect.setAttribute("x", String(this.rectStartPos.x + clientOffsetX));
			this.rect.setAttribute("y", String(this.rectStartPos.y + clientOffsetY));
		}
	}
	onElementPointerUp({ adapter, paper }, elementView) {
		if (!this.moveNodes.length) return;
		const dragStart = this.dragStartPoint;
		this.dragStartPoint = void 0;
		if (!dragStart) return;
		const dragEnd = elementView.model.position();
		const offsetX = dragEnd.x - (dragStart?.x ?? 0);
		const offsetY = dragEnd.y - (dragStart?.y ?? 0);
		const clientPos = paper.localToClientPoint(dragEnd.x, dragEnd.y);
		const clientOffsetX = clientPos.x - (this.dragStartClientPoint?.x ?? 0);
		const clientOffsetY = clientPos.y - (this.dragStartClientPoint?.y ?? 0);
		if (dragEnd.x !== dragStart.x || dragEnd.y !== dragStart.y) {
			adapter.graph.startTransaction();
			this.moveNodes.forEach((node) => {
				const startPos = this.cellsStartPositions.get(node.id);
				node.position(startPos.x + offsetX, startPos.y + offsetY);
				const instance = adapter.cellsMap.get(node.id)?.cell;
				if (instance && "position" in instance) {
					instance.position = {
						x: startPos.x + offsetX,
						y: startPos.y + offsetY
					};
					const bbox = adapter.getElementBBox(elementView);
					instance._bbox = bbox;
					adapter.graph.emit("node:dragend", instance);
				}
			});
			adapter.graph.commitTransaction();
			if (this.rect && this.rectStartPos) {
				this.rect.setAttribute("x", String(this.rectStartPos.x + clientOffsetX));
				this.rect.setAttribute("y", String(this.rectStartPos.y + clientOffsetY));
			}
			this.rectStartPos = void 0;
			this.moveNodes = [];
			this.cellsStartPositions.clear();
		}
	}
	groupCells(cells) {
		this.cells = cells;
		this.nodes = cells.filter((c) => c.isElement());
		this.updateGroupEffect();
		this.updateCellsHighlight();
	}
	ungroupCells(cells) {
		this.cells = this.cells.filter((c) => !cells.includes(c));
		this.nodes = this.cells.filter((c) => c.isElement());
		this.updateGroupEffect();
		this.updateCellsHighlight();
	}
	clearGroups() {
		this.cells = [];
		this.nodes = [];
		this.updateGroupEffect();
		this.updateCellsHighlight();
	}
	updateCellsHighlight() {
		const [{ adapter }] = this.callbackArguments;
		adapter.joint.clearHighlights();
		adapter.joint.highlightCells(this.cells);
	}
	drawGroupEffect() {
		const bbox = this.calculateBoundingBox();
		const [{ paper }] = this.callbackArguments;
		if (!this.rect) {
			this.rect = V_default("rect", {
				x: 0,
				y: 0,
				width: 100,
				height: 100,
				class: "selection-effect",
				stroke: "#3c3ce7ff",
				"stroke-width": 2,
				fill: "rgba(60, 60, 60, 0.15)",
				rx: 4,
				ry: 4,
				"pointer-events": "none"
			}).node;
			paper.svg.appendChild(this.rect);
		}
		this.rect.setAttribute("x", String(bbox.x - 10));
		this.rect.setAttribute("y", String(bbox.y - 10));
		this.rect.setAttribute("width", String(bbox.width + 20));
		this.rect.setAttribute("height", String(bbox.height + 20));
	}
	updateGroupEffect() {
		if (this.nodes.length > 1) this.drawGroupEffect();
		else this.clearGroupEffect();
	}
	clearGroupEffect() {
		if (this.rect) {
			this.rect.remove();
			this.rect = void 0;
		}
	}
	calculateBoundingBox() {
		let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
		const [{ paper }] = this.callbackArguments;
		this.nodes.forEach((node) => {
			const bbox = paper.localToPaperRect(node.getBBox());
			minX = Math.min(minX, bbox.x);
			minY = Math.min(minY, bbox.y);
			maxX = Math.max(maxX, bbox.x + bbox.width);
			maxY = Math.max(maxY, bbox.y + bbox.height);
		});
		return {
			x: minX,
			y: minY,
			width: maxX - minX,
			height: maxY - minY
		};
	}
};

//#endregion
//#region src/adapters/joint/JointGraph.ts
config.classNamePrefix = "bpgraph-";
const custom = {
	BlueprintNode,
	BlueprintNodeView
};
const namespace = {
	custom,
	standard: standard_exports
};
var JointGraph = class {
	graph;
	paper;
	scrollerController;
	selectionController;
	groupEffectController;
	adapter;
	constructor(adapter, options) {
		this.adapter = adapter;
		this.graph = new Graph({});
		this.paper = new Paper({
			model: this.graph,
			cellViewNamespace: namespace,
			frozen: false,
			async: true,
			clickThreshold: 5,
			snapLinks: { radius: 20 },
			linkPinning: false,
			preventDefaultViewAction: false,
			preventDefaultBlankAction: false,
			sorting: Paper.sorting.APPROX,
			interactive: function(cellView) {
				return cellView.model.isElement();
			},
			defaultAnchor: (view, magnet, ...rest) => {
				const group = view.findAttribute("port-group", magnet);
				const anchorFn = group === "in" ? left : right;
				return anchorFn(view, magnet, ...rest);
			},
			defaultConnectionPoint: { name: "anchor" },
			defaultConnector: (sourcePoint, targetPoint, routePoints, opt, linkView) => {
				const link = linkView.model;
				const sourcePortId = link.get("source").port;
				const isSourceIn = sourcePortId?.startsWith("in-");
				const isSourceOut = sourcePortId?.startsWith("out-");
				if (isSourceIn) {
					opt.sourceDirection = curve.TangentDirections.LEFT;
					opt.targetDirection = curve.TangentDirections.RIGHT;
				} else if (isSourceOut) {
					opt.sourceDirection = curve.TangentDirections.RIGHT;
					opt.targetDirection = curve.TangentDirections.LEFT;
				}
				return curve(sourcePoint, targetPoint, routePoints, opt, linkView);
			},
			validateMagnet: () => {
				this.adapter.graph.emit("start:connecting");
				return true;
			},
			defaultLink: () => new Link({ attrs: { line: {
				strokeWidth: this.adapter.graph.nodeRegistry.linkStyle.strokeWidth || 1,
				stroke: this.adapter.graph.nodeRegistry.linkStyle.stroke || "rgba(255,255,255,0.5)",
				targetMarker: { type: "none" }
			} } }),
			validateConnection: (sourceView, sourceMagnet, targetView, targetMagnet) => {
				if (sourceView === targetView) return false;
				const target = targetView.model;
				if (target.isLink()) return false;
				const sourceGroup = sourceView.findAttribute("port-group", sourceMagnet);
				const targetGroup = targetView.findAttribute("port-group", targetMagnet);
				if (sourceGroup === "in" && targetGroup !== "out") return false;
				if (sourceGroup === "out" && targetGroup !== "in") return false;
				if (sourceView && sourceMagnet && targetMagnet && targetView) {
					const sourcePortId = sourceView.findAttribute("port", sourceMagnet) || "";
					const targetPortId = targetView.findAttribute("port", targetMagnet) || "";
					const sourcePort = sourcePortId.startsWith("out-") ? sourceView.model.get("outputs")?.find((port) => port.id === sourcePortId) : sourceView.model.get("inputs")?.find((port) => port.id === sourcePortId);
					const targetPort = targetPortId.startsWith("in-") ? targetView.model.get("inputs")?.find((port) => port.id === targetPortId) : targetView.model.get("outputs")?.find((port) => port.id === targetPortId);
					const sourceNode = this.adapter.findNode(sourceView.model.id);
					const targetNode = this.adapter.findNode(targetView.model.id);
					if (sourcePort && targetPort) return this.adapter.graph.validateConnection(sourceNode, sourcePort, targetNode, targetPort);
				}
				return true;
			},
			...options
		});
		this.initialize();
	}
	initialize() {
		this.scrollerController = new ScrollerController({
			paper: this.paper,
			graph: this.adapter.graph
		});
		this.selectionController = new SelectionController({
			paper: this.paper,
			onSelected: (cells) => {
				this.paper.trigger("selection:changed", cells);
			}
		});
		this.groupEffectController = new GroupEffectController({
			adapter: this.adapter,
			paper: this.paper,
			className: "selection-rectangle"
		});
		this.initializeControllers();
		this.paper.on("link:connect", (linkView) => {
			const source = linkView.model.get("source");
			const target = linkView.model.get("target");
			const sourceNodeView = this.paper.findViewByModel(source.id);
			const targetNodeView = this.paper.findViewByModel(target.id);
			const sourcePortId = source.port;
			const targetPortId = target.port;
			if (sourceNodeView && sourcePortId && targetNodeView && targetPortId) {
				sourceNodeView.highlightPort(sourcePortId);
				targetNodeView.highlightPort(targetPortId);
			}
		});
		this.graph.on("remove", (cell) => {
			if (cell.isLink()) {
				const link = cell;
				const source = link.get("source");
				const target = link.get("target");
				const sourceNodeView = this.paper.findViewByModel(source.id);
				const targetNodeView = this.paper.findViewByModel(target.id);
				const sourcePortId = source.port;
				const targetPortId = target.port;
				if (!sourcePortId || !targetPortId) return;
				const sourceLinks = this.graph.getConnectedLinks(sourceNodeView.model, {
					inbound: true,
					outbound: true
				});
				const targetLinks = this.graph.getConnectedLinks(targetNodeView.model, {
					inbound: true,
					outbound: true
				});
				const stillConnectedFromSource = sourceLinks.some((l) => l.get("source").port === sourcePortId || l.get("target").port === sourcePortId);
				const stillConnectedFromTarget = targetLinks.some((l) => l.get("source").port === targetPortId || l.get("target").port === targetPortId);
				if (sourceNodeView && sourcePortId && !stillConnectedFromSource) sourceNodeView.unhighlightPort(sourcePortId);
				if (targetNodeView && targetPortId && !stillConnectedFromTarget) targetNodeView.unhighlightPort(targetPortId);
			}
		});
	}
	initializeControllers() {
		if (this.paper.el) {
			this.scrollerController.stopListening();
			this.selectionController.stopListening();
			this.groupEffectController.stopListening();
			this.scrollerController.startListening();
			this.selectionController.startListening();
			this.groupEffectController.startListening();
			this.paper.el.removeEventListener("keydown", this.onKeyDown);
			this.paper.el.removeEventListener("keyup", this.onKeyUp);
			this.paper.el.addEventListener("keydown", this.onKeyDown);
			this.paper.el.addEventListener("keyup", this.onKeyUp);
		}
	}
	addNode(instance, style) {
		const inputs = instance.inputs;
		const outputs = instance.outputs;
		const node = new custom.BlueprintNode({
			id: instance.id,
			title: instance.title ?? "",
			position: {
				x: instance.position?.x ?? 0,
				y: instance.position?.y ?? 0
			},
			style: style ?? {},
			inputs,
			outputs,
			nodeType: instance.type,
			values: { ...instance.values }
		});
		this.graph.addCell(node);
		return node;
	}
	setContainer(container) {
		this.paper.setElement(container);
		this.paper.render();
		this.initializeControllers();
	}
	addLink(link, style) {
		const jointLink = new Link({
			id: link.id,
			source: {
				id: link.source.id,
				port: link.source.port
			},
			target: {
				id: link.target.id,
				port: link.target.port
			},
			attrs: { line: {
				stroke: style?.stroke ?? "#ffffff",
				strokeWidth: style?.strokeWidth ?? 2,
				targetMarker: { type: "none" }
			} }
		});
		const source = jointLink.get("source");
		const target = jointLink.get("target");
		const sourceNodeView = this.paper.findViewByModel(source.id);
		const targetNodeView = this.paper.findViewByModel(target.id);
		const sourcePortId = source.port;
		const targetPortId = target.port;
		if (sourceNodeView && sourcePortId && targetNodeView && targetPortId) {
			sourceNodeView.highlightPort(sourcePortId);
			targetNodeView.highlightPort(targetPortId);
		}
		this.graph.addCell(jointLink);
		return jointLink;
	}
	removeCells(cells) {
		this.graph.removeCells(cells);
		this.ungroupCells(cells);
	}
	findNode(id) {
		return this.graph.getCell(id);
	}
	highlightCells(cells) {
		const defaultNodeStyle$1 = this.adapter.graph.nodeRegistry.nodeStyle;
		const defaultLinkStyle$1 = this.adapter.graph.nodeRegistry.linkStyle;
		cells.forEach((cell) => {
			if (cell instanceof Element) {
				const elementView = this.paper.findViewByModel(cell);
				if (!elementView) return;
				mask.add(elementView, "base-node-body", "highlighter-selected", {
					layer: Paper.Layers.FRONT,
					padding: 2,
					attrs: {
						stroke: defaultNodeStyle$1.highlightStroke ?? "#0077B6",
						"stroke-width": defaultNodeStyle$1.highlightStrokeWidth ?? 1
					}
				});
			} else if (cell instanceof Link$1) {
				const linkView = this.paper.findViewByModel(cell);
				if (!linkView) return;
				mask.add(linkView, "line", "highlighter-selected", {
					layer: Paper.Layers.FRONT,
					padding: 2,
					attrs: {
						stroke: defaultLinkStyle$1.highlightStroke ?? "#0077B6",
						"stroke-width": defaultLinkStyle$1.highlightStrokeWidth ?? 1
					}
				});
			}
		});
	}
	unhighlightCells(cells) {
		cells.forEach((cell) => {
			if (cell instanceof Element) {
				const elementView = this.paper.findViewByModel(cell);
				if (!elementView) return;
				mask.remove(elementView);
			} else if (cell instanceof Link$1) {
				const linkView = this.paper.findViewByModel(cell);
				if (!linkView) return;
				mask.remove(linkView);
			}
		});
	}
	groupCells(cells) {
		this.groupEffectController.groupCells(cells);
	}
	ungroupCells(cells) {
		this.groupEffectController.ungroupCells(cells);
	}
	clearGroups() {
		this.groupEffectController.clearGroups();
	}
	clearHighlights() {
		mask.removeAll(this.paper);
	}
	destroy() {
		this.scrollerController.stopListening();
		this.selectionController.stopListening();
		this.groupEffectController.stopListening();
		this.graph.clear();
		this.paper.remove();
		window.removeEventListener("keydown", this.onKeyDown);
		window.removeEventListener("keyup", this.onKeyUp);
	}
	clear() {
		this.graph.clear();
		this.clearHighlights();
	}
	onKeyDown = (e) => {
		if (e.code === "Space") this.selectionController.stopListening();
	};
	onKeyUp = (e) => {
		if (e.code === "Space") this.selectionController.startListening();
	};
};

//#endregion
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
//#region src/utils/serializer.ts
function serializeNodes(nodes) {
	const jsonNodes = [];
	for (const node of nodes) {
		const jsonNode = {
			position: { ...node.position },
			id: node.id,
			type: node.type,
			nodeType: node.nodeType,
			values: { ...node.values },
			inputs: node.inputs.map((input) => ({
				name: input.name,
				id: input.id
			})),
			outputs: node.outputs.map((output) => ({
				name: output.name,
				id: output.id
			}))
		};
		if (node.data) jsonNode.data = node.data;
		if (node.states.title) jsonNode.title = node.states.title;
		if (node.states.style) jsonNode.style = node.states.style;
		if (node.subgraphId) jsonNode.subgraphId = node.subgraphId;
		if (node.states.inputs) jsonNode.inputs = node.states.inputs.map((input) => {
			const obj = {
				id: input.id,
				name: input.name,
				type: input.type
			};
			if (input.label) obj.label = input.label;
			if (Array.isArray(input.options)) obj.options = input.options ? Array.from(input.options) : void 0;
			if (input.showInput !== void 0) obj.showInput = input.showInput;
			if (input.showPort !== void 0) obj.showPort = input.showPort;
			return obj;
		});
		if (node.states.outputs) jsonNode.outputs = node.states.outputs.map((output) => {
			const obj = {
				id: output.id,
				name: output.name,
				type: output.type
			};
			if (output.label) obj.label = output.label;
			return obj;
		});
		jsonNodes.push(jsonNode);
	}
	return jsonNodes;
}
function serializeLinks(links) {
	const jsonLinks = [];
	for (const link of links) {
		const jsonLink = {
			id: link.id,
			source: { ...link.source },
			target: { ...link.target }
		};
		if (link.style) jsonLink.style = link.style;
		jsonLinks.push(jsonLink);
	}
	return jsonLinks;
}
function toJSON(model) {
	const json = {
		nodes: [],
		links: [],
		variables: [],
		subgraphs: {},
		viewport: {
			x: model.root.viewport.x,
			y: model.root.viewport.y,
			zoom: model.root.viewport.scale
		}
	};
	const nodes = model.root.nodes;
	const links = model.root.links;
	const variables = model.variableManager.getAllVariables();
	const subgraphs = model.subgraphs;
	json.nodes = serializeNodes(nodes);
	for (const [subgraphId, subgraph] of subgraphs) {
		const subgraphNodes = subgraph.nodes;
		const subgraphLinks = subgraph.links;
		json.subgraphs[subgraphId] = {
			nodes: serializeNodes(subgraphNodes),
			links: serializeLinks(subgraphLinks),
			viewport: {
				x: subgraph.viewport.x,
				y: subgraph.viewport.y,
				zoom: subgraph.viewport.scale
			}
		};
	}
	for (const variable of variables) json.variables.push({
		name: variable.name,
		type: variable.type,
		value: variable.value
	});
	json.links = serializeLinks(links);
	return json;
}
function deserializeNodes(graph, jsonNodes) {
	const nodes = [];
	for (const jsonNode of jsonNodes) {
		const node = graph.createNodeInstance(jsonNode.nodeType, {
			position: { ...jsonNode.position },
			title: jsonNode.title,
			data: jsonNode.data,
			values: { ...jsonNode.values },
			id: jsonNode.id,
			style: jsonNode.style,
			subgraphId: jsonNode.subgraphId,
			inputs: jsonNode.inputs.some((input) => input.type) ? jsonNode.inputs.map((i) => ({
				...i,
				type: i.type
			})) : void 0,
			outputs: jsonNode.outputs.some((output) => output.type) ? jsonNode.outputs.map((o) => ({
				...o,
				type: o.type
			})) : void 0
		});
		if (!node.states.inputs) for (const jsonInput of jsonNode.inputs) {
			const input = node.inputs.find((i) => i.name === jsonInput.name);
			if (input) input.id = jsonInput.id;
		}
		if (!node.states.outputs) for (const jsonOutput of jsonNode.outputs) {
			const output = node.outputs.find((o) => o.name === jsonOutput.name);
			if (output) output.id = jsonOutput.id;
		}
		nodes.push(node);
	}
	return nodes;
}
function deserializeLinks(graph, jsonLinks) {
	const links = [];
	for (const jsonLink of jsonLinks) {
		const link = graph.createLinkInstance(jsonLink);
		if (jsonLink.id) link.id = jsonLink.id;
		if (jsonLink.source) link.source = { ...jsonLink.source };
		if (jsonLink.target) link.target = { ...jsonLink.target };
		if (jsonLink.style) link.style = jsonLink.style;
		links.push(link);
	}
	return links;
}
function fromJSON(graph, json) {
	if (typeof json === "string") json = JSON.parse(json);
	const jsonNodes = json.nodes;
	const jsonLinks = json.links;
	const jsonVariables = json.variables;
	const jsonSubgraphs = json.subgraphs;
	const nodes = deserializeNodes(graph, jsonNodes);
	const links = deserializeLinks(graph, jsonLinks);
	const subgraphs = {};
	for (const subgraphId in jsonSubgraphs) {
		subgraphs[subgraphId] = {
			nodes: [],
			links: [],
			viewport: {
				x: 0,
				y: 0,
				zoom: 1
			}
		};
		const subgraphData = jsonSubgraphs[subgraphId];
		subgraphs[subgraphId].nodes = deserializeNodes(graph, subgraphData.nodes);
		subgraphs[subgraphId].links = deserializeLinks(graph, subgraphData.links);
		subgraphs[subgraphId].viewport = {
			x: subgraphData.viewport.x,
			y: subgraphData.viewport.y,
			zoom: subgraphData.viewport.zoom
		};
	}
	return {
		nodes,
		links,
		subgraphs,
		variables: jsonVariables,
		viewport: json.viewport
	};
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
const Util = {
	mergeDeep,
	toJSON,
	fromJSON,
	serializeLinks,
	serializeNodes,
	deserializeLinks,
	deserializeNodes
};

//#endregion
//#region src/utils/KeyboardManager.ts
function isMac() {
	return /Mac|iPod|iPhone|iPad/.test(navigator.platform);
}
var KeyboardManager = class {
	shortcuts = /* @__PURE__ */ new Map();
	enabled = true;
	container;
	constructor(container) {
		this.container = container || document;
		this.container.addEventListener("keydown", this.onKeyDown);
	}
	registerShortcut(combo, handler) {
		const normalized = this.normalizeCombo(combo);
		this.shortcuts.set(normalized, handler);
	}
	unregisterShortcut(combo) {
		const normalized = this.normalizeCombo(combo);
		this.shortcuts.delete(normalized);
	}
	enable() {
		this.enabled = true;
	}
	disable() {
		this.enabled = false;
	}
	normalizeCombo(combo) {
		if (combo.includes("mod")) return combo.replace("mod", isMac() ? "meta" : "ctrl").toLowerCase();
		return combo.toLowerCase();
	}
	onKeyDown = (evt) => {
		if (!this.enabled) return;
		if (evt.target !== this.container) return;
		const parts = [];
		if (evt.ctrlKey) parts.push("ctrl");
		if (evt.metaKey) parts.push("meta");
		if (evt.altKey) parts.push("alt");
		if (evt.shiftKey) parts.push("shift");
		parts.push(evt.key.toLowerCase());
		const keyCombo = parts.join("+");
		const handler = this.shortcuts.get(keyCombo);
		if (handler) {
			evt.preventDefault();
			handler(evt);
		}
	};
	destroy() {
		this.container.removeEventListener("keydown", this.onKeyDown);
		this.shortcuts.clear();
	}
};

//#endregion
//#region src/adapters/GraphAdapter.ts
var GraphAdapter = class extends EventEmitter {
	joint;
	cellsMap = /* @__PURE__ */ new Map();
	selection = /* @__PURE__ */ new Set();
	keyboardManager;
	graph;
	jointSelection = /* @__PURE__ */ new Set();
	constructor(graph, options) {
		super();
		this.graph = graph;
		const jointPaperOptions = {
			el: options?.container,
			width: options?.width ?? "100%",
			height: options?.height ?? "100%",
			gridSize: options?.gridSize ?? 10,
			drawGridSize: options?.drawGrid?.size ?? 10,
			background: { color: options?.background ?? "#fff" },
			drawGrid: options?.drawGrid ? {
				color: options.drawGrid.color ?? "#bbb",
				thickness: options.drawGrid.thickness ?? 1
			} : false
		};
		this.joint = new JointGraph(this, jointPaperOptions);
		this.initGraphEvents();
		this.initializeTools();
	}
	get scale() {
		return this.joint.scrollerController.scale;
	}
	set scale(value) {
		this.joint.scrollerController.scale = value;
	}
	get position() {
		return this.joint.scrollerController.position;
	}
	set position(value) {
		this.joint.scrollerController.position = value;
	}
	initializeTools() {
		if (this.joint.paper.el) {
			if (this.keyboardManager) this.keyboardManager.destroy();
			this.keyboardManager = new KeyboardManager(this.joint.paper.el);
			this.initKeyboardShortcuts();
		}
	}
	setContainer(container) {
		this.joint.setContainer(container);
		this.initializeTools();
	}
	select(item) {
		const id = typeof item === "string" ? item : item.id || "";
		const cellObj = this.cellsMap.get(id);
		if (cellObj) {
			const instance = cellObj.cell;
			if (!this.selection.has(instance)) this.selection.add(instance);
			if (!this.jointSelection.has(cellObj.jointCell)) this.jointSelection.add(cellObj.jointCell);
		}
		this.joint.groupCells([...this.jointSelection]);
	}
	selectCollection(items) {
		this.selection.clear();
		this.jointSelection.clear();
		items.forEach((item) => {
			const cellObj = this.cellsMap.get(item.id || "");
			if (cellObj) {
				const instance = cellObj.cell;
				if (!this.selection.has(instance)) this.selection.add(instance);
				if (!this.jointSelection.has(cellObj.jointCell)) this.jointSelection.add(cellObj.jointCell);
			}
		});
		this.joint.groupCells([...this.jointSelection]);
	}
	unselect(item) {
		const id = typeof item === "string" ? item : item.id || "";
		const cellObj = this.cellsMap.get(id);
		if (cellObj) {
			const instance = cellObj.cell;
			if (this.selection.has(instance)) this.selection.delete(instance);
			if (this.jointSelection.has(cellObj.jointCell)) this.jointSelection.delete(cellObj.jointCell);
		}
		this.joint.groupCells([...this.jointSelection]);
	}
	clearSelection() {
		this.selection.clear();
		this.jointSelection.clear();
		this.joint.clearGroups();
	}
	addNode(instance, style) {
		instance.id = instance.id || this.generateNodeId();
		for (const input of instance.inputs || []) input.id = this.generatePortId(instance.inputs, "in", input.id);
		for (const output of instance.outputs || []) output.id = this.generatePortId(instance.outputs, "out", output.id);
		const jointNode = this.joint.addNode(instance, style);
		instance._bbox = this.getElementBBox(this.joint.paper.findViewByModel(jointNode));
		this.cellsMap.set(instance.id, {
			cell: instance,
			jointCell: jointNode
		});
	}
	addLink(link, style) {
		link.id = link.id || this.generateLinkId();
		const jointLink = this.joint.addLink(link, style);
		this.cellsMap.set(link.id, {
			cell: link,
			jointCell: jointLink
		});
	}
	removeCells(nodes) {
		const removeCells = [];
		nodes.forEach((node) => {
			const cellObj = this.cellsMap.get(node.id || "");
			if (cellObj) {
				removeCells.push(cellObj.jointCell);
				this.cellsMap.delete(node.id || "");
				this.selection.delete(node);
				this.jointSelection.delete(cellObj.jointCell);
			}
		});
		this.joint.removeCells(removeCells);
		this.selectionChanged();
	}
	destroy() {
		this.keyboardManager?.destroy();
		this.joint.destroy();
		this.joint = null;
	}
	getLinks() {
		const links = [];
		this.cellsMap.forEach(({ cell }) => {
			if (cell instanceof Graph$1.LinkInstance) links.push(cell);
		});
		return links;
	}
	getNodes() {
		const nodes = [];
		this.cellsMap.forEach(({ cell }) => {
			if (cell instanceof Graph$1.NodeInstance) nodes.push(cell);
		});
		return nodes;
	}
	findNode(id) {
		const cellObj = this.cellsMap.get(id);
		if (cellObj && cellObj.cell instanceof Graph$1.NodeInstance) return cellObj.cell;
		return void 0;
	}
	findLink(id) {
		const cellObj = this.cellsMap.get(id);
		if (cellObj && cellObj.cell instanceof Graph$1.LinkInstance) return cellObj.cell;
		return void 0;
	}
	zoomIn() {
		this.joint.scrollerController.scale += .1;
	}
	zoomOut() {
		this.joint.scrollerController.scale -= .1;
	}
	zoom(value) {
		this.joint.scrollerController.scale = value;
	}
	resetZoom(defaultScale = 1) {
		this.joint.scrollerController.scale = defaultScale;
		this.joint.scrollerController.position = {
			x: 0,
			y: 0
		};
	}
	clientToGraphPoint(clientX, clientY) {
		return this.joint.paper.clientToLocalPoint(clientX, clientY);
	}
	initKeyboardShortcuts() {
		if (!this.keyboardManager) return;
		this.keyboardManager.registerShortcut("delete", () => {
			this.graph.deleteSelection();
		});
		this.keyboardManager.registerShortcut("backspace", () => {
			this.graph.deleteSelection();
		});
		this.keyboardManager.registerShortcut("mod+z", () => {
			this.graph.undoManager.undo();
		});
		this.keyboardManager.registerShortcut("mod+y", () => {
			this.graph.undoManager.redo();
		});
		this.keyboardManager.registerShortcut("mod+shift+z", () => {
			this.graph.undoManager.redo();
		});
		this.keyboardManager.registerShortcut("mod+a", (e) => {
			e.preventDefault();
			this.clearSelection();
			const allNodes = this.getNodes();
			const allLinks = this.getLinks();
			this.selectCollection([...allNodes, ...allLinks]);
			this.selectionChanged();
		});
		this.keyboardManager.registerShortcut("mod+c", (e) => {
			if (e.target !== this.graph.container) return;
			e.preventDefault();
			this.graph.copySelection();
		});
		this.keyboardManager.registerShortcut("mod+v", (e) => {
			if (e.target !== this.graph.container) return;
			e.preventDefault();
			this.graph.pasteClipboard();
		});
	}
	generatePortId(list, prefix, defaultId = "") {
		if (defaultId) {
			if (!defaultId.startsWith(prefix + "-")) defaultId = prefix + "-" + defaultId;
			return defaultId;
		}
		const id = `${prefix}-${Math.random().toString(36).slice(2, 11)}`;
		if (list.some((port) => port.id === id)) return this.generatePortId(list, prefix);
		return id;
	}
	generateNodeId() {
		const id = "node-" + Math.random().toString(36).slice(2, 11);
		if (this.cellsMap.has(id)) return this.generateNodeId();
		return id;
	}
	generateLinkId() {
		const id = "link-" + Math.random().toString(36).slice(2, 11);
		if (this.cellsMap.has(id)) return this.generateLinkId();
		return id;
	}
	setOptions(options) {
		if (options.width) this.joint.paper.options.width = options.width;
		if (options.height) this.joint.paper.options.height = options.height;
		if (options.gridSize !== void 0) this.joint.paper.options.gridSize = options.gridSize;
		if (options.background) this.joint.paper.options.background = { color: options.background };
		if (options.drawGrid) {
			this.joint.paper.options.drawGridSize = options.drawGrid.size ?? 10;
			this.joint.paper.options.drawGrid = {
				color: options.drawGrid.color ?? "#bbb",
				thickness: options.drawGrid.thickness ?? 1
			};
		}
	}
	initGraphEvents() {
		this.graph.on("node:mounted", (node) => {
			node.inputs.forEach(async (input) => {
				if (input.type !== "select") return;
				const jointCell = this.cellsMap.get(node.id || "")?.jointCell;
				if (!jointCell) return;
				const elementView = this.joint.paper.findViewByModel(jointCell);
				if (typeof input.options === "function") {
					const options = await input.options(node.values);
					if (options === input._options || !Array.isArray(options)) return;
					input._options = options;
					jointCell.get("inputs").find((i) => i.name === input.name)._options = input._options;
					elementView.updateOptions(input.id || "", input.name, input._options || []);
					if (!node.values[input.name]) node.values[input.name] = input._options?.[0]?.value;
					elementView.refreshDomValue(input.name);
				}
			});
		});
		this.graph.on("node:changed", (node, change, oldvalue, newvalue) => {
			const pair = this.cellsMap.get(node.id);
			if (!pair) return;
			const { jointCell } = pair;
			if (!jointCell) return;
			switch (change) {
				case "position":
					jointCell.position(node.position.x, node.position.y);
					node._bbox = this.getElementBBox(this.joint.paper.findViewByModel(jointCell));
					break;
				case "title":
					jointCell.title(node.title);
					break;
				case "style":
					jointCell.setStyle(mergeDeep(jointCell.get("style") ?? {}, node.style ?? {}));
					break;
				case "values":
					jointCell.setValues(node.values);
					{
						const elementView = this.joint.paper.findViewByModel(jointCell);
						for (const name of Object.keys(newvalue || {})) {
							elementView.refreshDomValue(name);
							node.inputs.forEach(async (input) => {
								if (input.type !== "select") return;
								if (input.name === name) return;
								if (typeof input.options === "function") {
									const options = await input.options(node.values);
									if (options === input._options || !Array.isArray(options)) return;
									input._options = options;
									jointCell.get("inputs").find((i) => i.name === input.name)._options = input._options;
									elementView.updateOptions(input.id || "", input.name, input._options || []);
									node.values = { [input.name]: input._options?.[0]?.value };
								}
							});
						}
					}
					break;
				case "inputs":
					jointCell.set("inputs", node.inputs);
					break;
				case "outputs":
					jointCell.set("outputs", node.outputs);
					break;
			}
		});
		const listener = new Listener();
		listener.listenTo(this.joint.graph, "node:switch:add-case", (jointNode) => {
			const instance = this.cellsMap.get(jointNode.id)?.cell;
			if (!instance) return;
			const caseCount = instance.inputs.filter((input) => input.name.startsWith("case_")).length;
			instance.inputs = [...instance.inputs, {
				name: `case_${caseCount + 1}_value`,
				type: "string",
				id: this.generatePortId(instance.inputs, "in")
			}];
			instance.outputs = [...instance.outputs, {
				name: `case_${caseCount + 1}`,
				type: "exec",
				id: this.generatePortId(instance.outputs, "out")
			}];
		});
		listener.listenTo(this.joint.graph, "node:values:changed", (elementView, name, value) => {
			const instance = this.cellsMap.get(elementView.model.id)?.cell;
			instance.values = { [name]: value };
		});
		listener.listenTo(this.joint.paper, "element:pointerclick", (elementView, evt) => {
			const jointNode = elementView.model;
			const instance = this.cellsMap.get(jointNode.id)?.cell;
			if (!instance) return;
			this.emit("node:click", instance, evt);
			if (!evt.shiftKey && this.selection.has(instance) && this.selection.size === 1) return;
			if (evt.shiftKey && this.selection.has(instance)) {
				this.unselect(instance);
				this.selectionChanged();
				return;
			}
			if (!evt.shiftKey) this.clearSelection();
			this.select(instance);
			this.selectionChanged();
		});
		listener.listenTo(this.joint.paper, "element:pointerdblclick", (elementView, evt) => {
			const jointNode = elementView.model;
			const instance = this.cellsMap.get(jointNode.id)?.cell;
			if (!instance) return;
			this.emit("node:dblclick", instance, evt);
			if (instance.subgraphId && this.graph.model.hasSubgraph(instance.subgraphId)) this.graph.enterSubgraph(instance.subgraphId);
		});
		listener.listenTo(this.joint.paper, "blank:pointerclick", (evt) => {
			this.emit("blank:click", evt);
			if (!evt.shiftKey) {
				if (this.selection.size > 0) {
					this.clearSelection();
					this.selectionChanged();
				}
			}
		});
		listener.listenTo(this.joint.paper, "blank:pointerdblclick", (evt) => {
			this.emit("blank:dblclick", evt);
		});
		listener.listenTo(this.joint.paper, "link:pointerclick", (linkView, evt) => {
			const jointLink = linkView.model;
			const instance = this.cellsMap.get(jointLink.id)?.cell;
			if (!instance) return;
			this.emit("link:click", instance, evt);
			if (!evt.shiftKey && this.selection.has(instance) && this.selection.size === 1) return;
			if (evt.shiftKey && this.selection.has(instance)) {
				this.unselect(instance);
				this.selectionChanged();
				return;
			}
			if (!evt.shiftKey) this.clearSelection();
			this.select(instance);
			this.selectionChanged();
		});
		listener.listenTo(this.joint.paper, "link:pointerdblclick", (linkView, evt) => {
			const jointLink = linkView.model;
			const instance = this.cellsMap.get(jointLink.id)?.cell;
			if (!instance) return;
			this.emit("link:dblclick", instance, evt);
		});
		listener.listenTo(this.joint.paper, "link:connect", (linkView) => {
			const source = linkView.model.get("source");
			const target = linkView.model.get("target");
			const linkInstance = this.graph.createLinkInstance({
				id: linkView.model.id,
				source: {
					id: source.id,
					port: source.port
				},
				target: {
					id: target.id,
					port: target.port
				}
			});
			this.cellsMap.set(linkInstance.id, {
				cell: linkInstance,
				jointCell: linkView.model
			});
			const sourceObj = this.cellsMap.get(source.id);
			const targetObj = this.cellsMap.get(target.id);
			const sourceJointNode = sourceObj?.jointCell;
			const targetJointNode = targetObj?.jointCell;
			if (!sourceJointNode || !targetJointNode) return;
			const sourceNode = sourceObj?.cell;
			const targetNode = targetObj?.cell;
			const sourcePortId = source.port;
			const targetPortId = target.port;
			const sourcePort = sourcePortId.startsWith("in-") ? sourceNode.inputs?.find((port) => port.id === sourcePortId) : sourceNode.outputs?.find((port) => port.id === sourcePortId);
			const targetPort = targetPortId.startsWith("out-") ? targetNode.outputs?.find((port) => port.id === targetPortId) : targetNode.inputs?.find((port) => port.id === targetPortId);
			linkView.model.attr("line/stroke", this.graph.getLinkColor(sourceNode, targetNode, sourcePort, targetPort));
			linkInstance.style = mergeDeep(linkInstance.style ?? {}, {
				stroke: linkView.model.attr("line/stroke"),
				strokeWidth: linkView.model.attr("line/strokeWidth")
			});
			this.graph.startTransaction();
			this.graph.model.addLinks([linkInstance]);
			this.graph.commitTransaction();
		});
		listener.listenTo(this.joint.paper, "selection:changed", (cells) => {
			this.clearSelection();
			this.selectCollection(cells.map((cell) => {
				const instance = this.cellsMap.get(cell.id)?.cell;
				return instance;
			}).filter((i) => !!i));
			this.selectionChanged();
		});
		const hovered = /* @__PURE__ */ new Set();
		this.joint.paper.on("cell:mouseover", (cellView, evt) => {
			if (!(cellView.model instanceof BlueprintNode)) return;
			const id = cellView.model.id;
			if (!hovered.has(id)) {
				hovered.add(id);
				this.graph.emit("node:mouseenter", this.cellsMap.get(id)?.cell, evt);
			}
		});
		this.joint.paper.on("cell:mouseout", (cellView, evt) => {
			const id = cellView.model.id;
			const mouseEvt = evt;
			if (hovered.has(id) && !cellView.el.contains(mouseEvt.relatedTarget)) {
				hovered.delete(id);
				this.graph.emit("node:mouseleave", this.cellsMap.get(id)?.cell, mouseEvt);
			}
		});
		let lastRightClickTime = 0;
		listener.listenTo(this.joint.paper, "blank:contextmenu", (evt) => {
			const now = Date.now();
			if (now - lastRightClickTime < 400) {
				this.graph.exitSubgraph();
				lastRightClickTime = 0;
			} else lastRightClickTime = now;
			evt.preventDefault();
		});
	}
	getElementBBox(elementView) {
		const pos = elementView.model.position();
		const size = elementView.model.size();
		const scale = this.joint.scrollerController.scale;
		const pan = this.joint.scrollerController.position;
		const paperEl = this.joint.paper.el;
		const rect = paperEl.getBoundingClientRect();
		const left$1 = rect.left + pos.x * scale + pan.x;
		const top = rect.top + pos.y * scale + pan.y;
		const width = size.width * scale;
		const height = size.height * scale;
		return {
			left: left$1,
			top,
			width,
			height,
			x: left$1,
			y: top
		};
	}
	selectionChanged() {
		this.graph.emit("selection:changed", Array.from(this.selection));
		this.joint.groupCells(Array.from(this.jointSelection));
	}
	clear() {
		this.cellsMap.clear();
		this.selection.clear();
		this.jointSelection.clear();
		this.joint.clear();
	}
};

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
//#region src/UndoManager.ts
var AddNodeCommand = class {
	graph;
	nodes;
	constructor(graph, nodes) {
		this.graph = graph;
		this.nodes = nodes;
	}
	undo() {
		this.graph.removeNodes(this.nodes);
	}
	redo() {
		this.graph.addNodes(this.nodes);
	}
};
var RemoveNodeCommand = class {
	graph;
	nodes;
	constructor(graph, nodes) {
		this.graph = graph;
		this.nodes = nodes;
	}
	undo() {
		this.graph.addNodes(this.nodes);
	}
	redo() {
		this.graph.removeNodes(this.nodes);
	}
};
var AddLinkCommand = class {
	graph;
	links;
	constructor(graph, links) {
		this.graph = graph;
		this.links = links;
	}
	undo() {
		this.graph.removeLinks(this.links);
	}
	redo() {
		this.graph.addLinks(this.links);
	}
};
var RemoveLinkCommand = class {
	graph;
	links;
	constructor(graph, links) {
		this.graph = graph;
		this.links = links;
	}
	undo() {
		this.graph.addLinks(this.links);
	}
	redo() {
		this.graph.removeLinks(this.links);
	}
};
var PropertyChangeCommand = class {
	node;
	property;
	from;
	to;
	constructor(node, property, from, to) {
		this.node = node;
		this.property = property;
		this.from = from;
		this.to = to;
	}
	undo() {
		this.node[this.property] = this.from;
	}
	redo() {
		this.node[this.property] = this.to;
	}
};
var UndoManager = class {
	undoStack = [];
	redoStack = [];
	transactionStack = [];
	_isUndoingRedoing = false;
	graph;
	constructor(graph) {
		this.graph = graph;
	}
	get isUndoingRedoing() {
		return this._isUndoingRedoing;
	}
	record(command) {
		if (this._isUndoingRedoing) return;
		if (this.graph.skipsUndoManager) return;
		if (this.transactionStack.length > 0) this.transactionStack[this.transactionStack.length - 1].push(command);
	}
	/**
	* Start a transaction to group multiple commands into one.
	*/
	startTransaction() {
		this.transactionStack.push([]);
	}
	/**
	* Commit the current transaction.
	*/
	commitTransaction() {
		const commands = this.transactionStack.pop();
		if (!commands || commands.length === 0) return;
		const compoundCommand = {
			redo: () => commands.forEach((c) => c.redo()),
			undo: () => commands.slice().reverse().forEach((c) => c.undo())
		};
		if (this.transactionStack.length > 0) this.transactionStack[this.transactionStack.length - 1].push(compoundCommand);
		else {
			this.undoStack.push(compoundCommand);
			this.redoStack.length = 0;
		}
	}
	commit(callback) {
		this.startTransaction();
		try {
			callback();
			this.commitTransaction();
		} catch (err) {
			this.transactionStack.pop();
			throw err;
		}
	}
	createCommand(type, propertyName, target, oldvalue, newvalue) {
		switch (type) {
			case "addNodes": return new AddNodeCommand(this.graph, target);
			case "removeNodes": return new RemoveNodeCommand(this.graph, target);
			case "propertyChange":
				if (!oldvalue || !newvalue) throw new Error("PropertyChangeCommand requires oldvalue and newvalue options");
				return new PropertyChangeCommand(target, propertyName, oldvalue, newvalue);
			case "addLinks": return new AddLinkCommand(this.graph, target);
			case "removeLinks": return new RemoveLinkCommand(this.graph, target);
		}
	}
	handleChanged(e) {
		if (this._isUndoingRedoing) return;
		switch (e.change) {
			case ChangedEvent.Insert:
				if (e.object instanceof Graph$1.NodeInstance || Array.isArray(e.object) && e.object[0] instanceof Graph$1.NodeInstance) {
					const command = this.createCommand("addNodes", e.propertyName, Array.isArray(e.object) ? e.object : [e.object]);
					this.record(command);
				}
				if (e.object instanceof Graph$1.LinkInstance || Array.isArray(e.object) && e.object[0] instanceof Graph$1.LinkInstance) {
					const command = this.createCommand("addLinks", e.propertyName, Array.isArray(e.object) ? e.object : [e.object]);
					this.record(command);
				}
				break;
			case ChangedEvent.Delete:
				if (e.object instanceof Graph$1.NodeInstance || Array.isArray(e.object) && e.object[0] instanceof Graph$1.NodeInstance) {
					const command = this.createCommand("removeNodes", e.propertyName, Array.isArray(e.object) ? e.object : [e.object]);
					this.record(command);
				}
				if (e.object instanceof Graph$1.LinkInstance || Array.isArray(e.object) && e.object[0] instanceof Graph$1.LinkInstance) {
					const command = this.createCommand("removeLinks", e.propertyName, Array.isArray(e.object) ? e.object : [e.object]);
					this.record(command);
				}
				break;
			case ChangedEvent.Property:
				if (e.propertyName === "position") {
					const command = this.createCommand("propertyChange", e.propertyName, e.object, e.oldValue, e.newValue);
					this.record(command);
				}
				break;
		}
	}
	undo() {
		const cmd = this.undoStack.pop();
		if (!cmd) return;
		this._isUndoingRedoing = true;
		cmd.undo();
		this._isUndoingRedoing = false;
		this.redoStack.push(cmd);
	}
	canUndo() {
		return this.undoStack.length > 0;
	}
	redo() {
		const cmd = this.redoStack.pop();
		if (!cmd) return;
		this._isUndoingRedoing = true;
		cmd.redo();
		this._isUndoingRedoing = false;
		this.undoStack.push(cmd);
	}
	canRedo() {
		return this.redoStack.length > 0;
	}
	clear() {
		this.undoStack = [];
		this.redoStack = [];
		this.transactionStack = [];
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
var NodeInstance = class {
	_values = {};
	definition;
	id = "";
	data = null;
	subgraphId;
	_bbox = null;
	states = { position: {
		x: 0,
		y: 0
	} };
	graph;
	toolsView = null;
	constructor(Cls, options) {
		const { inputs,...definition } = Cls.definition;
		this.definition = {
			...structuredClone(definition),
			inputs: inputs.map((input) => {
				return { ...input };
			})
		};
		this.states.position = options?.position ?? {
			x: 0,
			y: 0
		};
		this.data = options?.data ?? null;
		const type = this.definition.type || "default";
		const nodeType = Cls.type;
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
		if (options?.values) this._values = { ...options.values };
		if (options?.data) this.data = options.data;
		if (options?.title) this.states.title = options.title;
		if (options?.id) this.id = options.id;
		if (options?.style) this.style = options.style;
		if (options?.subgraphId) this.subgraphId = options.subgraphId;
		if (options?.position) this.states.position = options.position;
		if (options?.inputs) this.states.inputs = options.inputs.map((input) => {
			const obj = {
				id: input.id,
				name: input.name,
				type: input.type
			};
			if (input.label !== void 0) obj.label = input.label;
			if (input.showInput !== void 0) obj.showInput = input.showInput;
			if (input.showPort !== void 0) obj.showPort = input.showPort;
			if (input.options) {
				obj.options = input.options ? input.options : void 0;
				obj._options = Array.isArray(input.options) ? input.options : void 0;
			}
			return obj;
		});
		if (options?.outputs) this.states.outputs = options.outputs.map((output) => {
			const obj = {
				id: output.id,
				name: output.name,
				type: output.type
			};
			if (output.label) obj.label = output.label;
			if (output.showPort) obj.showPort = output.showPort;
			return obj;
		});
		this.inputs.forEach((input) => {
			if (Array.isArray(input.options)) input._options = input.options;
			else if (typeof input.options === "function") input._options = [];
		});
		if (!this.states.inputs) for (const input of this.inputs) {
			const key = input.name;
			const val = options?.values?.[key];
			if (input.type === "select") {
				if (val === void 0) {
					if (Array.isArray(input.options)) {
						const inputOptions = input.options || [];
						this._values[key] = inputOptions.length > 0 ? inputOptions[0].value : "";
						const oldvalue = { ...this._values };
						const newvalue = { [input.name]: this._values[key] };
						this.raiseChangedEvent("values", oldvalue, newvalue);
					}
				}
			} else if (val !== void 0) this._values[key] = val;
		}
	}
	get bbox() {
		return this._bbox;
	}
	get position() {
		return this.states.position;
	}
	set position(value) {
		if (typeof value !== "object" || value === null || isNaN(value.x) || isNaN(value.y)) throw new Error("Position must be an object with numeric x and y properties.");
		if (this.states.position.x === value.x && this.states.position.y === value.y) return;
		const oldvalue = { ...this.states.position };
		this.states.position = value;
		const newvalue = { ...this.states.position };
		this.raiseChangedEvent("position", oldvalue, newvalue);
	}
	get title() {
		return this.states.title ?? this.definition.title ?? "";
	}
	set title(value) {
		const oldvalue = this.states.title;
		if (oldvalue === value) return;
		this.states.title = value;
		this.raiseChangedEvent("title", oldvalue, value);
	}
	get values() {
		return this._values;
	}
	set values(values) {
		this.checkValues(values);
		const oldvalue = { ...this._values };
		this._values = {
			...this._values,
			...values
		};
		this.raiseChangedEvent("values", oldvalue, values);
	}
	get inputs() {
		return this.states.inputs || this.definition.inputs;
	}
	set inputs(inputs) {
		const nameSet = /* @__PURE__ */ new Set();
		for (const input of inputs) {
			if (nameSet.has(input.name)) throw new Error(`Input name "${input.name}" is duplicated.`);
			nameSet.add(input.name);
		}
		const oldvalue = [...this.inputs || []];
		this.states.inputs = inputs;
		this.raiseChangedEvent("inputs", oldvalue, this.inputs);
	}
	get outputs() {
		return this.states.outputs || this.definition.outputs;
	}
	set outputs(outputs) {
		const nameSet = /* @__PURE__ */ new Set();
		for (const output of outputs) {
			if (nameSet.has(output.name)) throw new Error(`Output name "${output.name}" is duplicated.`);
			nameSet.add(output.name);
		}
		const oldvalue = [...this.outputs || []];
		this.states.outputs = outputs;
		this.raiseChangedEvent("outputs", oldvalue, this.outputs);
	}
	get style() {
		return this.states.style || this.definition.style;
	}
	set style(style) {
		const oldvalue = { ...this.states.style || {} };
		this.states.style = mergeDeep(this.states.style ?? {}, style);
		this.raiseChangedEvent("style", oldvalue, this.states.style);
	}
	showTools() {
		this.toolsView?.show();
	}
	hideTools() {
		this.toolsView?.hide();
	}
	addTools(toolsView) {
		this.toolsView = toolsView;
		this.toolsView.configure(this);
	}
	removeTools() {
		this.toolsView?.remove();
		this.toolsView = null;
	}
	getInput(name) {
		return this.definition.inputs.find((input) => input.name === name);
	}
	getOutput(name) {
		return this.definition.outputs.find((output) => output.name === name);
	}
	setGraph(graph) {
		this.graph = graph;
		this.graph.emit("node:mounted", this);
	}
	toString() {
		return `Node#${this.id}(${this.nodeType})`;
	}
	checkValues(values) {
		for (const key in values) {
			const input = this.inputs.find((i) => i.name === key);
			if (!input) throw new Error(`Input "${key}" not found in node definition.`);
			const value = values[key];
			switch (input.type) {
				case "string":
					if (typeof value !== "string") throw new Error(`Input "${key}" must be a string.`);
					break;
				case "number":
					if (typeof value !== "number" || isNaN(value)) throw new Error(`Input "${key}" must be a number.`);
					break;
				case "boolean":
					if (typeof value !== "boolean") throw new Error(`Input "${key}" must be a boolean.`);
					break;
				case "array":
					if (!Array.isArray(value)) throw new Error(`Input "${key}" must be an array.`);
					break;
				case "object":
					if (typeof value !== "object" || value === null || Array.isArray(value)) throw new Error(`Input "${key}" must be an object.`);
					break;
				case "select":
					if (typeof value !== "string") throw new Error(`Input "${key}" must be a string.`);
					break;
				case "textarea":
					if (typeof value !== "string") throw new Error(`Input "${key}" must be a string.`);
					break;
				default:
					console.warn(`Unknown input type "${input.type}" for input "${key}".`);
					return false;
			}
		}
		return true;
	}
	raiseChangedEvent(propertyName, oldvalue, newvalue) {
		const graph = this.graph;
		if (!graph) return;
		graph.emit("node:changed", this, propertyName, oldvalue, newvalue);
		graph.raiseChangedEvent(ChangedEvent.Property, propertyName, this, oldvalue, newvalue);
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
//#region src/GraphModel.ts
var GraphModel = class {
	undoStack = [];
	redoStack = [];
	id;
	nodes = [];
	links = [];
	viewport = {
		x: 0,
		y: 0,
		scale: 1
	};
	constructor(id = "", nodes = [], links = []) {
		this.id = id;
		this.nodes = nodes;
		this.links = links;
	}
};
var BlueprintModel = class BlueprintModel extends EventEmitter {
	variableManager = new VariableManager();
	activeGraph;
	graphStack;
	graph = null;
	_isSettingGraph = false;
	root = new GraphModel("root");
	subgraphs = /* @__PURE__ */ new Map();
	constructor(root = new GraphModel(), subgraphs = /* @__PURE__ */ new Map()) {
		super();
		this.subgraphs = subgraphs;
		this.root = root;
		this.activeGraph = root;
		this.graphStack = [root];
	}
	get isSettingGraph() {
		return this._isSettingGraph;
	}
	get subgraphStack() {
		return this.graphStack;
	}
	get currentModel() {
		return this.activeGraph;
	}
	get nodes() {
		return this.activeGraph.nodes;
	}
	setGraph(graph) {
		if (this.graph === graph) return;
		if (this.graph) this.graph.off("viewport:change", this.onViewportChange);
		this.graph = graph;
		if (this.graph) {
			this.graph.on("viewport:change", this.onViewportChange);
			this.graph.undoManager.clear();
			this.graph.position = {
				x: this.activeGraph.viewport.x,
				y: this.activeGraph.viewport.y
			};
			this.graph.scale = this.activeGraph.viewport.scale;
			if (!this.activeGraph.nodes.length) return;
			this._isSettingGraph = true;
			const oldskips = this.graph.skipsUndoManager;
			this.graph.skipsUndoManager = false;
			this.graph.startTransaction();
			this.graph.addNodes(this.activeGraph.nodes);
			try {
				this.activeGraph.links = this.graph.addLinks(this.activeGraph.links);
			} catch (error) {
				console.error("Error adding links to graph:", error);
			}
			this.graph.commitTransaction();
			this.graph.skipsUndoManager = oldskips;
			this._isSettingGraph = false;
		}
	}
	onViewportChange = (viewport) => {
		this.activeGraph.viewport = {
			x: viewport.x,
			y: viewport.y,
			scale: viewport.scale
		};
	};
	enterSubgraph(subgraphId) {
		const sub = this.subgraphs.get(subgraphId);
		if (!sub) return;
		if (!this.graph) return;
		this._isSettingGraph = true;
		const undoStack = this.graph.undoManager.undoStack;
		const redoStack = this.graph.undoManager.redoStack;
		this.activeGraph.undoStack = undoStack;
		this.activeGraph.redoStack = redoStack;
		this.graph.undoManager.clear();
		const oldnodes = this.graph.getNodes();
		const oldlinks = this.graph.getLinks();
		const oldskips = this.graph.skipsUndoManager;
		this.graph.skipsUndoManager = true;
		this.activeGraph = sub;
		this.graph.position = {
			x: this.activeGraph.viewport.x,
			y: this.activeGraph.viewport.y
		};
		this.graph.scale = this.activeGraph.viewport.scale;
		this.graph.removeNodes(oldnodes);
		this.graph.removeLinks(oldlinks);
		this.graph.addNodes(this.activeGraph.nodes);
		this.graph.addLinks(this.activeGraph.links);
		this.graph.undoManager.undoStack = this.activeGraph.undoStack;
		this.graph.undoManager.redoStack = this.activeGraph.redoStack;
		this.graph.skipsUndoManager = oldskips;
		this.graphStack.push(sub);
		this._isSettingGraph = false;
	}
	exitSubgraph() {
		if (this.graphStack.length > 1) {
			this._isSettingGraph = true;
			if (!this.graph) return;
			this.activeGraph.undoStack = this.graph.undoManager.undoStack;
			this.graphStack.pop();
			const previousGraph = this.graphStack[this.graphStack.length - 1];
			if (!this.graph) return;
			this.graph.undoManager.clear();
			const oldnodes = this.graph.getNodes();
			const oldlinks = this.graph.getLinks();
			this.activeGraph = previousGraph;
			const oldskips = this.graph.skipsUndoManager;
			this.graph.position = {
				x: this.activeGraph.viewport.x,
				y: this.activeGraph.viewport.y
			};
			this.graph.scale = this.activeGraph.viewport.scale;
			this.graph.skipsUndoManager = true;
			this.graph.removeNodes(oldnodes);
			this.graph.removeLinks(oldlinks);
			this.graph.addNodes(previousGraph.nodes);
			this.graph.addLinks(previousGraph.links);
			this.graph.undoManager.undoStack = this.activeGraph.undoStack;
			this.graph.undoManager.redoStack = this.activeGraph.redoStack;
			this.graph.skipsUndoManager = oldskips;
			this._isSettingGraph = false;
		}
	}
	hasSubgraph(subgraphId) {
		return this.subgraphs.has(subgraphId);
	}
	createSubgraph(subgraphId) {
		if (!this.subgraphs.has(subgraphId)) {
			const sub = new GraphModel(subgraphId);
			this.subgraphs.set(subgraphId, sub);
			const StartNodeClass = this.graph?.nodeRegistry.getStartNodeClass();
			const startNode = this.graph.createNodeInstance(StartNodeClass);
			const EndNodeClass = this.graph?.nodeRegistry.getEndNodeClass();
			const endNode = this.graph.createNodeInstance(EndNodeClass);
			startNode.id = "start-" + subgraphId;
			startNode.position = {
				x: 300,
				y: 300
			};
			endNode.id = "end-" + subgraphId;
			endNode.position = {
				x: 600,
				y: 300
			};
			startNode.outputs = [{
				id: "exec",
				name: "exec",
				type: "exec",
				label: ""
			}, {
				id: "param",
				name: "param",
				type: "any",
				label: "param"
			}];
			endNode.inputs = [...endNode.inputs, {
				id: "result",
				name: "result",
				type: "any",
				label: "result"
			}];
			sub.nodes.push(startNode);
			sub.nodes.push(endNode);
			return sub;
		}
	}
	removeSubgraph(subgraphId) {
		this.subgraphs.delete(subgraphId);
	}
	resetToRoot() {
		this.graphStack = [this.root];
		this.activeGraph = this.root;
	}
	findNode(id) {
		return this.activeGraph.nodes.find((node) => node.id === id);
	}
	findLink(id) {
		return this.activeGraph.links.find((link) => link.id === id);
	}
	getNodes() {
		return this.activeGraph.nodes;
	}
	getLinks() {
		return this.activeGraph.links;
	}
	addNodes(nodes) {
		if (this.isSettingGraph) return;
		if (nodes.length === 0) return;
		if (!this.graph) return;
		this.activeGraph.nodes.push(...nodes);
		for (const node of nodes) if (node.definition.type === "subgraph") this.handleSubgraphNode(node);
		this.raiseChanged(ChangedEventType.Insert, "nodes", nodes, null, nodes);
	}
	removeNodes(nodes) {
		if (this.isSettingGraph) return;
		if (nodes.length === 0) return;
		if (!this.graph) return;
		const doRemoveLinks = [];
		const links = this.getLinks();
		const removeSubgraphIds = [];
		nodes.forEach((node) => {
			links.forEach((link) => {
				if (link.source.id === node.id || link.target.id === node.id) doRemoveLinks.push(link);
			});
			if (node.subgraphId && this.hasSubgraph(node.subgraphId)) removeSubgraphIds.push(node.subgraphId);
		});
		const allNodes = this.getAllNodes();
		const remainingNodes = allNodes.filter((n) => !nodes.includes(n));
		if (removeSubgraphIds.length > 0) {
			for (const remainingNode of remainingNodes) if (remainingNode.subgraphId && removeSubgraphIds.includes(remainingNode.subgraphId)) {
				const index = removeSubgraphIds.indexOf(remainingNode.subgraphId);
				if (index > -1) removeSubgraphIds.splice(index, 1);
			}
			removeSubgraphIds.forEach((id) => this.removeSubgraph(id));
		}
		this.activeGraph.nodes = this.activeGraph.nodes.filter((n) => !nodes.includes(n));
		if (!this.graph) return;
		this.graph.startTransaction();
		if (doRemoveLinks.length > 0) this.graph.removeLinks(doRemoveLinks);
		this.graph.commitTransaction();
		this.raiseChanged(ChangedEventType.Delete, "nodes", nodes, nodes, null);
	}
	addLinks(links) {
		if (this.isSettingGraph) return;
		if (links.length === 0) return;
		if (!this.graph) return;
		this.activeGraph.links.push(...links);
		this.raiseChanged(ChangedEventType.Insert, "links", links, null, links);
	}
	removeLinks(links) {
		if (this.isSettingGraph) return;
		if (links.length === 0) return;
		if (!this.graph) return;
		this.activeGraph.links = this.activeGraph.links.filter((l) => !links.includes(l));
		this.raiseChanged(ChangedEventType.Delete, "links", links, links, null);
	}
	getAllNodes() {
		const allNodes = [];
		allNodes.push(...this.root.nodes);
		for (const subgraph of this.subgraphs.values()) allNodes.push(...subgraph.nodes);
		return allNodes;
	}
	getAllLinks() {
		const allLinks = [];
		allLinks.push(...this.root.links);
		for (const subgraph of this.subgraphs.values()) allLinks.push(...subgraph.links);
		return allLinks;
	}
	clear() {
		if (this.isSettingGraph) return;
		if (this.activeGraph.id !== this.root.id) this.activeGraph = this.root;
		this.root.nodes = [];
		this.root.links = [];
		this.subgraphs.clear();
	}
	toJSON() {
		return Util.toJSON(this);
	}
	static fromJSON(graph, json) {
		const model = new BlueprintModel();
		if (typeof json === "string") json = JSON.parse(json);
		const { subgraphs, nodes, links, variables, viewport } = Util.fromJSON(graph, json);
		model.root.nodes = nodes;
		model.root.links = links;
		model.root.viewport = {
			x: viewport.x,
			y: viewport.y,
			scale: viewport.zoom
		};
		for (const variable of variables) model.variableManager.setVariable({
			name: variable.name,
			type: variable.type,
			value: variable.value
		});
		for (const subgraphId in subgraphs) {
			const subgraphData = subgraphs[subgraphId];
			const subgraphModel = new GraphModel(subgraphId, subgraphData.nodes, subgraphData.links);
			subgraphModel.viewport = {
				x: subgraphData.viewport.x,
				y: subgraphData.viewport.y,
				scale: subgraphData.viewport.zoom
			};
			model.subgraphs.set(subgraphId, subgraphModel);
		}
		return model;
	}
	raiseChanged(change, propertyName, object, oldValue, newValue) {
		if (!this.graph) return;
		this.graph.raiseChangedEvent(change, propertyName, object, oldValue, newValue);
	}
	generateSubgraphId() {
		const id = "sg_" + Math.random().toString(36).slice(2, 11);
		if (this.subgraphs.has(id)) return this.generateSubgraphId();
		return id;
	}
	handleSubgraphNode(node) {
		node.subgraphId = node.subgraphId || this.generateSubgraphId();
		const subgraphId = node.subgraphId;
		if (!this.hasSubgraph(subgraphId)) this.createSubgraph(subgraphId);
	}
};

//#endregion
//#region src/Graph.ts
var Graph$1 = class Graph$1 extends EventEmitter {
	undoManager = new UndoManager(this);
	skipsUndoManager = false;
	container;
	_model;
	nodeRegistry;
	_defaultScale = 1;
	adapter;
	options;
	static NodeInstance;
	static LinkInstance;
	clipboard = {
		nodes: [],
		links: []
	};
	constructor(registry, options) {
		super();
		this.options = options || {};
		this.nodeRegistry = registry;
		this.container = options?.container;
		if (this.container) {
			this.container.setAttribute("tabindex", "0");
			this.container.style.outline = "none";
			this.container.focus();
		}
		this.adapter = new GraphAdapter(this, options);
		this.model = new BlueprintModel();
		this.initialize();
	}
	get selection() {
		return this.adapter.selection || /* @__PURE__ */ new Set();
	}
	get scale() {
		return this.adapter.scale || 1;
	}
	set scale(value) {
		if (this.adapter) this.adapter.scale = value;
	}
	get position() {
		return this.adapter.position || {
			x: 0,
			y: 0
		};
	}
	set position(value) {
		if (this.adapter) this.adapter.position = value;
	}
	get defaultScale() {
		return this._defaultScale;
	}
	set defaultScale(value) {
		this._defaultScale = value;
	}
	get model() {
		return this._model;
	}
	set model(value) {
		this.clear();
		this._model = value;
		value.setGraph(this);
	}
	initialize() {
		this.initAdapterEvents();
	}
	/** @inheritdoc {@link IGraph.addNode} */
	addNode(nodeType, options) {
		const nodeInstance = nodeType instanceof NodeInstance ? nodeType : this.createNodeInstance(nodeType, options);
		const style = mergeDeep(mergeDeep(this.nodeRegistry.nodeStyle, nodeInstance.definition.style ?? {}), nodeInstance.style ?? {});
		this._validateNodes([nodeInstance]);
		this.adapter.addNode(nodeInstance, style);
		nodeInstance.setGraph(this);
		this.model.addNodes([nodeInstance]);
		return nodeInstance;
	}
	/** @inheritdoc {@link IGraph.addLink} */
	addLink(link) {
		const linkInstance = link instanceof LinkInstance ? link : this.createLinkInstance(link);
		const style = mergeDeep(this.nodeRegistry.linkStyle, linkInstance.style ?? {});
		if (this._validateLinkConnection(linkInstance)) {
			this.adapter.addLink(linkInstance, style);
			this.model.addLinks([linkInstance]);
		}
		return linkInstance;
	}
	/** Adds multiple nodes to the graph. */
	addNodes(nodes) {
		this._validateNodes(nodes);
		nodes.forEach((node) => {
			const style = mergeDeep(mergeDeep(this.nodeRegistry.nodeStyle, node.definition.style ?? {}), node.style || {});
			this.adapter.addNode(node, style);
			node.setGraph(this);
		});
		this.model.addNodes(nodes);
		return nodes;
	}
	/** Adds multiple links to the graph. */
	addLinks(links) {
		const errors = [];
		links = links.filter((link) => {
			try {
				return this._validateLinkConnection(link);
			} catch (error) {
				errors.push(error);
				return false;
			}
		});
		links.forEach((link) => {
			const style = mergeDeep(this.nodeRegistry.linkStyle, link.style ?? {});
			this.adapter.addLink(link, style);
		});
		this.model.addLinks(links);
		if (errors.length > 0) throw new Error(`Some links could not be added:\n${errors.map((e) => e.message).join("\n")}`);
		return links;
	}
	/** @inheritdoc {@link IGraph.select} */
	select(item) {
		this.adapter.select(item);
	}
	/** @inheritdoc {@link IGraph.selectCollection} */
	selectCollection(items) {
		this.adapter.selectCollection(items);
	}
	clearSelection() {
		this.adapter.clearSelection();
	}
	/** @inheritdoc {@link IGraph.destroy} */
	destroy() {
		this.clear();
		if (this.adapter) this.adapter.destroy();
	}
	/** @inheritdoc {@link IGraph.setContainer} */
	setContainer(container) {
		container.setAttribute("tabindex", "0");
		container.style.outline = "none";
		container.focus();
		this.container = container;
		if (this.adapter) this.adapter.setContainer(container);
	}
	/** @inheritdoc {@link IGraph.deleteSelection} */
	deleteSelection() {
		const deleteCells = Array.from(this.selection);
		const deleteNodes = deleteCells.filter((c) => c instanceof Graph$1.NodeInstance);
		const deleteLinks = deleteCells.filter((c) => c instanceof Graph$1.LinkInstance);
		const oldskips = this.skipsUndoManager;
		if (!oldskips) this.startTransaction();
		this.removeNodes(deleteNodes);
		this.removeLinks(deleteLinks);
		if (!oldskips) this.commitTransaction();
	}
	/** @inheritdoc {@link IGraph.removeNodes} */
	removeNodes(nodes) {
		if (this.model.currentModel.id !== this.model.root.id) nodes = nodes.filter((n) => {
			if ((n.type === "start" || n.type === "end") && !this.model.isSettingGraph) return false;
			return true;
		});
		if (this.adapter) this.adapter.removeCells(nodes);
		this.model.removeNodes(nodes);
	}
	/** @inheritdoc {@link IGraph.removeLinks} */
	removeLinks(links) {
		if (this.adapter) this.adapter.removeCells(links);
		this.model.removeLinks(links);
	}
	copySelection() {
		this.copyCells([...this.selection]);
	}
	copyCells(cells) {
		const nodes = cells.filter((c) => c instanceof Graph$1.NodeInstance);
		const links = cells.filter((c) => c instanceof Graph$1.LinkInstance).filter((l) => {
			return nodes.find((n) => n.id === l.source.id) && nodes.find((n) => n.id === l.target.id);
		});
		const serializedNodes = Util.serializeNodes(nodes);
		const serializedLinks = Util.serializeLinks(links);
		this.clipboard.nodes = serializedNodes;
		this.clipboard.links = serializedLinks;
	}
	pasteClipboard() {
		if (this.clipboard.nodes.length === 0) return;
		if (!this.adapter) return;
		const oldnodeIdMap = /* @__PURE__ */ new Map();
		const nodes = Util.deserializeNodes(this, this.clipboard.nodes.map((n) => {
			const oldId = n.id;
			const newId = this.adapter.generateNodeId();
			oldnodeIdMap.set(oldId, newId);
			n.position = {
				x: n.position.x + 20,
				y: n.position.y + 20
			};
			return {
				...n,
				id: newId
			};
		}));
		const links = Util.deserializeLinks(this, this.clipboard.links.map((l) => {
			l.id = this.adapter.generateLinkId();
			const newSourceId = oldnodeIdMap.get(l.source.id);
			const newTargetId = oldnodeIdMap.get(l.target.id);
			return {
				id: l.id,
				source: {
					id: newSourceId,
					port: l.source.port
				},
				target: {
					id: newTargetId,
					port: l.target.port
				}
			};
		}));
		this.clearSelection();
		this.startTransaction();
		this.addNodes(nodes);
		this.addLinks(links);
		this.selectCollection([...nodes, ...links]);
		this.commitTransaction();
	}
	/** @inheritdoc {@link IGraph.getLinks} */
	getLinks() {
		return this.model.getLinks();
	}
	/** @inheritdoc {@link IGraph.getNodes} */
	getNodes() {
		return this.model.getNodes();
	}
	/** @inheritdoc {@link IGraph.findLink} */
	findNode(id) {
		return this.model.findNode(id);
	}
	/** @inheritdoc {@link IGraph.findLink} */
	findLink(id) {
		return this.model.findLink(id);
	}
	/** @inheritdoc {@link IGraph.zoomIn} */
	zoomIn() {
		if (this.adapter) this.adapter.zoomIn();
	}
	/** @inheritdoc {@link IGraph.zoomOut} */
	zoomOut() {
		if (this.adapter) this.adapter.zoomOut();
	}
	/** @inheritdoc {@link IGraph.zoom} */
	zoom(value) {
		if (this.adapter) this.adapter.zoom(value);
	}
	/** @inheritdoc {@link IGraph.resetZoom} */
	resetZoom() {
		if (this.adapter) this.adapter.resetZoom(this.defaultScale);
	}
	/** @inheritdoc {@link IGraph.createNodeInstance} */
	createNodeInstance(nodeType, options) {
		if (!this.nodeRegistry.isRegistered(nodeType)) {
			if (typeof nodeType === "string") throw new Error(`Node type "${nodeType}" is not registered.`);
			else if (nodeType.constructor && "name" in nodeType.constructor) throw new Error(`Node type "${nodeType.constructor.name}" is not registered.`);
		}
		let NodeClass;
		if (typeof nodeType === "string") NodeClass = this.nodeRegistry.get(nodeType);
		else NodeClass = nodeType;
		return new Graph$1.NodeInstance(NodeClass, options);
	}
	/** @inheritdoc {@link IGraph.createLinkInstance} */
	createLinkInstance(link) {
		const linkInstance = new LinkInstance(link.source, link.target);
		return Object.assign(linkInstance, link);
	}
	/** @inheritdoc {@link IGraph.getLinkColor} */
	getLinkColor(_sourceNode, _targetNode, sourcePort, targetPort) {
		const defaultLinkStyle$1 = this.nodeRegistry.linkStyle;
		if (defaultLinkStyle$1.byPortType) {
			const color = getLinkColor(defaultLinkStyle$1.byPortType, sourcePort, targetPort);
			if (color) return color;
		}
		return defaultLinkStyle$1.stroke || "rgba(255,255,255,0.5)";
	}
	enterSubgraph(subgraphId) {
		this.model.enterSubgraph(subgraphId);
		this.emit("subgraph:enter", subgraphId);
	}
	exitSubgraph() {
		const subgraphId = this.model.activeGraph.id;
		if (subgraphId === this.model.root.id) return;
		this.model.exitSubgraph();
		this.emit("subgraph:exit", subgraphId);
	}
	clientToGraphPoint(clientX, clientY) {
		if (!this.adapter) return {
			x: clientX,
			y: clientY
		};
		return this.adapter.clientToGraphPoint(clientX, clientY);
	}
	/** @inheritdoc {@link IGraph.startTransaction} */
	startTransaction() {
		this.undoManager.startTransaction();
	}
	/** @inheritdoc {@link IGraph.commitTransaction} */
	commitTransaction() {
		this.undoManager.commitTransaction();
	}
	/** @inheritdoc {@link IGraph.commit} */
	commit(...args) {
		this.undoManager.commit(...args);
	}
	/** @inheritdoc {@link IGraph.validateConnection} */
	validateConnection(_sourceNode, sourcePort, _targetNode, targetPort) {
		const sourceType = sourcePort.type;
		const targetType = targetPort.type;
		switch (sourceType) {
			case "exec":
				if (targetType !== "exec") return false;
				break;
			case "number":
				if (targetType !== "number" && targetType !== "any") return false;
				break;
			case "boolean":
				if (targetType !== "boolean" && targetType !== "any") return false;
				break;
			case "array":
				if (targetType !== "array" && targetType !== "any") return false;
				break;
			case "object":
				if (targetType !== "object" && targetType !== "any") return false;
				break;
			case "spacer": return false;
			case "any":
				if (targetType === "exec") return false;
				break;
			case "string":
				if (targetType !== "string" && targetType !== "any" && targetType !== "textarea") return false;
				break;
			case "textarea":
				if (targetType !== "textarea" && targetType !== "string" && targetType !== "any") return false;
				break;
		}
		return true;
	}
	raiseChangedEvent(change, propertyName, object, oldValue, newValue) {
		const e = new ChangedEvent();
		e.change = change;
		e.graph = this;
		e.propertyName = propertyName;
		e.oldValue = oldValue;
		e.newValue = newValue;
		e.object = object;
		this.callChangedListeners(e);
	}
	setOptions(options = {}) {
		this.options = mergeDeep(this.options, options);
		if (this.adapter) this.adapter.setOptions(this.options);
		if (options.container) this.setContainer(options.container);
	}
	toString(details = 0) {
		let name = "";
		if (this.container && this.container.id) name = this.container.id;
		let str = `Graph "${name ? "" + name : ""}"`;
		if (details > 0) {
			const nodes = this.getNodes();
			const links = this.getLinks();
			const total = nodes.length + links.length;
			str += "\n " + total + ": ";
			str += nodes.length + " Nodes ";
			str += links.length + " Links";
			for (const node of nodes) str += "\n   Node#" + node.id + `(${node.nodeType})`;
			for (const link of links) str += "\n   Link#" + link.id + `(${link.source.id} ${link.target.id}) ${link.source.port} ${link.target.port}`;
		}
		return str;
	}
	/** @inheritdoc {@link IGraph.toJSON} */
	toJSON() {
		return this.model.toJSON();
	}
	/** @inheritdoc {@link IGraph.fromJSON} */
	fromJSON(json) {
		this.model.setGraph(null);
		this.model = BlueprintModel.fromJSON(this, json);
		return this.model;
	}
	/** @inheritdoc {@link IGraph.clear} */
	clear() {
		if (this.model) this.model.clear();
		if (this.adapter) this.adapter.clear();
		this.undoManager.clear();
	}
	initAdapterEvents() {
		this.adapter.on("node:click", (instance, evt) => {
			this.emit("node:click", instance, evt);
		});
		this.adapter.on("node:dblclick", (instance, evt) => {
			this.emit("node:dblclick", instance, evt);
		});
		this.adapter.on("blank:click", (evt) => {
			this.emit("blank:click", evt);
		});
		this.adapter.on("blank:dblclick", (evt) => {
			this.emit("blank:dblclick", evt);
		});
		this.adapter.on("link:click", (instance, evt) => {
			this.emit("link:click", instance, evt);
		});
		this.adapter.on("link:dblclick", (instance, evt) => {
			this.emit("link:dblclick", instance, evt);
		});
	}
	callChangedListeners(e) {
		if (!this.skipsUndoManager) this.undoManager.handleChanged(e);
		this.emit("changed", e);
	}
	_validateLinkConnection(link) {
		const sourceNode = this.findNode(link.source.id);
		const targetNode = this.findNode(link.target.id);
		if (!sourceNode) throw new Error(`Source node with id "${link.source.id}" not found.`);
		if (!targetNode) throw new Error(`Target node with id "${link.target.id}" not found.`);
		if (sourceNode.id === targetNode.id) throw new Error(`Cannot connect a node to itself: "${sourceNode.id}".`);
		const sourcePortId = link.source.port;
		const targetPortId = link.target.port;
		if (!sourcePortId || !targetPortId) throw new Error(`Both source port and target port must be specified in the link.`);
		if (sourcePortId.startsWith("in-") && targetPortId.startsWith("in-")) throw new Error(`Cannot connect two input ports: "${sourcePortId}" and "${targetPortId}".`);
		if (sourcePortId.startsWith("out-") && targetPortId.startsWith("out-")) throw new Error(`Cannot connect two output ports: "${sourcePortId}" and "${targetPortId}".`);
		const sourcePort = sourcePortId.startsWith("out-") ? sourceNode.outputs.find((port) => port.id === sourcePortId) : sourceNode.inputs.find((port) => port.id === sourcePortId);
		if (!sourcePort) throw new Error(`Source port "${link.source.port}" not found in node "${sourceNode}".`);
		const targetPort = targetPortId.startsWith("in-") ? targetNode.inputs.find((port) => port.id === targetPortId) : targetNode.outputs.find((port) => port.id === targetPortId);
		if (!targetPort) throw new Error(`Target port "${link.target.port}" not found in node "${targetNode}".`);
		if (!this.validateConnection(sourceNode, sourcePort, targetNode, targetPort)) throw new Error(`Port type mismatch: cannot connect ${sourceNode} [${sourcePort.name}:${sourcePort.type}] to ${targetNode} [${targetPort.name}:${targetPort.type}].`);
		return true;
	}
	_validateNodes(nodes) {
		if (this.model.subgraphStack.length > 1) {
			if (nodes.some((n) => n.type === "start") && this.getNodes().some((n) => n.type === "start")) throw new Error("A subgraph cannot contain another start node.");
		}
		return true;
	}
};
var LinkInstance = class {
	style;
	id;
	source;
	target;
	constructor(source, target) {
		this.source = source;
		this.target = target;
	}
	toString() {
		return `Link#${this.id}(${this.source.id} ${this.target.id}) ${this.source.port} ${this.target.port}`;
	}
};
Graph$1.NodeInstance = NodeInstance;
Graph$1.LinkInstance = LinkInstance;
const getLinkColor = (() => {
	const cachedColors = {};
	const currentColorIndexMap = {};
	return (colors, sourcePort, targetPort) => {
		const source = (sourcePort.id || "").startsWith("out-") ? sourcePort : targetPort;
		const target = (targetPort.id || "").startsWith("in-") ? targetPort : sourcePort;
		if (!Array.isArray(colors[source.type]) || !Array.isArray(colors[target.type])) return;
		const sourceId = source.id || "";
		const targetId = target.id || "";
		const cachedColor = cachedColors[sourceId + targetId];
		if (cachedColor) return cachedColor;
		const sourceCachedColor = cachedColors[sourceId];
		const targetCachedColor = cachedColors[targetId];
		if (sourceCachedColor) {
			cachedColors[sourceId + targetId] = sourceCachedColor;
			return sourceCachedColor;
		}
		if (targetCachedColor) {
			cachedColors[sourceId + targetId] = targetCachedColor;
			return targetCachedColor;
		}
		currentColorIndexMap[source.type] = currentColorIndexMap[source.type] || 0;
		const color = colors[source.type][currentColorIndexMap[source.type]];
		cachedColors[sourceId] = color;
		cachedColors[targetId] = color;
		currentColorIndexMap[source.type] = (currentColorIndexMap[source.type] + 1) % colors[source.type].length;
		return color;
	};
})();

//#endregion
//#region src/NodeToolsView.ts
var NodeToolsView = class {
	node;
	element;
	tools;
	constructor(tools) {
		this.tools = tools;
		this.element = document.createElement("div");
		this.element.classList.add("bpgraph-node-tools-view");
		this.element.style.position = "absolute";
		this.element.style.top = "0";
		this.element.style.left = "0";
		this.element.style.pointerEvents = "none";
	}
	remove() {
		this.unmount();
		this.node = void 0;
		this.tools.forEach((tool) => tool.remove());
	}
	configure(node) {
		this.node = node;
		this.mount();
		this.tools.forEach((tool) => tool.configure(node, this));
		this.updatePosition();
		node.graph?.on("node:dragmove", this.onDragMove);
	}
	onDragMove = () => {
		this.updatePosition();
	};
	update() {
		this.updatePosition();
	}
	isMounted() {
		return this.element.parentElement !== null;
	}
	mount() {
		if (!this.node) return;
		if (this.isMounted()) return;
		if (!this.node.graph) return;
		if (!this.node.graph.container) return;
		this.node.graph.container.appendChild(this.element);
	}
	unmount() {
		if (this.isMounted()) {
			this.element.remove();
			this.node?.graph?.off("node:dragmove", this.onDragMove);
		}
	}
	updatePosition() {
		if (!this.node) return;
		if (!this.node.graph) return;
		if (!this.node.graph.container) return;
		const bbox = this.node.bbox;
		if (!bbox) return;
		this.element.style.transform = `translate(${bbox.x}px, ${bbox.y}px)`;
	}
	show() {
		if (!this.isMounted()) this.mount();
		this.tools.forEach((tool) => tool.show());
	}
	hide() {
		this.unmount();
		this.tools.forEach((tool) => tool.hide());
	}
};
var NodeToolView = class extends EventEmitter {
	element = document.createElement("div");
	node;
	parentView;
	constructor() {
		super();
		this.element.classList.add("bpgraph-node-tool-view");
	}
	configure(node, parent) {
		this.node = node;
		this.parentView = parent;
		this.parentView.element.appendChild(this.element);
	}
	show() {}
	hide() {}
	remove() {}
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
export { Graph$1 as Graph, Node, NodeRegistry, NodeToolView, NodeToolsView };