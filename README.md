# Auth Service

A robust authentication service built with NestJS that provides secure user authentication and management using Auth0 integration.

## Overview

This service handles user authentication, token management, and user synchronization with Auth0. It provides a secure and scalable solution for managing user authentication in your application.

### Key Features

- Auth0 integration for secure authentication
- JWT token verification and management
- User synchronization with local database
- Password-based authentication
- OAuth2 code exchange flow
- Secure token handling and verification

## Prerequisites

- Node.js (v18 or higher)
- pnpm (v8 or higher)
- PostgreSQL database
- Auth0 account and application setup

## Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
# Auth0 Configuration
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
AUTH0_AUDIENCE=your-api-identifier
AUTH0_CALLBACK_URL=http://localhost:3000/callback

# Database Configuration
DATABASE_URL="postgresql://user:password@localhost:5432/dbname?schema=public"
```

## Installation

```bash
# Install dependencies
$ pnpm install

# Generate Prisma client
$ pnpm prisma generate

# Run database migrations
$ pnpm prisma migrate dev
```

## Running the Application

```bash
# Development mode
$ pnpm run start:dev

# Production mode
$ pnpm run build
$ pnpm run start:prod
```

## API Documentation

Once the application is running, you can access the Swagger API documentation at:

```
http://localhost:3000/docs
```

## Authentication Flows

### OAuth2 Code Flow
1. Redirect users to Auth0 login page
2. Handle callback with authorization code
3. Exchange code for tokens
4. Verify and process ID token
5. Sync user data with local database

### Password Flow
1. Authenticate users with username/password
2. Receive and verify tokens
3. Process user profile data

## Development

### Project Structure

```
src/
├── auth/           # Authentication related code
├── prisma/         # Database configuration and models
├── main.ts         # Application entry point
└── app.module.ts   # Root application module
```

### Testing

```bash
# Unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# Test coverage
$ pnpm run test:cov
```

### Code Style

```bash
# Format code
$ pnpm run format

# Lint code
$ pnpm run lint
```

## Security Considerations

- All tokens are verified using Auth0's JWKS endpoint
- JWT tokens are validated for signature, expiration, and claims
- CSRF protection is implemented
- Helmet is used for security headers
- Environment variables are used for sensitive configuration

## Contributing

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification for our commit messages. This helps maintain a clean and consistent git history.

### Branch Naming Convention

Branches should be named following this pattern:
```
<type>/<ticket-number>-<short-description>
```

Types:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `style/` - Code style changes (formatting, etc.)
- `refactor/` - Code refactoring
- `test/` - Adding or modifying tests
- `chore/` - Maintenance tasks

Example: `feature/EX-19-add-user-profile`

### Commit Message Format

Each commit message consists of a **header**, a **body**, and a **footer**:

```
<type>(<scope>): <subject>

<body>

<footer>
```

The **header** is mandatory and must conform to the Commit Message Header format.

#### Commit Message Header

```
<type>(<scope>): <subject>
```

The **type** must be one of the following:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

The **scope** is optional and represents the section of the codebase that the commit affects.

The **subject** contains a succinct description of the change:
- Use the imperative, present tense: "change" not "changed" nor "changes"
- Don't capitalize the first letter
- No dot (.) at the end

#### Commit Message Body

The body should include the motivation for the change and contrast this with previous behavior.

#### Commit Message Footer

The footer should contain any information about **Breaking Changes** and is also the place to reference GitHub issues that this commit **Closes**.

### Pull Request Process

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/EX-19-amazing-feature`)
3. Make your changes following the commit message guidelines
4. Push to the branch (`git push origin feature/EX-19-amazing-feature`)
5. Open a Pull Request with a clear description of the changes
6. Ensure all CI checks pass
7. Get at least one code review approval
8. Merge only after approval

### Example Commit Messages

```
feat(auth): add password reset functionality

- Add password reset endpoint
- Implement email notification
- Add rate limiting for security

Closes #123
```

```
fix(api): resolve token validation issue

- Fix JWT token validation logic
- Add proper error handling
- Update tests to cover edge cases

BREAKING CHANGE: Token validation now requires additional claims
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
