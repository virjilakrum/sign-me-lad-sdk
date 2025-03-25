# Publishing to npm

To publish the SignMeLad package to npm, follow these steps:

1. **Ensure the package builds correctly**:
   ```bash
   npm run build
   ```
   This will create the `dist` directory with the compiled files.

2. **Log in to npm** (if you haven't already):
   ```bash
   npm login
   ```
   Enter your npm username, password, and email when prompted.

3. **Publish the package**:
   ```bash
   npm publish --access public
   ```

## Configuration Settings

The package is already configured for npm publishing:

- **package.json** has the correct settings:
  - `name`: "signmelad"
  - `main`: "dist/index.js"
  - `types`: "dist/index.d.ts" 
  - `files`: ["dist/**/*", "LICENSE", "README.md", "BROWSER_COMPATIBILITY.md"]

- **.npmignore** excludes unnecessary files:
  - Source code (src/)
  - Test files (tests/)
  - Development configuration files (.eslintrc.json, etc.)
  - The demo directory (demo/)

## Versioning

When updating the package:

1. Use npm's versioning command to increment the version:
   ```bash
   # For patch updates (bug fixes)
   npm version patch

   # For minor updates (non-breaking features)
   npm version minor

   # For major updates (breaking changes)
   npm version major
   ```

2. Then publish:
   ```bash
   npm publish
   ```

## Scoped Packages

If you prefer to publish under a scope (e.g., @yourname/signmelad):

1. Change the name in package.json to `@yourname/signmelad`
2. Publish with:
   ```bash
   npm publish --access public
   ```

## Verify Publication

After publishing, verify your package is available:
https://www.npmjs.com/package/signmelad

Users can then install your package via:
```bash
npm install signmelad
```
