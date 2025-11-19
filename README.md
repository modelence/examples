# Modelence Examples

This directory contains example projects demonstrating various features and use cases of the Modelence framework.

## Example Projects

### [ai-chat](ai-chat/)
A chat application showcasing AI integration with Modelence. Features authentication UI, React Query integration, and real-time AI-powered conversations.

**Key Features:**
- AI chat functionality using `@modelence/ai`
- User authentication with `@modelence/auth-ui`
- React Query for data management
- React Router for navigation

### [data-api](data-api/)
A full-featured data API example demonstrating REST endpoint creation, MongoDB integration, and comprehensive testing.

**Key Features:**
- MongoDB database integration
- RESTful API endpoints
- Jest unit testing
- Zod schema validation

### [empty-project](empty-project/)
A minimal Modelence project template with the essential setup. Perfect starting point for new projects.

**Key Features:**
- Basic Modelence configuration
- React and React Router setup
- Tailwind CSS styling

### [todo-app](todo-app/)
A comprehensive todo application built with Next.js and Modelence, demonstrating full-stack development patterns.

**Key Features:**
- Next.js integration with `@modelence/next`
- React Query for state management
- Zod for data validation
- Modern React 19

### [typesonic](typesonic/)
An advanced example showcasing custom build configuration with Vite and tsup, along with AI SDK integration.

**Key Features:**
- Custom Vite build setup
- AI SDK with OpenAI integration
- Email functionality with `@modelence/resend`
- Advanced TypeScript configuration

### [voyage-ai](voyage-ai/)
Demonstrates integration with Voyage AI for embeddings and semantic search capabilities.

**Key Features:**
- Voyage AI embeddings integration
- MongoDB for vector storage
- React Query for data fetching
- Semantic search implementation

### [sandbox](sandbox/)
An experimental playground for testing and prototyping Modelence features.

**Key Features:**
- Minimal dependencies
- Quick experimentation environment
- Standard Modelence dev setup


## Getting Started

Each example project can be run independently:

```bash
cd <project-name>
npm install
npm run dev
```

Build for production:
```bash
npm run build
npm start
```

## Common Commands

All projects support these standard commands:
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Run production build
- `npm test` - Run tests (where configured)

## Updating Package Versions

This repository includes a utility script to update package versions across all example projects simultaneously.

### Usage

The `update-package.sh` script allows you to update any package to a specific version or to the latest version across all examples.

#### Update to a specific version:
```bash
./update-package.sh <package-name> <version>
```

**Example:**
```bash
./update-package.sh modelence 0.6.21
```

This will:
1. Update the package version in each project's `package.json`
2. Run `npm install` in each project to update `package-lock.json` and `node_modules`
3. Skip projects that don't use the specified package
4. Provide a summary of successes, skips, and failures

#### Update to the latest version:
```bash
./update-package.sh <package-name>
```

**Example:**
```bash
./update-package.sh modelence
```

This will install the latest available version of the package in all applicable projects.

### Script Features

- **Automatic project discovery**: Finds all projects with `package.json` automatically
- **Smart skipping**: Only updates projects that actually use the specified package
- **Color-coded output**: Easy-to-read success, warning, and error messages
- **Summary report**: Shows total successes, skips, and failures
- **Cross-platform**: Works on both macOS and Linux

### Common Use Cases

Update core Modelence package across all examples:
```bash
./update-package.sh modelence 0.7.0
```

Update React to latest:
```bash
./update-package.sh react
```

Update a Modelence plugin to a specific version:
```bash
./update-package.sh @modelence/react-query 1.0.3
```