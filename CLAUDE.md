# topic-dispatch

A minimal AMQP-style pub/sub event dispatcher. Handlers are matched against topics using wildcard patterns. This is the event routing primitive used by `mfsm` and `rabbot`.

## Mental Model

Topics are dot-separated strings (`'order.created'`, `'user.profile.updated'`). Subscriptions use patterns with two wildcard types. `emit()` is async and returns a promise that resolves with all handler return values.

## Pattern Matching

| Pattern | Matches | Does NOT match |
|---|---|---|
| `'connected'` | `'connected'` | anything else |
| `'account.*'` | `'account.created'`, `'account.deleted'` | `'account.user.created'` |
| `'*.created'` | `'order.created'`, `'user.created'` | `'account.user.created'` |
| `'account.#'` | `'account.created'`, `'account.user.created'` | `'order.created'` |
| `'#.created'` | `'order.created'`, `'account.user.created'` | `'order.updated'` |
| `'*'` | any single-segment topic (`'order'`, not `'order.created'`) | — |
| `'#'` | everything, any depth | — |

> `*` matches exactly one segment; `#` matches zero or more segments (a true catch-all). `account.#` matches multiple segments; `account.*` matches exactly one.

## Quick Start

```typescript
import dispatcher from 'topic-dispatch'

const topics = dispatcher()

// Subscribe
const sub = topics.on('order.*', (event, topic) => {
  console.log(topic, event)
})

// One-time subscription
topics.once('ready', (event) => console.log('ready'))

// Emit — returns Promise<any[]> of all handler results
const results = await topics.emit('order.created', { id: 42 })

// Unsubscribe
sub.off()                              // this subscription only
topics.removeListener('order.*', fn)  // specific handler by reference
topics.removeAllListeners('order.*')  // all handlers for a pattern
topics.removeAllListeners()           // erase everything
```

## Key API

```typescript
dispatcher(): Dispatcher

interface Dispatcher {
  on(pattern: string, handler: Handler): Subscription
  once(pattern: string, handler: Handler): void
  emit(topic: string, event: any): Promise<any[]>
  removeListener(pattern: string, handler: Handler): void
  removeAllListeners(pattern?: string): void
  isQuiet(): boolean
}

interface Subscription {
  off(): void
  remove(): void  // alias for off()
  then(fn): Subscription
  catch(fn): Subscription
}
```

## Gotchas

- **ESM only** — `import`, not `require`. Requires `"type": "module"` in `package.json`.
- **Node 22+** required.
- Handler errors are caught and logged but do not stop other handlers from running.
- `emit()` always returns a promise — use `await` if you need handler results.
- Not optimized for high topic churn (many unique topic strings over time).

## Used By

- `mfsm` — FSM event emission uses this dispatcher
- `rabbot` — message routing and internal event dispatch
