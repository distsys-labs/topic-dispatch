## Topic Dispatch

A way to bind function(s) to a topic using AMQP style matching rules. Not optimized for situations with a lot of "topic churn".

It is probably not for you. Check out Jim Cowart's [`monologue`](https://github.com/ifandelse/monologue) or [`postal`](https://github.com/ifandelse/postal) instead.

## Version 3.0 - Breaking Changes

- **ESM-only**: CommonJS is no longer supported. Use `import` instead of `require()`
- **Node.js 22+**: Minimum required Node.js version is 22
- **TypeScript**: Full TypeScript support with type definitions included
- **Zero dependencies**: No external runtime dependencies

## Installation

```bash
npm install topic-dispatch
```

**Requirements:**
- Node.js >= 22
- ESM project (set `"type": "module"` in your package.json)

## API

### JavaScript

```js
import dispatcher from 'topic-dispatch'

const topics = dispatcher()

topics.on('*', (event, topic) => {}) // catch any single-segment topic
topics.on('#', (event, topic) => {}) // catch all, any depth
topics.on('connected', (event, topic) => {}) // catch 'connected'
topics.on('account.*', (event, topic) => {}) // catch 'account.created', not 'account.user.created'
topics.on('*.created', (event, topic) => {}) // catch '<anything>.created', one segment before it
topics.on('account.#', (event, topic) => {}) // catch anything starting with 'account.', any depth
topics.on('#.created', (event, topic) => {}) // catch anything ending in '.created', any depth before it
topics.once('ready', (event, topic) => {}) // removes itself after one event is received

const handler = () => {}
topics.on('added', handler)
topics.removeListener('added', handler) // removes specific handler from a topic

topics.on('added', () => {})
topics.on('added', () => {})
topics.on('added', () => {})
topics.removeAllListeners('added') // removes all handlers from topic

topics.emit('account.created', {}) // will call all matching handlers

topics.removeAllListeners() // erase all bindings
```

### TypeScript

```ts
import dispatcher, { Dispatcher, Handler, Subscription } from 'topic-dispatch'

const topics: Dispatcher = dispatcher()

// Typed handler
const handler: Handler<{ id: number; name: string }> = (event, topic) => {
  console.log(`Event on ${topic}:`, event.id, event.name)
}

const subscription: Subscription = topics.on('user.created', handler)

// Subscription with promise-like API
subscription
  .then(result => console.log('Handler result:', result))
  .catch(error => console.error('Handler error:', error))

// Emit with type safety
await topics.emit('user.created', { id: 1, name: 'Alice' })

// Unsubscribe
subscription.off()
```

## Pattern Matching

The library supports AMQP-style topic matching:

- `*` - matches exactly one segment (e.g., `account.*` matches `account.created` but not `account.user.created`)
- `#` - matches zero or more segments, a catch-all (e.g., `account.#` matches both `account.created` and `account.user.created`)
- Exact match - `account.created` only matches `account.created`

## Promise-based Emit

The `emit()` method returns a Promise that resolves with an array of all handler results:

```js
const topics = dispatcher()

topics.on('calculate', () => 10)
topics.on('calculate', () => 20)
topics.on('calculate', () => Promise.resolve(30))

const results = await topics.emit('calculate', {})
console.log(results) // [10, 20, 30]
```

## Error Handling

Exceptions in handlers are caught and logged, preventing one handler from breaking others:

```js
topics.on('event', () => { throw new Error('oops') })
topics.on('event', () => { console.log('still runs!') })

topics.emit('event', {}) // logs error, but second handler still executes
```

## API Reference

### `dispatcher(): Dispatcher`

Creates a new dispatcher instance.

### `Dispatcher`

#### `on(pattern: string, handler: Handler): Subscription`

Subscribe to events matching the pattern. Returns a subscription object.

#### `once(pattern: string, handler: Handler): void`

Subscribe to events matching the pattern, automatically unsubscribing after the first event.

#### `emit(topic: string, event: any): Promise<any[]>`

Emit an event to all matching handlers. Returns a promise that resolves with all handler results.

#### `removeListener(pattern: string, handler: Handler): void`

Remove a specific handler from a pattern.

#### `removeAllListeners(pattern?: string): void`

Remove all handlers from a pattern, or all handlers from all patterns if no pattern is specified.

#### `isQuiet(): boolean`

Returns `true` if there are no active subscriptions.

### `Subscription`

#### `off(): void`

Unsubscribe the handler.

#### `remove(): void`

Alias for `off()`.

#### `then(handler: (result: any) => void): Subscription`

Add a handler for the result of the subscription handler.

#### `catch(handler: (error: any) => void): Subscription`

Add an error handler for the subscription handler.

## Development

This project includes a Makefile for common development tasks:

```bash
# Install dependencies
make install

# Run all checks (lint, typecheck, build, test)
make all

# Individual tasks
make lint          # Check code style
make lint-fix      # Fix code style issues
make typecheck     # Run TypeScript type checking
make build         # Compile TypeScript to JavaScript
make test          # Run tests
make test-watch    # Run tests in watch mode
make test-coverage # Run tests with coverage report

# Release management
make release       # Create a new release with standard-version
make release-minor # Create a minor release (1.2.0 -> 1.3.0)
make release-major # Create a major release (1.2.0 -> 2.0.0)
make release-patch # Create a patch release (1.2.0 -> 1.2.1)

# Other
make clean         # Remove generated files
make pre-commit    # Run checks before committing
make help          # Show all available targets
```

### Quick Start for Contributors

```bash
# Set up development environment
make dev

# Make changes, then run checks
make all

# Create a release
make release
```

## License

MIT
