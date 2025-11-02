import { dia, util } from '@joint/core'
import { getTextWidth, css } from '../Util'
import type { InputPort, OutputPort } from '../../../Node'
import type { NodeStyle } from '../../../NodeRegistry'

export interface BlueprintNodeAttributes extends dia.Element.Attributes {
  title?: string
  inputs?: readonly InputPort[]
  outputs?: readonly OutputPort[]
  style?: NodeStyle
  values?: Record<string, unknown>
}

export class BlueprintNode extends dia.Element<BlueprintNodeAttributes> {
  constructor(attributes: BlueprintNodeAttributes = {}, options = {}) {
    const style = (attributes.style || {}) as NodeStyle
    const nodeType = attributes.nodeType
    const markup: BlueprintNodeAttributes['markup'] = [
      { tagName: 'rect', groupSelector: 'base-node-body' },
      { tagName: 'g', groupSelector: 'base-node-title' },
    ]
    if (nodeType === 'switch') {
      markup.push({ tagName: 'g', groupSelector: 'switch-plus', children: [
        { tagName: 'rect', groupSelector: 'switch-plus-rect' },
        { tagName: 'path', groupSelector: 'switch-plus-icon' }
      ] })
    }
    const rowHeight = style.ports?.layout?.rowHeight ?? 20
    const rowSpacing = style.ports?.layout?.gap ?? 8
    const portStroke = style.ports?.output?.port?.stroke ?? 'rgba(255, 255, 255, 0.8)'
    super(util.defaultsDeep(attributes, {
      type: 'custom.BlueprintNode',
      size: { width: 300, height: 100 },
      inputs: [],
      outputs: [],
      attrs: {
        'base-node-body': {
          refWidth: '100%',
          refHeight: '100%',
          fill: style.background ?? 'rgba(41, 44, 47, 0.9)',
          stroke: style.background ?? 'rgba(41, 44, 47, 0.9)',
          strokeWidth: 1,
          rx: style.borderRadius ?? 8,
          ry: style.borderRadius ?? 8
        },
        'switch-plus': {
          cursor: 'pointer',
          refX: '100%',
          refY: '100%',
          transform: 'translate(-22, -' + (rowSpacing + rowHeight * 0.5) + ')',
        },
        'switch-plus-rect': {
          width: 12,
          height: 12,
          fill: 'transparent',
          stroke: 'transparent',
          strokeWidth: 1,
        },
        'switch-plus-icon': {
          d: 'M2 6 L10 6 M6 2 L6 10',
          stroke: portStroke,
          strokeWidth: 1.5,
          pointerEvents: 'none'
        }
      },
      markup: markup,
      ports: {
        groups: {
          in: {
            position: {
              name: 'absolute',
              args: {
                x: 6 + 10
              }
            },
            attrs: {
              portBody: {
                fill: style.ports?.input?.port?.fill ?? 'rgba(255, 255, 255, 0.5)',
                stroke: style.ports?.input?.port?.stroke ?? 'rgba(255, 255, 255, 0.8)',
                strokeWidth: style.ports?.input?.port?.strokeWidth ?? 1,
                r: 6,
                magnet: 'inout',
                cursor: "crosshair"
              },
              portLabel: {
                x: 12,
                y: '0.3em',
                textAnchor: 'start',
                fontSize: style.ports?.input?.label?.fontSize ?? 12,
                fill: style.ports?.input?.label?.color ?? '#fff'
              },
            },
          },
          out: {
            position: {
              name: 'absolute',
              args: {
                x: 'calc(w - 16)'
              }
            },
            attrs: {
              portBody: {
                fill: style.ports?.output?.port?.fill ?? 'rgba(255, 255, 255, 0.5)',
                stroke: style.ports?.output?.port?.stroke ?? 'rgba(255, 255, 255, 0.8)',
                strokeWidth: style.ports?.output?.port?.strokeWidth ?? 1,
                r: 6,
                magnet: "inout",
                cursor: "crosshair"
              },
              portLabel: {
                x: -12,
                y: '0.3em',
                textAnchor: 'end',
                fontSize: style.ports?.output?.label?.fontSize ?? 12,
                fill: style.ports?.output?.label?.color ?? '#fff'
              }
            }
          }
        }
      }
    }), options)
  }

  initialize(...args: Parameters<dia.Element['initialize']>) {
    super.initialize(...args)
    if (this.getPorts().length === 0) {
      this.buildPortItems()
    }
    this.on(
      "change:inputs change:outputs",
      (_el, _changed, opt) => this.buildPortItems(opt)
    )
  }

