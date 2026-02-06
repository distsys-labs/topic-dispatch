export type Handler<T = any> = (data: T, topic: string) => any
export type ErrorHandler = (error: any) => void
export type ResultHandler<T = any> = (result: T) => void

export interface Subscription<T = any> {
  fn: Handler<T>
  onError?: ErrorHandler
  onResult?: ResultHandler
  off: () => void
  remove: () => void
  catch: (handler: ErrorHandler) => Subscription<T>
  then: (handler: ResultHandler) => Subscription<T>
  handle: (data: T, topic: string) => Promise<any> | undefined
}

interface Topics {
  [pattern: string]: {
    pattern: string
    test: (topic: string) => boolean
    calls: Subscription[]
  }
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

export default function subscribe<T = any>(
  topics: Topics,
  pattern: string,
  fn: Handler<T>
): Subscription<T> {
  const subscription: Subscription<T> = {
    fn,
    onError: undefined,
    onResult: undefined,
    off: () => remove(topics, pattern, fn),
    remove: () => remove(topics, pattern, fn),
    catch: (onErr: ErrorHandler) => {
      subscription.onError = onErr
      return subscription
    },
    then: (handler: ResultHandler) => {
      subscription.onResult = handler
      return subscription
    },
    handle: (data: T, topic: string): Promise<any> | undefined => {
      let result = fn(data, topic)
      if (result) {
        if (typeof result.then === 'function' && typeof result.catch === 'function') {
          result
            .then(subscription.onResult || ((x: any) => x))
            .catch(subscription.onError)
        } else {
          if (subscription.onResult) {
            subscription.onResult(result)
          }
          result = Promise.resolve(result)
        }
      }
      return result
    }
  }
  return subscription
}
