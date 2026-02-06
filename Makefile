.PHONY: help install build test test-watch test-coverage lint lint-fix typecheck clean all check release pre-commit

# Default target
.DEFAULT_GOAL := help

# Variables
NPM := npm
NODE := node
TSC := npx tsc
VITEST := npx vitest
ESLINT := npx eslint
STANDARD_VERSION := npx standard-version

# Colors for output
CYAN := \033[0;36m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

## help: Show this help message
help:
	@echo "$(CYAN)Available targets:$(NC)"
	@echo ""
	@sed -n 's/^##//p' ${MAKEFILE_LIST} | column -t -s ':' | sed -e 's/^/ /'
	@echo ""

## install: Install dependencies
install:
	@echo "$(CYAN)Installing dependencies...$(NC)"
	$(NPM) install
	@echo "$(GREEN)✓ Dependencies installed$(NC)"

## build: Compile TypeScript to JavaScript
build:
	@echo "$(CYAN)Building project...$(NC)"
	@rm -rf dist
	$(TSC)
	@echo "$(GREEN)✓ Build complete (dist/)$(NC)"

## test: Run tests
test:
	@echo "$(CYAN)Running tests...$(NC)"
	$(VITEST) run
	@echo "$(GREEN)✓ Tests complete$(NC)"

## test-watch: Run tests in watch mode
test-watch:
	@echo "$(CYAN)Running tests in watch mode...$(NC)"
	$(VITEST)

## test-coverage: Run tests with coverage report
test-coverage:
	@echo "$(CYAN)Running tests with coverage...$(NC)"
	$(VITEST) run --coverage
	@echo "$(GREEN)✓ Coverage report generated$(NC)"

## lint: Check code style with ESLint
lint:
	@echo "$(CYAN)Linting code...$(NC)"
	$(ESLINT) src spec --ext .ts
	@echo "$(GREEN)✓ Lint check complete$(NC)"

## lint-fix: Fix code style issues automatically
lint-fix:
	@echo "$(CYAN)Fixing code style issues...$(NC)"
	$(ESLINT) src spec --ext .ts --fix
	@echo "$(GREEN)✓ Code style fixed$(NC)"

## typecheck: Run TypeScript type checking without emitting files
typecheck:
	@echo "$(CYAN)Type checking...$(NC)"
	$(TSC) --noEmit
	@echo "$(GREEN)✓ Type check complete$(NC)"

## clean: Remove generated files
clean:
	@echo "$(CYAN)Cleaning generated files...$(NC)"
	@rm -rf dist coverage .nyc_output *.tsbuildinfo
	@echo "$(GREEN)✓ Clean complete$(NC)"

## all: Run all checks (lint, typecheck, build, test)
all: lint typecheck build test
	@echo "$(GREEN)✓ All checks passed$(NC)"

## check: Alias for 'all' - run all checks
check: all

## pre-commit: Run checks before committing (lint-fix, typecheck, test)
pre-commit: lint-fix typecheck test
	@echo "$(GREEN)✓ Pre-commit checks passed$(NC)"

## release: Create a new release with standard-version
release:
	@echo "$(CYAN)Creating release...$(NC)"
	@echo "$(YELLOW)Running pre-release checks...$(NC)"
	@$(MAKE) clean
	@$(MAKE) all
	@echo "$(GREEN)✓ All checks passed$(NC)"
	@echo "$(CYAN)Running standard-version...$(NC)"
	$(STANDARD_VERSION)
	@echo "$(GREEN)✓ Release created$(NC)"
	@echo ""
	@echo "$(YELLOW)Next steps:$(NC)"
	@echo "  1. Review the CHANGELOG.md"
	@echo "  2. Push commits and tags: git push --follow-tags origin main"
	@echo "  3. Publish to npm: npm publish"

## release-minor: Create a minor release (e.g., 1.2.0 -> 1.3.0)
release-minor:
	@echo "$(CYAN)Creating minor release...$(NC)"
	@$(MAKE) clean
	@$(MAKE) all
	$(STANDARD_VERSION) --release-as minor
	@echo "$(GREEN)✓ Minor release created$(NC)"

## release-major: Create a major release (e.g., 1.2.0 -> 2.0.0)
release-major:
	@echo "$(CYAN)Creating major release...$(NC)"
	@$(MAKE) clean
	@$(MAKE) all
	$(STANDARD_VERSION) --release-as major
	@echo "$(GREEN)✓ Major release created$(NC)"

## release-patch: Create a patch release (e.g., 1.2.0 -> 1.2.1)
release-patch:
	@echo "$(CYAN)Creating patch release...$(NC)"
	@$(MAKE) clean
	@$(MAKE) all
	$(STANDARD_VERSION) --release-as patch
	@echo "$(GREEN)✓ Patch release created$(NC)"

## publish: Publish to npm (runs prepublishOnly script automatically)
publish:
	@echo "$(CYAN)Publishing to npm...$(NC)"
	@echo "$(YELLOW)This will run prepublishOnly (build + test)$(NC)"
	$(NPM) publish
	@echo "$(GREEN)✓ Published to npm$(NC)"

## dev: Set up development environment
dev: install
	@echo "$(GREEN)✓ Development environment ready$(NC)"
	@echo ""
	@echo "$(CYAN)Useful commands:$(NC)"
	@echo "  make test-watch    - Run tests in watch mode"
	@echo "  make typecheck     - Check types"
	@echo "  make lint-fix      - Fix linting issues"
	@echo "  make build         - Build the project"