  title(value: string) {
    this.set('title', value)
    const titleWidth = value.length > 0 ? getTextWidth(value, this.get('style')?.header?.fontSize || 12) : 0
    const size = this.get('size')
    const width = size?.width || 0
    if (titleWidth + 35 > width) {
      this.resize(titleWidth + 35, size?.height || 100)
      return
    }
    this.updateSizeByContent()
  }
  
  setStyle(style: NodeStyle) {
    this.set('style', style)
  }

  setValues(values: Record<string, unknown>) {
    this.set('values', values)
  }

  buildPortItems(opt = {}) {
    const items = [] as dia.Element.Port[]
    const inputs = this.get('inputs') as InputPort[] || []
    const outputs = this.get('outputs') as OutputPort[] || []
    const style = this.get('style') || {}
    const HEADER_HEIGHT = style.header?.height ?? 24
    const portHeight = style.ports?.layout?.rowHeight ?? 20
    const portSpacing = style.ports?.layout?.gap ?? 8
    const portTop = style.ports?.layout?.top ?? 0

    for (const [index, input] of inputs.entries()) {
      if (input.type === 'spacer') {
        continue
      }

      items.push({
        ...this.buildPortItem(input, 'in'),
        id: input.id,
        group: 'in',
        args: {
          y: HEADER_HEIGHT +
            index * portHeight +
            (index + 1) * portSpacing +
            portHeight / 2 +
            portTop
        }
      })
    }
    for (const [index, output] of outputs.entries()) {
      if (output.type === 'spacer') {
        continue
      }
      items.push({
        ...this.buildPortItem(output, 'out'),
        id: output.id,
        group: 'out',
        args: {
          y: HEADER_HEIGHT +
            index * portHeight +
            (index + 1) * portSpacing +
            portHeight / 2 +
            portTop
        }
      })
    }
    this.startBatch('update-ports')
    this.prop(["ports", "items"], items, { ...opt, rewrite: true })
    this.stopBatch('update-ports')
    this.updateSizeByContent()
  }

  buildPortItem(port: InputPort | OutputPort, group: 'in' | 'out'): dia.Element.Port {
    const style = this.get('style') || {}
    const portHeight = style.ports?.layout?.rowHeight ?? 20
    const left = group === 'in'
    const portStyle = left ? style.ports?.input : style.ports?.output
    const fontSize = portStyle?.label?.fontSize ?? 12
    const color = portStyle?.label?.color ?? '#fff'

    const portLabelX = this.get('ports')?.groups?.in.attrs?.portLabel?.x as number || 12
    const portLabelWidth = left ? getTextWidth(port.label || '', fontSize) : 0

    let showPort = port.showPort !== false
    if (port.type === 'select' && port.showPort !== true) {
      showPort = false
    }
    const item = {
      height: portHeight,
      attrs: {
        portLabel: { text: port.label || '' },
        portForm: {
          x: portLabelX + portLabelWidth + 4,
          y: -portHeight / 2,
          width: style.ports?.input?.editor?.box?.width || 80,
          height: portHeight
        },
        portFormSvg: {
          transform: `translate(${portLabelX + portLabelWidth + 4}, ${-portHeight / 2})`
        },
        portFormWrap: {
          style: {
            textAlign: left ? 'left' : 'right',
            fontSize: fontSize + 'px',
            color: color
          }
        },
        field: {
          name: port.name
        }
      }
    } as dia.Element.Port

    const formWrap = left ? this.renderFormWrap(port) : ''

    item.markup = util.svg`
      ${showPort ? getPortIcon(port.type) : ''}
      <text @selector='portLabel' />
      ${
        formWrap ? formWrap : ''
      }
    `
    return item
  }

  renderFormWrap(input: InputPort) {
    const showInput = input.showInput !== false
    if (!showInput) return ''
    const style = this.get('style') || {}

    const values = this.get('values') || {}

    switch (input.type) {
      case 'string':
        return renderString(input, style, values)
      case 'number':
        return renderNumber(input, style, values)
      case 'select':
        return renderSelect(input, style, values)
      case 'boolean':
        return renderCheckbox(input, style, values)
      default:
        return ''
    }
  }

