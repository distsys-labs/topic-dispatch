# Migration Guide: v2.x to v3.0

## Overview

Version 3.0 is a complete modernization of topic-dispatch, bringing it up to 2026 standards with TypeScript, ESM, and modern tooling.

## Breaking Changes

### 1. ESM-Only (No CommonJS)

**Before (v2.x):**
```javascript
const dispatcher = require('topic-dispatch')
```

**After (v3.0):**
```javascript
import dispatcher from 'topic-dispatch'
```

### 2. Node.js Version Requirement

- **Minimum:** Node.js 22+
- **Previous:** Node.js 8+

### 3. Package Structure

- **Source files:** Now TypeScript (`.ts`) instead of JavaScript (`.js`)
- **Entry point:** `dist/index.js` (compiled) instead of `src/index.js`
- **Type definitions:** Included automatically

## What's New

### TypeScript Support

Full TypeScript support with complete type definitions:

```typescript
import dispatcher, { Dispatcher, Handler, Subscription } from 'topic-dispatch'

const topics: Dispatcher = dispatcher()

const handler: Handler<{ id: number }> = (event, topic) => {
  console.log(event.id)
}

const subscription: Subscription = topics.on('user.*', handler)
```

### Zero Dependencies

- Removed `fauxdash` dependency
- All utilities implemented with native JavaScript
- Smaller package size

### Modern Tooling

- **Build:** TypeScript compiler
- **Tests:** Vitest (instead of Mocha/Chai)
- **Target:** ES2022

## Migration Steps

### 1. Update Your Project

Ensure your project is ESM-compatible:

```json
{
  "type": "module"
}
```

### 2. Update Imports

Replace all `require()` calls with `import`:

```javascript
// Old
const dispatcher = require('topic-dispatch')

// New
import dispatcher from 'topic-dispatch'
```

### 3. Update Node.js

Ensure you're running Node.js 22 or later:

```bash
node --version  # Should be >= 22.0.0
```

### 4. Install v3.0

```bash
npm install topic-dispatch@3
```

## API Compatibility

The API remains functionally identical to v2.x:

- ✅ `dispatcher()` - Factory function
- ✅ `.on(pattern, handler)` - Subscribe to events
- ✅ `.once(pattern, handler)` - Subscribe once
- ✅ `.emit(topic, data)` - Emit events
- ✅ `.removeListener(pattern, handler)` - Unsubscribe
- ✅ `.removeAllListeners(pattern?)` - Remove all handlers
- ✅ `.isQuiet()` - Check if no handlers exist
- ✅ Subscription objects with `.off()`, `.then()`, `.catch()`
- ✅ AMQP-style pattern matching (`*`, `#`)
- ✅ Promise-based emit with aggregated results

## Behavior Changes

### None!

The runtime behavior is identical to v2.x. All existing tests pass without modification (except for the testing framework syntax).

## Development Changes

If you're contributing to topic-dispatch:

### Build

```bash
npm run build
```

Compiles TypeScript to JavaScript in `dist/`

### Test

```bash
npm test              # Run tests
npm run test:watch    # Watch mode
npm run test:coverage # With coverage
```

### Type Checking

```bash
npx tsc --noEmit
```

## Troubleshooting

### "Cannot use import statement outside a module"

Add `"type": "module"` to your `package.json`

### "Cannot find module"

Ensure you're importing from `'topic-dispatch'` not `'topic-dispatch/src/index'`

### Type errors

Ensure you have `@types/node` installed if using TypeScript:

```bash
npm install --save-dev @types/node
```

## Benefits of Upgrading

1. **Type Safety:** Full TypeScript support with autocomplete
2. **Smaller Bundle:** No external dependencies
3. **Modern Standards:** ESM, ES2022 features
4. **Better Performance:** Native JavaScript utilities
5. **Future-Proof:** Aligned with current ecosystem standards

## Staying on v2.x

If you can't upgrade to Node.js 22 or ESM:

```bash
npm install topic-dispatch@2
```

Version 2.x will continue to work but won't receive new features.
