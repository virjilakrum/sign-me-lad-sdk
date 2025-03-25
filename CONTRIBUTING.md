# Contributing to SignMeLad

Thank you for considering contributing to SignMeLad! This document outlines the process for contributing to the project and helps ensure a smooth collaboration experience.

## Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct. Please report unacceptable behavior to the project maintainers.

## How Can I Contribute?

### Reporting Bugs

Before submitting a bug report:
- Check the issue tracker to see if the bug has already been reported
- Make sure you're using the latest version of the SDK
- Collect information to help reproduce the issue

When submitting a bug report, include:
- A clear and descriptive title
- Steps to reproduce the behavior
- Expected behavior vs. actual behavior
- Screenshots or code snippets if applicable
- Environment details (browser, OS, wallet provider, etc.)

### Suggesting Enhancements

Before submitting an enhancement suggestion:
- Check the issue tracker to see if the enhancement has already been suggested
- Consider if the enhancement aligns with the project's goals

When submitting an enhancement suggestion, include:
- A clear and descriptive title
- Detailed description of the proposed functionality
- Justification for the enhancement
- Possible implementation approach

### Pull Requests

1. Fork the repository
2. Create a new branch from `main`
3. Make your changes
4. Add or update tests as necessary
5. Ensure all tests pass
6. Update documentation if needed
7. Submit a pull request

## Development Workflow

### Setting Up Your Development Environment

1. Clone the repository:
   ```bash
   git clone https://github.com/username/signmelad.git
   cd signmelad
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

### Running Tests

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Generate test coverage report:
```bash
npm run test:coverage
```

### Code Style

This project uses ESLint and Prettier for code formatting. Before submitting a pull request, make sure your code passes linting:

```bash
npm run lint
```

To automatically fix linting issues:
```bash
npm run lint:fix
```

## Project Structure

```
signmelad/
├── dist/               # Compiled output
├── docs/               # Generated API documentation
├── src/                # Source code
│   ├── errors/         # Error handling
│   ├── logger/         # Logging system
│   ├── types/          # TypeScript type definitions
│   ├── auth.ts         # Authentication implementation
│   ├── index.ts        # Main entry point
│   ├── server.ts       # Server-side utilities
│   └── utils.ts        # Utility functions
├── tests/              # Test suite
├── demo/               # Demo application
│   ├── backend/        # Example server implementation
│   └── frontend/       # Example client implementation
└── [Configuration files]
```

## Versioning Strategy

This project follows [Semantic Versioning](https://semver.org/):

- MAJOR version for incompatible API changes
- MINOR version for new functionality in a backward-compatible manner
- PATCH version for backward-compatible bug fixes

## Documentation

When adding or modifying functionality, please update the relevant documentation:

- Update JSDoc comments in the code
- Update README.md if necessary
- Update or add examples if appropriate

## Commit Guidelines

Follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types include:
- feat: A new feature
- fix: A bug fix
- docs: Documentation changes
- style: Code style changes (formatting, indentation)
- refactor: Code changes that neither fix bugs nor add features
- perf: Performance improvements
- test: Adding or updating tests
- chore: Changes to the build process or auxiliary tools

## Review Process

Pull requests will be reviewed by project maintainers. The review process includes:

1. Code review
2. Test verification
3. Documentation check

## Release Process

1. Update version in package.json
2. Update CHANGELOG.md
3. Create a new GitHub release
4. Publish to npm

## Questions?

If you have questions about contributing, please open an issue with the prefix "[Question]" in the title.

Thank you for your contributions!