  updateSizeByContent() {
    const ports = this.getPorts()
    const style = this.get('style') || {}
    const title = this.get('title') || ''
    const nodeType = this.get('nodeType') || ''
    const headerFontSize = style.header?.fontSize ?? 12
    const inputPorts = ports.filter(port => port.group === 'in')
    const outputPorts = ports.filter(port => port.group === 'out')
    const portCount = inputPorts.length > outputPorts.length ? inputPorts.length : outputPorts.length

    const titleHeight = style.header?.height ?? 24
    const portHeight = style.ports?.layout?.rowHeight ?? 20
    const portGap = style.ports?.layout?.gap ?? 8

    const paddingTop = style.ports?.layout?.top ?? 0
    const paddingBottom = style.ports?.layout?.bottom ?? 20

    const editorBoxWidth = style.ports?.input?.editor?.box?.width || 0

    
    let portsHeight = portCount > 0 ? portCount * portHeight + (portCount + 1) * portGap : 0
    if (nodeType === 'switch') {
      portsHeight += portHeight * 0.3 + portGap
    }
    const titleWidth = title.length > 0 ? getTextWidth(title, headerFontSize) : 0
    const inputsWidth = inputPorts.length > 0 ? Math.max(...inputPorts.map(port => {
      const label = port.attrs?.portLabel?.text ?? ''
      const markup: dia.MarkupNodeJSON[] = port.markup as dia.MarkupNodeJSON[] || []
      const fontSize = style.ports?.input?.label?.fontSize || 12
      const isPortForm = markup.some(m => m.selector === 'portForm')
      const inputWidth = isPortForm ? (editorBoxWidth + 8) : 0
      const labelWidth = label.length > 0 ? getTextWidth(label, fontSize) : 0
      return labelWidth + 25 + inputWidth
    })) : 0
    const outputsWidth = outputPorts.length > 0 ? Math.max(...outputPorts.map(port => {
      const label = port.attrs?.portLabel?.text ?? ''
      const fontSize = style.ports?.output?.label?.fontSize || 12
      const labelWidth = label.length > 0 ? getTextWidth(label, fontSize) : 0
      return labelWidth + 25
    })) : 0

    const minWidth = 120
    const minHeight = 60

    const height = Math.max(
      minHeight,
      titleHeight + portsHeight + paddingTop + paddingBottom
    )
    const width = Math.max(
      minWidth,
      titleWidth + 35,
      inputsWidth + outputsWidth + 14
    )

    this.resize(width, height)
  }
}

function getPortIcon(type: string) {
  switch(type) {
    case 'exec':
      return `
      <path @selector='portBody' d="${squareArrowPath(12, 12)}" />
      <title>${type}</title>`
    default:
      return `<circle @selector="portBody" r="6" />
      <title>${type}</title>`
  }
}

function squareArrowPath(w: number, h: number) {
  const param = Math.max(w * 0.4, 0)
  const offsetX = w / 2
  const offsetY = h / 2
  return [
    `M${0 - offsetX},${0 - offsetY}`,
    `L${w - param - offsetX},${0 - offsetY}`,
    `L${w - offsetX},${h / 2 - offsetY}`,
    `L${w - param - offsetX},${h - offsetY}`,
    `L${0 - offsetX},${h - offsetY} Z`
  ].join(' ')
}

function renderString(input: InputPort, style: NodeStyle, values: Record<string, unknown>) {
  const boxStyle = style.ports?.input?.editor?.box
  const portHeight = style.ports?.layout?.rowHeight ?? 20
  const inputStyle = css`
    outline: none;
    padding-left: 4px;
    padding-right: 4px;
    box-sizing: border-box;
    width: 100%;
    height: 22px;
    line-height: 22px;
    border: none;
    background: ${boxStyle?.background ?? 'transparent'};
    color: ${boxStyle?.color ?? '#fff'};
    font-size: ${boxStyle?.fontSize ?? 12}px;
    border: 1px solid ${boxStyle?.borderColor ?? 'rgba(255, 255, 255, 0.2)'};
    border-radius: ${boxStyle?.borderRadius ?? 4}px;
  `
  return `
    <foreignObject @selector="portForm">
      <div @selector="portFormWrap"
        xmlns="http://www.w3.org/1999/xhtml"
        style="width:100%; height:100%;line-height: ${portHeight - 2}px;">
          <input @selector="field"
            xmlns="http://www.w3.org/1999/xhtml"
            type="text"
            style="${inputStyle}"
            value="${values[input.name] || ''}"
            />
      </div>
    </foreignObject>
  `
}

