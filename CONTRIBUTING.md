# Contributing

OpenSawer is currently documentation-first. Please open an issue before implementing a large feature.

## Principles

- Keep the product focused on self-hosted donations.
- Prefer SvelteKit, Svelte 5, Bun, and native browser features already in the stack.
- Reuse an existing shadcn-svelte primitive before adding another UI dependency.
- Do not add a dependency or abstraction for a hypothetical future need.
- Preserve donor privacy and verify all financial state server-side.
- Keep public UI accessible and mobile-first.

## Pull requests

1. Keep the change scoped.
2. Update relevant documentation.
3. Add the smallest test that catches regressions in non-trivial logic.
4. Run formatting, type checks, and tests once the Bun + SvelteKit application exists.
5. Explain user impact and verification in the pull request.

By contributing, you agree that your contribution is licensed under the MIT License.
