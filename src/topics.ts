import * as matcher from './matcher.js'
import subscribe, { Handler, Subscription } from './subscription.js'

export interface Topic {
  pattern: string
  test: (topic: string) => boolean
  calls: Subscription[]
}

export interface Topics {
  [pattern: string]: Topic
}

export interface TopicsAPI {
  add: (pattern: string, fn: Handler) => Subscription
  emit: (topicName: string, event: any, notify?: (hasHandlers: boolean) => void) => Promise<any[]>
  isQuiet: () => boolean
  remove: (pattern: string, fn: Handler) => void
  removeAll: (pattern?: string) => void
}

function add(topics: Topics, pattern: string, fn: Handler): Subscription {
  if (typeof fn !== 'function') {
    throw new Error(`Cannot attach ${typeof fn} to '${pattern}' as a handler`)
  }
  const subscription = subscribe(topics, pattern, fn)
  const topic = getTopic(topics, pattern)
  topic.calls.push(subscription)
  return subscription
}

function createTopic(topics: Topics, pattern: string): Topic {
  const match = matcher.create(pattern)
  const topic: Topic = {
    pattern,
    test: match.test,
    calls: []
  }
  topics[pattern] = topic
  return topic
}

function emit(
  topics: Topics,
  topicName: string,
  event: any,
  notify?: (hasHandlers: boolean) => void
): Promise<any[]> {
  const results: Promise<any>[] = []
  let handlers = 0

  Object.entries(topics).forEach(([, v]) => {
    if (v.test(topicName)) {
      const filtered = v.calls.filter(Boolean).slice(0)
      handlers += filtered.length
      filtered.forEach(c => {
        try {
          const result = c.handle(event, topicName)
          if (result) {
            if (typeof result.then === 'function' && typeof result.catch === 'function') {
              results.push(result)
            } else {
              results.push(Promise.resolve(result))
            }
          }
        } catch (e) {
          console.error(`exception caught emiting event to topic '${topicName}':\n  ${(e as Error).stack}`)
        }
      })
    }
  })

  if (notify) {
    notify(handlers > 0)
  }
  return Promise.all(results)
}

function getTopic(topics: Topics, pattern: string): Topic {
  const topic = topics[pattern]
  return topic || createTopic(topics, pattern)
}

function isQuiet(topics: Topics): boolean {
  let total = 0
  Object.entries(topics).forEach(([, v]) => {
    total += v.calls.length
  })
  return total === 0
}

function remove(topics: Topics, pattern: string, fn: Handler): void {
  const topic = topics[pattern]
  if (topic) {
    const indx = topic.calls.findIndex(s => s.fn === fn)
    if (indx !== -1) {
      topic.calls.splice(indx, 1)
    }
  }
}

function removeAll(topics: Topics, pattern?: string): void {
  if (pattern !== undefined) {
    delete topics[pattern]
  } else {
    Object.keys(topics).forEach(k => {
      delete topics[k]
    })
  }
}

export default function createTopics(): TopicsAPI {
  const topics: Topics = {}
  return {
    add: (pattern: string, fn: Handler) => add(topics, pattern, fn),
    emit: (topicName: string, event: any, notify?: (hasHandlers: boolean) => void) =>
      emit(topics, topicName, event, notify),
    isQuiet: () => isQuiet(topics),
    remove: (pattern: string, fn: Handler) => remove(topics, pattern, fn),
    removeAll: (pattern?: string) => removeAll(topics, pattern)
  }
}