function renderNumber(input: InputPort, style: NodeStyle, values: Record<string, unknown>) {
  const boxStyle = style.ports?.input?.editor?.box
  const portHeight = style.ports?.layout?.rowHeight ?? 20
  const inputStyle = css`
    outline: none;
    padding-left: 4px;
    padding-right: 4px;
    box-sizing: border-box;
    width: 100%;
    height: 22px;
    line-height: 22px;
    border: none;
    background: ${boxStyle?.background ?? 'transparent'};
    color: ${boxStyle?.color ?? '#fff'};
    font-size: ${boxStyle?.fontSize ?? 12}px;
    border: 1px solid ${boxStyle?.borderColor ?? 'rgba(255, 255, 255, 0.2)'};
    border-radius: ${boxStyle?.borderRadius ?? 4}px;
  `
  const upArrowPath = "M2 8 L6 4 L10 8"
  const downArrowPath = "M2 3 L6 7 L10 3"
  return `
    <foreignObject @selector="portForm">
      <div @selector="portFormWrap"
        xmlns="http://www.w3.org/1999/xhtml"
        style="width:100%; height:100%;line-height: ${portHeight - 2}px;">
          <input @selector="field"
            xmlns="http://www.w3.org/1999/xhtml"
            type="text"
            style="${inputStyle}"
            value="${values[input.name] || ''}"
            />
        <svg width="12" height="20" style="position:absolute; right:2px; top:0;" viewBox="0 0 12 20">
          <rect width="12" height="11" y="0" fill="transparent" cursor="pointer" @selector="upArrow" />
          <rect width="12" height="11" y="11" fill="transparent" cursor="pointer" @selector="downArrow" />
          <path d="${upArrowPath}" stroke="currentColor" stroke-width="1.2" fill="transparent" pointer-events="none" />
          <path d="${downArrowPath}" stroke="currentColor" stroke-width="1.2" fill="transparent" pointer-events="none" transform="translate(0,11)" />
        </svg>
      </div>
    </foreignObject>
  `
}

function renderSelect(input: InputPort, style: NodeStyle, values: Record<string, unknown>) {
  const boxStyle = style.ports?.input?.editor?.box
  const portHeight = style.ports?.layout?.rowHeight ?? 20
  const inputStyle = css`
    outline: none;
    padding-left: 4px;
    padding-right: 16px;
    box-sizing: border-box;
    width: 100%;
    height: 22px;
    line-height: 22px;
    border: none;
    background: ${boxStyle?.background ?? 'transparent'};
    color: ${boxStyle?.color ?? '#fff'};
    font-size: ${boxStyle?.fontSize ?? 12}px;
    border: 1px solid ${boxStyle?.borderColor ?? 'rgba(255, 255, 255, 0.2)'};
    border-radius: ${boxStyle?.borderRadius ?? 4}px;
    cursor: pointer;
  `

  const value = values[input.name]
  const options = input._options || []
  const label = options.find(opt => opt.value === value)?.label || ''

  return `
    <foreignObject @selector="portForm">
      <div @selector="portFormWrap"
        xmlns="http://www.w3.org/1999/xhtml"
        style="width:100%; height:100%;line-height: ${portHeight - 2}px;">
          <input @selector="field"
            xmlns="http://www.w3.org/1999/xhtml"
            type="text"
            title="${label || ''}"
            style="${inputStyle}"
            value="${label || ''}"
            />
          <svg width="12" height="12" style="position:absolute; right:4px; top:6px; pointer-events:none;" viewBox="0 0 12 12">
            <path d="M2 4 L6 8 L10 4" stroke="currentColor" stroke-width="1.5" fill="transparent" />
          </svg>
      </div>
    </foreignObject>
    `
}

function renderCheckbox(input: InputPort, style: NodeStyle, values: Record<string, unknown>) {
  return `
    <g @selector="portFormSvg">
      <rect
        @selector="field"
        xmlns="http://www.w3.org/2000/svg"
        x="0" y="4"
        width="16" height="16"
        rx="${style.ports?.input?.editor?.box?.borderRadius ?? 3}"
        ry="${style.ports?.input?.editor?.box?.borderRadius ?? 3}"
        fill="${values[input.name] ? (style.ports?.input?.editor?.box?.background ?? '#ff6666') : 'transparent'}"
        stroke="${style.ports?.input?.editor?.box?.borderColor ?? 'rgba(255, 255, 255, 0.2)'}"
        stroke-width="1"
        cursor="pointer"
      />
      <polyline
        points="4,11 7,14 12,8"
        fill="none"
        cursor="pointer"
        stroke="${style.ports?.input?.editor?.box?.color ?? '#fff'}"
        stroke-width="1"
        visibility="${values[input.name] ? 'visible' : 'hidden'}"
      />
    </g>
  `
}

