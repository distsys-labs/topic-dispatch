import { describe, it, expect } from 'vitest'
import Dispatcher from '../src/index.js'

describe('Dispatch', function() {
  it('should dispatch to all matching', function() {
    const dispatcher = Dispatcher()
    const dispatched: number[] = []
    dispatcher.on('*', () => { dispatched.push(1) })
    dispatcher.on('*', () => { dispatched.push(2) })
    dispatcher.on('*', () => { dispatched.push(3) })
    dispatcher.on('*', () => { dispatched.push(4) })

    dispatcher.emit('one', {})

    expect(dispatched).toEqual([1, 2, 3, 4])
  })

  it('should ignore exceptions in matching', function() {
    const dispatcher = Dispatcher()
    const dispatched: string[] = []
    dispatcher.on('*', (ev: any, t: string) => { dispatched.push(ev.title) })
    dispatcher.on('*', (ev: any, t: string) => { throw new Error('uh oh') })
    dispatcher.on('*', (ev: any, t: string) => { dispatched.push(ev.title + ' two') })

    dispatcher.emit('one', {title: 'test'})

    expect(dispatched).toEqual(['test', 'test two'])
  })

  it('should only dispatch a single time on once', function () {
    const dispatcher = Dispatcher()
    let dispatched = 0
    dispatcher.once('*', (ev: any, t: string) => { dispatched++ })
    dispatcher.emit('one', {})
    dispatcher.emit('two', {})
    dispatcher.emit('three', {})
    expect(dispatched).toBe(1)
  })

  it('should not remove one time subscribers until after dispatch', function () {
    const dispatcher = Dispatcher()
    let dispatched = 0
    dispatcher.once('*', (ev: any, t: string) => { dispatched += 1 })
    dispatcher.once('*', (ev: any, t: string) => { dispatched += 2 })
    dispatcher.once('*', (ev: any, t: string) => { dispatched += 3 })
    dispatcher.once('*', (ev: any, t: string) => { dispatched += 4 })
    dispatcher.once('*', (ev: any, t: string) => { dispatched += 5 })
    dispatcher.once('*', (ev: any, t: string) => { dispatched += 6 })
    dispatcher.emit('one', {})
    expect(dispatched).toBe(21)
    expect(dispatcher.isQuiet()).toBe(true)
  })

  it('should dispatch to each single subscribe at the same time', function () {
    const dispatcher = Dispatcher()
    let dispatched = 0
    let other = 0
    dispatcher.once('*', (ev: any, t: string) => { dispatched++ })
    dispatcher.once('#', (ev: any, t: string) => { dispatched++ })
    dispatcher.on('one', (ev: any, t: string) => { other = other + 3 })
    dispatcher.emit('one', {})
    dispatcher.emit('one', {})
    expect(dispatched).toBe(2)
    expect(other).toBe(6)
  })

  it('should not allow invalid callbacks', function () {
    const dispatcher = Dispatcher()
    expect(() => { dispatcher.on('#', undefined as any) })
      .toThrow(/Cannot attach/)

    expect(() => { dispatcher.on('#', null as any) })
      .toThrow(/Cannot attach/)

    expect(() => { dispatcher.on('#', '' as any) })
      .toThrow(/Cannot attach/)

    expect(() => { dispatcher.on('#', {} as any) })
      .toThrow(/Cannot attach/)

    expect(() => { dispatcher.on('#', true as any) })
      .toThrow(/Cannot attach/)
  })

  it('should remove all topics when none are specified', function () {
    const dispatcher = Dispatcher()
    let dispatched = 0
    dispatcher.on('*', () => { dispatched++ })
    dispatcher.on('#', () => { dispatched++ })
    dispatcher.on('one', () => { dispatched++ })
    dispatcher.removeAllListeners()
    dispatcher.emit('one', {})
    expect(dispatched).toBe(0)
    expect(dispatcher.isQuiet()).toBe(true)
  })

  it('should correctly unsubscribe from subscription "off" call', function () {
    const dispatcher = Dispatcher()
    const subscription = dispatcher.on('*', () => {})
    subscription.off()
    expect(dispatcher.isQuiet()).toBe(true)
  })

  it('should return all synchronous responses via promise', async function () {
    const dispatcher = Dispatcher()
    dispatcher.on('*', () => 10)
    dispatcher.on('*', () => 5)
    dispatcher.on('*', () => 15)
    const result = dispatcher.emit('ohhi', {})
    const list = await result
    expect(list.reduce((a, b) => a + b, 0)).toBe(30)
  })

  it('should return all asynchronous responses via promise', async function () {
    const dispatcher = Dispatcher()
    dispatcher.on('*', () => new Promise((res) => {
      setTimeout(() => res(10), 20)
    }))
    dispatcher.on('*', () => new Promise((res) => {
      setTimeout(() => res(8), 40)
    }))
    dispatcher.on('*', () => new Promise((res) => {
      setTimeout(() => res(12), 10)
    }))
    const result = await dispatcher.emit('ohhi', {})
    expect(result).toEqual([10, 8, 12])
  })

  it('should aggregate synchronous and asynchronous responses via promise', async function () {
    const dispatcher = Dispatcher()
    dispatcher.on('*', () => new Promise((res) => {
      setTimeout(() => res('a'), 30)
    }))
    dispatcher.on('*', () => 'b')
    dispatcher.on('*', () => new Promise((res) => {
      setTimeout(() => res('c'), 10)
    }))
    dispatcher.on('*', () => 'd')
    const result = dispatcher.emit('ohhi', {})
    const list = await result
    expect(list.reduce((a, b) => a + b, '')).toBe('abcd')
  })

  it('should direct responses to original subscription reply handlers', async function () {
    const dispatcher = Dispatcher()
    const results: string[] = []
    const sub1 = dispatcher.on('*', () => new Promise((res) => {
      setTimeout(() => res('a'), 30)
    }))
    sub1.then(x => { results.push(x) })
    await dispatcher.emit('test', '')
    expect(results).toEqual(['a'])
  })

  describe('AMQP-style wildcard semantics', function () {
    it('should match "*" against exactly one segment, not zero or many', function () {
      const dispatcher = Dispatcher()
      let dispatched = 0
      dispatcher.on('account.*', () => { dispatched++ })
      dispatcher.emit('account.created', {})
      expect(dispatched).toBe(1)
      dispatcher.emit('account.user.created', {})
      expect(dispatched).toBe(1)
      dispatcher.emit('account', {})
      expect(dispatched).toBe(1)
    })

    it('should match "#" against zero or more segments (catch-all)', function () {
      const dispatcher = Dispatcher()
      let dispatched = 0
      dispatcher.on('account.#', () => { dispatched++ })
      dispatcher.emit('account.created', {})
      expect(dispatched).toBe(1)
      dispatcher.emit('account.user.created', {})
      expect(dispatched).toBe(2)
    })

    it('should treat a bare "*" as matching any single-segment topic', function () {
      const dispatcher = Dispatcher()
      let dispatched = 0
      dispatcher.on('*', () => { dispatched++ })
      dispatcher.emit('one', {})
      expect(dispatched).toBe(1)
      dispatcher.emit('one.two', {})
      expect(dispatched).toBe(1)
    })

    it('should treat a bare "#" as matching any topic, any depth', function () {
      const dispatcher = Dispatcher()
      let dispatched = 0
      dispatcher.on('#', () => { dispatched++ })
      dispatcher.emit('one', {})
      dispatcher.emit('one.two.three', {})
      expect(dispatched).toBe(2)
    })
  })

  describe('once() return value', function () {
    it('should return a cancelable Subscription, not undefined', function () {
      const dispatcher = Dispatcher()
      let dispatched = 0
      const subscription = dispatcher.once('one', () => { dispatched++ })
      expect(subscription).toBeDefined()
      expect(typeof subscription.off).toBe('function')
      subscription.off()
      dispatcher.emit('one', {})
      expect(dispatched).toBe(0)
      expect(dispatcher.isQuiet()).toBe(true)
    })
  })

  describe('unhandled rejection safety', function () {
    it('should not leak an unobserved rejection when a subscription with no .catch() has a handler that rejects', async function () {
      const dispatcher = Dispatcher()
      const unhandled: unknown[] = []
      const onUnhandledRejection = (reason: unknown) => { unhandled.push(reason) }
      process.on('unhandledRejection', onUnhandledRejection)
      try {
        dispatcher.on('one', () => Promise.reject(new Error('boom')))
        await expect(dispatcher.emit('one', {})).rejects.toThrow('boom')
        // give any stray unhandled rejection a chance to surface
        await new Promise((resolve) => setTimeout(resolve, 10))
        expect(unhandled).toEqual([])
      } finally {
        process.off('unhandledRejection', onUnhandledRejection)
      }
    })
  })
})
