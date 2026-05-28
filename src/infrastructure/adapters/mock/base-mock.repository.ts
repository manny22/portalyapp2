const SIMULATED_DELAY_MS = 200

export function simulateDelay(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, SIMULATED_DELAY_MS))
}

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}
