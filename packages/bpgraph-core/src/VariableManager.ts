export type VariableDef =
  | { name: string; type: 'string'; value: string }
  | { name: string; type: 'number'; value: number }
  | { name: string; type: 'boolean'; value: boolean }
  | { name: string; type: 'array'; value: unknown[] }
  | { name: string; type: 'object'; value: Record<string, unknown> }
  | { name: string; type: 'any'; value: unknown }

export class VariableManager {
  private variables: Map<string, VariableDef> = new Map()

  setVariable(variable: VariableDef) {
    this.variables.set(variable.name, variable)
    return this
  }

  setVariableValue(name: string, value: VariableDef['value']) {
    const variable = this.variables.get(name)
    if (!variable) {
      throw new Error(`Variable "${name}" does not exist.`)
    }

    switch (variable.type) {
      case 'string':
        if (typeof value !== 'string') {
          throw new Error(`Variable "${name}" expects a string value.`)
        }
        break
      case 'number':
        if (typeof value !== 'number') {
          throw new Error(`Variable "${name}" expects a number value.`)
        }
        break
      case 'boolean':
        if (typeof value !== 'boolean') {
          throw new Error(`Variable "${name}" expects a boolean value.`)
        }
        break
      case 'array':
        if (!Array.isArray(value)) {
          throw new Error(`Variable "${name}" expects an array value.`)
        }
        break
      case 'object':
        if (typeof value !== 'object' || Array.isArray(value) || value === null) {
          throw new Error(`Variable "${name}" expects an object value.`)
        }
        break
      case 'any':
        // Accept any type
        break
      default:
        throw new Error(`Unknown variable type for "${name}".`)
    }

    this.variables.set(name, { ...variable, value } as VariableDef)
    return this
  }

  getVariable(name: string): VariableDef | undefined {
    return this.variables.get(name)
  }

  getVariableValue<T>(name: string): T | undefined {
    const variable = this.variables.get(name)
    if (!variable) return
    return variable.value as T
  }

  deleteVariable(name: string) {
    this.variables.delete(name)
    return this
  }

  getAllVariables(): VariableDef[] {
    return Array.from(this.variables.values())
  }

  clear() {
    this.variables.clear()
    return this
  }
}
