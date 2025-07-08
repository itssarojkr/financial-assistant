# Coding Guidelines & Clean Architecture Rules

These guidelines are intended for all projects to ensure code quality, maintainability, security, and accessibility.

## General Principles
- Use up-to-date, non-deprecated libraries/APIs and syntax.
- Organize code into folders by type and usage for readability and extensibility.
- Use meaningful names for files, variables, functions, and components.
- Write small, modular functions and components.
- Add comments and documentation for all non-trivial logic.

## Accessibility
- Use semantic HTML elements.
- Add ARIA attributes and alt texts where appropriate.
- Ensure keyboard navigation and screen reader support.

## Responsive Design
- Use media queries and fluid layouts.
- Set viewport meta tags for mobile support.
- Test on multiple screen sizes and devices.

## Security
- Sanitize all user input.
- Use HTTPS for all network communication.
- Never hardcode secrets or credentials in the codebase.
- Follow secure authentication and authorization practices.
- Apply secure coding patterns to prevent XSS, CSRF, and injection attacks.

## Performance & Maintainability
- Avoid inline styles; use CSS modules, styled components, or utility frameworks.
- Prefer modular, reusable components and services.
- Use architectural best practices (e.g., clean architecture, separation of concerns).
- Optimize for performance: lazy loading, memoization, code splitting, and efficient data fetching.

## API & Network Calls
- Use async/await or coroutines for asynchronous operations.
- Handle errors and loading states gracefully.
- Implement caching and retry logic where appropriate.
- Never block the UI thread with long-running operations.

## Platform Requirements
- For web: pass Lighthouse accessibility and performance checks.
- For Android/iOS: request only necessary permissions, follow platform guidelines.

## Testing & Quality
- Write comprehensive unit and integration tests.
- Maintain high test and type coverage.
- Use linters and formatters (e.g., ESLint, Prettier) to enforce code style.
- Avoid deprecated/insecure logic, memory leaks, and bad lifecycle handling.
- Keep build tools and dependencies up to date and properly configured.

---

_These guidelines should be referenced and adapted for all new projects to ensure a high standard of code quality and maintainability._ 