export interface Matcher {
  topic: string
  regex: RegExp
  test: (input: string) => boolean
}

function memoize<T extends any[], R>(fn: (...args: T) => R): (...args: T) => R {
  const cache = new Map<string, R>()
  return (...args: T): R => {
    const key = JSON.stringify(args)
    if (cache.has(key)) {
      return cache.get(key)!
    }
    const result = fn(...args)
    cache.set(key, result)
    return result
  }
}

function createMatcher(pattern: string): Matcher {
  const parts = pattern.split('.')
  const limit = parts.length - 1
  const segments: string[] = []

  parts.forEach((part, i) => {
    if (i === 0) {
      segments.push('^')
    }
    switch (part) {
      // AMQP topic-exchange convention: '*' matches exactly one segment,
      // '#' matches zero or more segments (catch-all).
      case '#':
        segments.push('.+')
        break
      case '*':
        if (i > 0) {
          segments.push('[.]')
        }
        segments.push('[^.]+')
        break
      default:
        if (i > 0) {
          if (parts[i - 1] === '#') {
            segments.push('[.]?')
          } else {
            segments.push('[.]')
          }
        }
        segments.push(part)
        break
    }
    if (i === limit) {
      segments.push('$')
    }
  })

  const rgx = new RegExp(segments.join(''))
  return {
    topic: pattern,
    regex: rgx,
    test: rgx.test.bind(rgx)
  }
}

export const create = memoize(createMatcher)
