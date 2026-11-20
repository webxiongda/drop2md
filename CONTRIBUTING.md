# Contributing to Drop2MD

Thanks for your interest in improving Drop2MD. This project is intentionally small: a static, browser-only Markdown converter with no backend and no runtime dependencies beyond React. Focused, well-scoped changes are the easiest to review and the most likely to land.

By participating, you agree to be respectful and constructive toward other contributors — keep discussions civil and assume good intent.

## Getting set up locally

You need Node.js 18+ and npm. From the project root:

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. For a production build check:

```bash
npm run build
npm run preview
```

There is no database, no environment file, and no API key to configure. All state lives in the browser's localStorage, so a hard refresh is usually enough to reset while developing.

## Project layout

- `src/converter.ts` — file-to-Markdown conversion, format dispatchers, binary detection.
- `src/markdown.ts` — the dependency-free Markdown renderer and XSS-safe link handling.
- `src/store.tsx` — shared state for the queue, history, and settings, persisted to localStorage.
- `src/samples.ts` — built-in example files for the Examples page.
- `src/types.ts` — the page registry that drives hash routing and navigation.
- `src/pages/` — one component per route (ten pages).

## Submitting a pull request

1. Fork the repository and create a topic branch from `main`.
2. Make your change in a focused PR — one concern per pull request.
3. Make sure `npm run build` completes with no TypeScript errors.
4. Describe what changed and why, and link any related issue.
5. Open the PR against `webxiongda/drop2md`. Please do not bump the version number; releases are handled by maintainers.

## Code style

- **TypeScript strict mode is on.** `tsconfig.json` enables `strict`, `noUnusedLocals`, `noUnusedParameters`, and `noFallthroughCasesInSwitch`. Code must compile with `tsc` reporting zero errors.
- **Business comments are written in Chinese.** Inline comments that explain domain logic and intent follow the existing convention in `src/` (for example, the explanatory comments in `converter.ts` and `markdown.ts`). Keep identifiers and API names in English.
- Match the surrounding formatting: two-space indentation, single quotes, and explicit return types on exported functions.
- Keep the dependency surface at zero. Do not add a parsing, rendering, routing, or styling library without discussing it in an issue first — staying dependency-free is a core design goal.

## Commit convention

Use short, imperative commit messages prefixed with a type:

- `feat:` — a new feature or format support.
- `fix:` — a bug fix.
- `refactor:` — a code change that neither fixes a bug nor adds a feature.
- `chore:` — tooling, docs, dependencies, or other maintenance.

For example: `feat: add task list rendering to the Markdown preview`.

## Good first issues

Looking for a place to start? These are welcoming, low-risk areas:

- Add a new format reader in `src/converter.ts` (for example, a plain-text subtitle or log dialect).
- Extend the Markdown renderer in `src/markdown.ts` with a missing syntax such as task lists or footnotes — keep the escaping and link-whitelist guarantees intact.
- Add a new one-click sample in `src/samples.ts`.
- Improve the copy in `README.md` and `README-zh.md`, or fill in a roadmap item.

Please open or claim an issue before starting larger work so efforts are not duplicated. Bug reports with a small reproducible input file are especially helpful.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
