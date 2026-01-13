# Java Syntax Diagrams

Interactive railroad diagrams (syntax diagrams) for the Java programming language, based on the Java Language Specification (JLS) SE 21.

## Overview

This project provides a visual representation of Java's grammar using railroad diagrams. These diagrams make it easier to understand the syntax structure of Java by providing a graphical alternative to BNF notation.

The grammar rules are organized by JLS chapter:
- **§3 Lexical Structure** - Identifiers and literals
- **§4 Types, Values, and Variables** - Primitive types, reference types, type parameters
- **§6 Names** - Module, package, type, expression, and method names
- **§7 Packages and Modules** - Compilation units, package and import declarations, modules
- **§8 Classes** - Class declarations, fields, methods, constructors, enums, records
- **§9 Interfaces** - Interface declarations, annotations
- **§10 Arrays** - Array initializers
- **§14 Blocks, Statements, and Patterns** - All statement types, patterns, try-catch
- **§15 Expressions** - All expression types, lambda expressions, method references

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm

### Installation

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5174`.

### Production Build

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Type Checking

```bash
npm run typecheck
```

## Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Webpack 5** - Bundling
- **@prantlf/railroad-diagrams** - Railroad diagram generation

## Project Structure

```
java-syntax-diagrams/
├── src/
│   ├── main.tsx                          # Entry point
│   ├── app/
│   │   ├── App.tsx                       # Main application component
│   │   └── styles.css                    # Global styles
│   ├── components/
│   │   ├── RuleDiagram.tsx               # Individual rule diagram
│   │   └── RuleList.tsx                  # List of rule diagrams
│   ├── features/
│   │   └── grammar/
│   │       └── javaGrammar.ts            # Java grammar definitions
│   ├── shared/
│   │   └── railroad/
│   │       └── diagramToSvg.ts           # SVG rendering utility
│   └── types/
│       └── railroad-diagrams.d.ts        # Type declarations
├── .github/
│   ├── dependabot.yml
│   └── workflows/
│       ├── codeql.yml
│       ├── dependency-review.yml
│       └── pages.yml
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.webpack.json
└── webpack.config.cjs
```

## References

- [Java Language Specification SE 21](https://docs.oracle.com/javase/specs/jls/se21/html/index.html)
- [JLS Chapter 19 - Syntax](https://docs.oracle.com/javase/specs/jls/se21/html/jls-19.html)
- [Railroad Diagram (Wikipedia)](https://en.wikipedia.org/wiki/Syntax_diagram)

## License

MIT
