function initCharWidth(fontSize: number, fontFamily = 'system-ui, Avenir, Helvetica, Arial, sans-serif', charWidthCache: Record<string, number>) {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')!
  context.font = `${fontSize}px ${fontFamily}`

  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ '
  for (const char of chars) {
    charWidthCache[char] = context.measureText(char).width
  }
}

function getCharWidthCache(fontSize: number) {
  const fontSizeCache: Record<string, Record<string, number>> = {}
  if (!fontSizeCache[fontSize]) {
    fontSizeCache[fontSize] = {
      default: fontSize * 0.5,
    }
    initCharWidth(fontSize, 'system-ui, Avenir, Helvetica, Arial, sans-serif', fontSizeCache[fontSize])
  }
  return fontSizeCache[fontSize]
}

export function getTextWidth(text: string, fontSize: number) {
  let width = 0
  const charWidthCache = getCharWidthCache(fontSize)
  for (const char of text) {
    if (/[\u4e00-\u9fa5]/.test(char)) {
      width += fontSize
    } else {
      width += charWidthCache[char] ?? charWidthCache.default
    }
  }
  return width
}

export function css(strings: TemplateStringsArray, ...values: unknown[]) {
  const result = strings.reduce((acc, str, i) => acc + str + (values[i] ?? ''), '')
  return result.replace(/\s+/g, ' ').trim()
}