# Java 25 Syntax Diagrams

A React + TypeScript single-page app that renders **Java 25 grammar railroad diagrams** (SVG) and shows each rule's **EBNF text** underneath. The grammar is implemented as "diagram factories" that produce railroad-diagram objects.

## Features

- **Railroad Diagrams**: Visual representation of Java 25 grammar rules using SVG
- **EBNF Definitions**: Collapsible EBNF notation below each diagram
- **Section Navigation**: Grammar rules organized by JLS chapter (Lexical, Types, Names, Packages, Classes, Interfaces, Arrays, Statements, Expressions)
- **Search/Filter**: Filter rules by name
- **Dark Mode**: Automatic dark mode support
- **Lazy Rendering**: Sections are collapsed by default for performance with large grammar sets

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npm run typecheck

# Check grammar coverage (diagram ↔ EBNF sync)
npm run check-grammar
```

## Project Structure

```
├── src/
│   ├── main.tsx                    # Entry point
│   ├── app/
│   │   ├── App.tsx                 # Main application component
│   │   └── styles.css              # Global styles
│   ├── components/
│   │   ├── RuleDiagram.tsx         # Individual rule diagram renderer
│   │   └── RuleList.tsx            # List of rule diagrams
│   ├── features/
│   │   └── grammar/
│   │       ├── java25Grammar.ts    # Diagram factories & section definitions
│   │       └── ebnfDefinitions.ts  # EBNF text definitions
│   ├── shared/
│   │   └── railroad/
│   │       └── diagramToSvg.ts     # SVG conversion utility
│   └── types/
│       └── railroad-diagrams.d.ts  # Type declarations
├── scripts/
│   └── check-grammar-coverage.mjs  # Grammar/EBNF drift detection
├── .github/
│   ├── workflows/
│   │   ├── pages.yml               # GitHub Pages deployment
│   │   ├── ci.yml                  # CI pipeline with typecheck
│   │   ├── codeql.yml              # Security scanning
│   │   └── dependency-review.yml   # Dependency vulnerability review
│   └── dependabot.yml              # Automated dependency updates
└── webpack.config.cjs              # Webpack configuration
```

## CI/CD

The project uses GitHub Actions for:

1. **Type Safety**: `npm run typecheck` runs before every build
2. **Grammar Coverage**: `npm run check-grammar` ensures diagram factories and EBNF definitions stay in sync
3. **Security Scanning**: CodeQL analysis on push/PR and weekly schedule
4. **Dependency Review**: Checks PRs for vulnerable dependencies
5. **Automated Deployment**: GitHub Pages deployment on push to main

## Development Notes

### Adding New Grammar Rules

1. Add the diagram factory in `src/features/grammar/java25Grammar.ts`:
   ```typescript
   rules.set("my-new-rule", () =>
     Diagram(
       Sequence(T("keyword"), NT("identifier"))
     )
   );
   ```

2. Add the EBNF definition in `src/features/grammar/ebnfDefinitions.ts`:
   ```typescript
   "my-new-rule": `my-new-rule:
       keyword identifier`,
   ```

3. Add the rule to the appropriate section in `SECTION_RULES`

4. Run `npm run check-grammar` to verify coverage

### SVG Trust Boundary

The `RuleDiagram` component uses `dangerouslySetInnerHTML` to render SVG. This is safe because:
- SVG is generated locally from deterministic factories
- No untrusted user input is processed
- If external grammar loading is added in the future, implement defensive sanitization

## References

- [Java Language Specification SE 25](https://docs.oracle.com/javase/specs/jls/se25/html/index.html)
- [JLS Chapter 19 - Syntax](https://docs.oracle.com/javase/specs/jls/se25/html/jls-19.html)
- [Railroad Diagram (Wikipedia)](https://en.wikipedia.org/wiki/Syntax_diagram)

## License

MIT
