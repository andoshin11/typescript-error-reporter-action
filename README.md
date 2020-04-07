# TypeScript Error Reporter Action ![GitHub release (latest SemVer including pre-releases)](https://img.shields.io/github/v/release/andoshin11/typescript-error-reporter?include_prereleases) ![GitHub](https://img.shields.io/github/license/andoshin11/typescript-error-reporter)

Ensuring type safety is one of the most important responsibilities of modern software developers.

This action uses the [TypeScript Compiler API](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API) to run a static type check on your code and display the results of the check.

![TypeScript Error Reporter Action](https://user-images.githubusercontent.com/8381075/78413929-a40f0680-7654-11ea-8365-0ef72fb4d6b3.png)

## Example Configuration

`.github/workflows/test.yml`:

```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [13.x]
    steps:
      - uses: actions/checkout@v1
      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v1
        with:
          node-version: ${{ matrix.node-version }}
      - name: Install dependencies
        run: yarn install --frozen-lockfile
      - name: Typecheck
        uses: andoshin11/typescript-error-reporter-action@v1.0.1
```

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "es5",
    "module": "commonjs",
    "strict": true,
    "skipLibCheck": true,
    "moduleResolution": "node",
    "types": ["node"],
    "lib": ["ES2017"]
  },
  "include": ["src/**/*.ts"]
}
```
