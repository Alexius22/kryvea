# Contributing to Kryvea

Thank you for your interest in contributing to Kryvea! This guide will help you get started.

## Table of Contents

- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Submitting Changes](#submitting-changes)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

## How to Contribute

### Types of Contributions

We welcome:

- **Bug fixes**
- **New features**
- **Documentation improvements**
- **Translations**
- **Tests**
- **UI/UX enhancements**
- **Performance improvements**

## Development Setup

### Prerequisites

- Go 1.24+
- Node.js 18+
- Docker & Docker Compose (for testing)
- NPM (for hot reload)

### Backend Setup (Recommended Docker)

```bash
sudo docker compose up --build
```

### Frontend Setup

```bash
cd web

# Install dependencies
npm install

# Run development server with hot reload
npm run dev
```

## Coding Standards

### Go (Backend)

**Style Guide:**

- Follow standard Go conventions
- Use `gofmt` for formatting
- Keep code clean, small and simple without too many nested functions calls

### TypeScript/React (Frontend)

**Style Guide:**

- Use the provided Prettier config for formatting (.vscode)
- Use functional components
- Write readable TypeScript types for complex props
- Use meaningful and explicit variable names

### Commit Messages

Follow conventional commits:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding/updating tests
- `chore`: Maintenance tasks

**Examples:**

```
feat(api): add CVSS v4 support to vulnerability endpoint

Implements CVSS v4.0 scoring in addition to existing v2/v3/v3.1.
Includes parser, validator, and API integration.

Closes #123
```

```
fix(frontend): resolve session timeout on idle

Previously, sessions would expire during active use due to
incorrect timeout calculation. Now properly resets on activity.

Fixes #456
```

## Submitting Changes

### Pull Request Process

1. **Create a branch:**

```bash
git checkout -b feature/amazing-feature
```

2. **Make your changes:**

- Write code
- Add tests for new functionalities, following single responsibility principle
- Update documentation accordingly

3. **Push to your fork:**

```bash
git push origin feature/amazing-feature
```

4. **Create Pull Request:**

- Go to GitHub
- Click "New Pull Request"
- Fill in the template (provided below)
- Link related issues

### Pull Request Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-reviewed the code
- [ ] Commented complex code
- [ ] Updated documentation
- [ ] No new warnings
```

### Review Process

- Maintainers will review your PR
- Address any requested changes
- Once approved, your PR will be merged
- Celebrate!

## Reporting Bugs

### Before Submitting

- Check existing issues
- Verify it's actually a bug
- Collect debug information

### Bug Report Template

```markdown
**Describe the bug**
Clear description of the bug

**To Reproduce**
Steps to reproduce:

1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen

**Screenshots**
If applicable, add screenshots

**Environment:**

- OS: [e.g., Ubuntu 22.04]
- Docker version: [e.g., 24.0.0]
- Kryvea version: [e.g., 1.0.0]

**Additional context**
Any other relevant information
```

### Providing Logs

```bash
# Collect logs
docker logs kryvea-app > app.log
docker logs kryvea-db > db.log
docker logs kryvea-web > web.log

# Attach to issue
```

## Suggesting Features

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
Clear description of the problem

**Describe the solution you'd like**
What you want to happen

**Describe alternatives you've considered**
Other solutions you've thought about

**Additional context**
Mockups, examples, etc.
```

### Feature Discussion

Before implementing large features:

1. Open a discussion on GitHub
2. Describe the feature
3. Get feedback from maintainers
4. Once approved, create an issue
5. Start implementation

## Documentation

### Adding Documentation

- Update relevant `.md` files in `docs/`
- Include code examples
- Add screenshots for UI changes

### Documentation Standards

- Clear and concise
- Include examples
- Keep updated with code
- Use proper markdown formatting

## Getting Help

- **[Discussions](https://github.com/Alexius22/kryvea/discussions)** - Ask questions
- **[Issues](https://github.com/Alexius22/kryvea/issues)** - Report problems

## Recognition

Contributors will be:

- Mentioned in release notes
- Forever appreciated! ❤️

---

Thank you for contributing to Kryvea!
