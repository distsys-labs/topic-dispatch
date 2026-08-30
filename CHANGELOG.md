# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [4.0.0](https://github.com/distsys-labs/topic-dispatch/compare/topic-dispatch-v3.0.0...topic-dispatch-v4.0.0) (2026-08-30)


### ⚠ BREAKING CHANGES

* '*' now matches exactly one topic segment and '#' now matches zero or more segments (catch-all) in compound dotted patterns, correcting a swapped-token bug. Any consumer relying on the previous (incorrect) behavior for a pattern like 'foo.*' or 'foo.#' will see different matches after upgrading.

### Features

* add support for once ([078ea36](https://github.com/distsys-labs/topic-dispatch/commit/078ea36cf7ae611051b26a05759b93a05bc4fcd4))
* adds callback for delivery verification ([fbf6570](https://github.com/distsys-labs/topic-dispatch/commit/fbf65706093c715cc6288ae6d6ec698f58e944c0))
* major release ([cb4661e](https://github.com/distsys-labs/topic-dispatch/commit/cb4661e879611ffec0137f792443c3e47a296aeb))
* return results from handlers via promises, return subscription object from 'on' call ([ac7d54a](https://github.com/distsys-labs/topic-dispatch/commit/ac7d54adc73d224881e15d3691674170b6bbde7c))
* rework api to align with event emitter ([6fcb4d5](https://github.com/distsys-labs/topic-dispatch/commit/6fcb4d5e2d7731cf024139a06db39fa2178ab49b))


### Bug Fixes

* correct error in removeAll ([d0af785](https://github.com/distsys-labs/topic-dispatch/commit/d0af7857e4ae7f8bcebbd8f6d8deb15175ad3613))
* correct issues with iteration over collection include one time bindings ([04ff5db](https://github.com/distsys-labs/topic-dispatch/commit/04ff5db1458f29f1f81cb6fe1aa9efcbb3f3d6eb))
* correct missing require in subscription module ([dfdbcc5](https://github.com/distsys-labs/topic-dispatch/commit/dfdbcc5d975b2cfa04510c0bb4a33f7af8d65d58))
* correct swapped wildcard tokens, once() return value, and an unhandled-rejection leak ([f8f4628](https://github.com/distsys-labs/topic-dispatch/commit/f8f4628e42981d1415564b0914b4b4ef7cf9a774))
* improve removeAll to eliminate all topic bindings when none is specified ([2686809](https://github.com/distsys-labs/topic-dispatch/commit/26868099f91d96630e58d304aa840e451142225f))
* prevent binding non-functions to events ([8c61a6f](https://github.com/distsys-labs/topic-dispatch/commit/8c61a6fe2e96faf3f6a872b5b84379edce46eab0))
* upgrade npm before publish so OIDC trusted publishing actually authenticates ([6d088e3](https://github.com/distsys-labs/topic-dispatch/commit/6d088e374d9d15dbe101527f904488066d7ebc18))

## [3.0.0] - 2026-02-05

### BREAKING CHANGES

- **ESM-only:** Package is now pure ESM. CommonJS `require()` is no longer supported. Use `import` instead.
- **Node.js 22+:** Minimum Node.js version is now 22.0.0
- **Module resolution:** Entry point changed from `src/index.js` to `dist/index.js` (compiled output)

### Added

- **TypeScript:** Complete TypeScript rewrite with full type definitions
- **Type exports:** Export `Dispatcher`, `Handler`, and `Subscription` types
- **Modern tooling:** Vitest for testing, TypeScript compiler for building
- **Zero dependencies:** Removed `fauxdash`, using native JavaScript implementations

### Changed

- **Build system:** Now uses TypeScript compiler instead of shipping raw source
- **Test framework:** Migrated from Mocha/Chai to Vitest
- **Code style:** Modernized to ES2022 with strict TypeScript
- **Package structure:** Ships `dist/` directory with compiled JS and type definitions
- **Keywords:** Added "typescript" and "esm" to package metadata
- **Repository URL:** Corrected to point to proper repository

### Removed

- **Dependencies:** Removed `fauxdash` runtime dependency
- **DevDependencies:** Removed `mocha`, `chai`, `chai-as-promised`, `nyc`, `standard`
- **CommonJS support:** No longer compatible with `require()`

### Migration

See [MIGRATION.md](./MIGRATION.md) for detailed migration instructions from v2.x to v3.0.

### Notes

- All functionality from v2.x is preserved
- API remains identical (only import syntax changes)
- All tests pass without behavioral changes
- 85% code coverage maintained

## [2.1.0](///compare/v2.0.0...v2.1.0) (2021-04-22)


### Features

* adds callback for delivery verification ([fbf6570](///commit/fbf65706093c715cc6288ae6d6ec698f58e944c0))

### [1.3.1](///compare/v1.3.0...v1.3.1) (2021-03-10)


### Bug Fixes

* correct missing require in subscription module ([dfdbcc5](///commit/dfdbcc5d975b2cfa04510c0bb4a33f7af8d65d58))

## [1.3.0](///compare/v1.2.0...v1.3.0) (2021-03-10)


### Features

* return results from handlers via promises, return subscription object from 'on' call ([ac7d54a](///commit/ac7d54adc73d224881e15d3691674170b6bbde7c))

## [1.2.0](///compare/v1.1.4...v1.2.0) (2021-01-27)


### Features

* rework api to align with event emitter ([6fcb4d5](///commit/6fcb4d5e2d7731cf024139a06db39fa2178ab49b))

### [1.1.4](///compare/v1.1.3...v1.1.4) (2021-01-24)


### Bug Fixes

* correct issues with iteration over collection include one time bindings ([04ff5db](///commit/04ff5db1458f29f1f81cb6fe1aa9efcbb3f3d6eb))

### [1.1.3](///compare/v1.1.2...v1.1.3) (2021-01-24)


### Bug Fixes

* prevent binding non-functions to events ([8c61a6f](///commit/8c61a6fe2e96faf3f6a872b5b84379edce46eab0))

### [1.1.2](///compare/v1.1.1...v1.1.2) (2021-01-22)


### Bug Fixes

* correct error in removeAll ([d0af785](///commit/d0af7857e4ae7f8bcebbd8f6d8deb15175ad3613))

### [1.1.1](///compare/v1.1.0...v1.1.1) (2021-01-22)


### Bug Fixes

* improve removeAll to eliminate all topic bindings when none is specified ([2686809](///commit/26868099f91d96630e58d304aa840e451142225f))

## [1.1.0](///compare/v1.0.0...v1.1.0) (2021-01-22)


### Features

* add support for once ([078ea36](///commit/078ea36cf7ae611051b26a05759b93a05bc4fcd4))
