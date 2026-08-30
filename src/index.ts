import createTopics from './topics.js'
import { Handler, Subscription } from './subscription.js'

export interface Dispatcher {
  emit: (topicName: string, event: any, notify?: (hasHandlers: boolean) => void) => Promise<any[]>
  isQuiet: () => boolean
  on: (pattern: string, fn: Handler) => Subscription
  once: (pattern: string, fn: Handler) => Subscription
  removeListener: (pattern: string, fn: Handler) => void
  removeAllListeners: (pattern?: string) => void
}

function on(topics: ReturnType<typeof createTopics>, pattern: string, fn: Handler): Subscription {
  if (typeof fn !== 'function') {
    throw new Error(`Cannot attach ${typeof fn} to '${pattern}' as a handler`)
  }
  return topics.add(pattern, fn)
}

function once(topics: ReturnType<typeof createTopics>, pattern: string, fn: Handler): Subscription {
  if (typeof fn !== 'function') {
    throw new Error(`Cannot attach ${typeof fn} to '${pattern}' as a handler`)
  }
  let subscription: Subscription
  function callOnce(t: any, e: string): any {
    subscription.off()
    return fn(t, e)
  }
  subscription = topics.add(pattern, callOnce)
  return subscription
}

function removeListener(topics: ReturnType<typeof createTopics>, pattern: string, fn: Handler): void {
  topics.remove(pattern, fn)
}

function removeAllListeners(topics: ReturnType<typeof createTopics>, pattern?: string): void {
  topics.removeAll(pattern)
}

export default function dispatcher(): Dispatcher {
  const topics = createTopics()
  return {
    emit: topics.emit,
    isQuiet: topics.isQuiet,
    on: (pattern: string, fn: Handler) => on(topics, pattern, fn),
    once: (pattern: string, fn: Handler) => once(topics, pattern, fn),
    removeListener: (pattern: string, fn: Handler) => removeListener(topics, pattern, fn),
    removeAllListeners: (pattern?: string) => removeAllListeners(topics, pattern)
  }
}

export { Handler, Subscription } from './subscription.js'
